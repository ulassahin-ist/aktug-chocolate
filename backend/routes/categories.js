// routes/categories.js
const express = require("express");
const router = express.Router();
const { getPool } = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Helper: resolve branchId from req
function resolveBranchId(req) {
  // 1) Prefer logged-in user (JWT)
  if (req.user?.branchId) return req.user.branchId;

  // 2) Fallback – query param (for public/QR access)
  if (req.query?.branchId) return Number(req.query.branchId) || null;

  // 3) Fallback – body (mainly for POST/PUT if needed)
  if (req.body?.branchId) return Number(req.body.branchId) || null;

  return null;
}

// 🔹 Get categories for a branch (admin only for settings)
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const { branchId } = req.query;

    const params = [];
    let sql = `
      SELECT 
        c.id,
        c.branchId,
        c.name,
        c.sortOrder,
        COUNT(mi.id) AS itemCount
      FROM Categories c
      LEFT JOIN MenuItems mi 
        ON mi.categoryId = c.id
      WHERE 1=1
    `;

    if (branchId) {
      sql += " AND c.branchId = ?";
      params.push(branchId);
    }

    sql += `
      GROUP BY 
        c.id, c.branchId, c.name, c.sortOrder
      ORDER BY 
        c.sortOrder ASC, c.name ASC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
router.get(
  "/uncategorized-count",
  verifyToken,
  authorizeRoles("admin"), // or ("staff","admin") if you want staff to see it too
  async (req, res) => {
    try {
      const pool = getPool();

      // Reuse the same logic style as other routes
      const branchId = req.query?.branchId || req.user?.branchId || null;

      if (!branchId) {
        return res
          .status(400)
          .json({ error: "Branch ID is required for uncategorized count." });
      }

      const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS cnt
        FROM MenuItems
        WHERE branchId = ?
          AND (categoryId IS NULL OR categoryId = 0)
      `,
        [branchId]
      );

      const count = Number(rows[0]?.cnt || 0);
      res.json({ count });
    } catch (err) {
      console.error("❌ GET /categories/uncategorized-count error:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch uncategorized item count." });
    }
  }
);
// 🔹 Reorder categories (admin only)
router.post(
  "/reorder",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { order, branchId } = req.body; // order is array of category IDs

      if (!Array.isArray(order) || !branchId) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const pool = getPool();
      const conn = await pool.getConnection();
      await conn.beginTransaction();

      try {
        // Update sortOrder for each category
        for (let i = 0; i < order.length; i++) {
          const categoryId = order[i];
          await conn.query(
            "UPDATE Categories SET sortOrder = ? WHERE id = ? AND branchId = ?",
            [i, categoryId, branchId]
          );
        }

        await conn.commit();
        res.json({ success: true, message: "Category order updated" });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error("❌ Failed to reorder categories:", err);
      res.status(500).json({ error: "Failed to update category order" });
    }
  }
);

// ➕ Create or update category (branch-scoped)
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id, name } = req.body;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to save category." });
    }

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name required." });
    }

    const trimmedName = name.trim();

    if (id) {
      // 🔁 UPDATE category name (only in this branch)
      const [result] = await pool.query(
        "UPDATE Categories SET name = ? WHERE id = ? AND branchId = ?",
        [trimmedName, id, branchId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Category not found in this branch." });
      }

      const [rows] = await pool.query(
        `
        SELECT 
          c.id,
          c.branchId,
          c.name,
          c.sortOrder,
          (
            SELECT COUNT(*) 
            FROM MenuItems mi 
            WHERE mi.categoryId = c.id
          ) AS itemCount
        FROM Categories c
        WHERE c.id = ? AND c.branchId = ?
        `,
        [id, branchId]
      );
      const updated = rows[0] || null;
      return res.json(updated);
    } else {
      // 🆕 INSERT new category for this branch at the end of the list

      // Find current max sortOrder for this branch
      const [maxRows] = await pool.query(
        "SELECT COALESCE(MAX(sortOrder), -1) AS maxSortOrder FROM Categories WHERE branchId = ?",
        [branchId]
      );
      const maxSortOrder = maxRows[0]?.maxSortOrder ?? -1;
      const nextSortOrder = maxSortOrder + 1;

      try {
        const [insertResult] = await pool.query(
          "INSERT INTO Categories (branchId, name, sortOrder) VALUES (?, ?, ?)",
          [branchId, trimmedName, nextSortOrder]
        );
        const newId = insertResult.insertId;

        const [rows] = await pool.query(
          `
          SELECT 
            c.id,
            c.branchId,
            c.name,
            c.sortOrder,
            (
              SELECT COUNT(*) 
              FROM MenuItems mi 
              WHERE mi.categoryId = c.id
            ) AS itemCount
          FROM Categories c
          WHERE c.id = ? AND c.branchId = ?
          `,
          [newId, branchId]
        );
        const newCat = rows[0] || null;
        return res.json(newCat);
      } catch (err) {
        // MariaDB unique error
        if (String(err.code) === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ error: "Category already exists for this branch." });
        }
        throw err;
      }
    }
  } catch (err) {
    console.error("❌ POST /categories error:", err);
    res.status(500).json({ error: "Failed to save category." });
  }
});

// ❌ Delete category (only if no items, branch-scoped)
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id } = req.params;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to delete category." });
    }

    // Check category exists in this branch
    const [catRows] = await pool.query(
      "SELECT id, name FROM Categories WHERE id = ? AND branchId = ?",
      [id, branchId]
    );
    const cat = catRows[0];

    if (!cat) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Check if any menu items linked
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM MenuItems WHERE categoryId = ?",
      [id]
    );
    const count = countRows[0]?.count || 0;

    if (count > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${cat.name}" because ${count} menu items are linked.`,
      });
    }

    // Delete
    await pool.query("DELETE FROM Categories WHERE id = ? AND branchId = ?", [
      id,
      branchId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /categories error:", err);
    res.status(500).json({ error: "Failed to delete category." });
  }
});

module.exports = router;

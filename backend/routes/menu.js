// routes/menu.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getPool } = require("../config/db");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.params.id || Date.now();
    cb(null, `menu_${id}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * Helper: resolve branchId from request
 * - 1) JWT (req.user.branchId) if logged in
 * - 2) query ?branchId= for public/QR
 * - 3) body.branchId as a fallback for POST/PUT
 */
function resolveBranchId(req) {
  if (req.user?.branchId) return req.user.branchId;
  if (req.query?.branchId) return Number(req.query.branchId) || null;
  if (req.body?.branchId) return Number(req.body.branchId) || null;
  return null;
}

// 🧾 Get all menu items (for a branch)
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to fetch menu items." });
    }

    const [items] = await pool.query(
      `
        SELECT 
          m.*,
          c.name      AS categoryName,
          c.sortOrder AS categorySortOrder
        FROM MenuItems m
        LEFT JOIN Categories c ON m.categoryId = c.id
        WHERE m.branchId = ?
        ORDER BY 
          c.sortOrder IS NULL ASC,   -- categories with sortOrder first, NULLs last
          c.sortOrder ASC,
          c.name ASC,
          m.name ASC
      `,
      [branchId]
    );

    res.json(items);
  } catch (err) {
    console.error("❌ GET /menu error:", err);
    res.status(500).json({ error: "Failed to fetch menu items." });
  }
});

// ✅ Get menu items by category ID (for client menu page)
router.get("/category/:id", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id: categoryId } = req.params;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to fetch category items." });
    }

    const [items] = await pool.query(
      `
        SELECT 
          m.*,
          c.name      AS categoryName,
          c.sortOrder AS categorySortOrder
        FROM MenuItems m
        LEFT JOIN Categories c ON m.categoryId = c.id
        WHERE m.categoryId = ?
          AND m.branchId = ?
          AND m.available = 1
        ORDER BY 
          c.sortOrder ASC,
          m.name ASC
      `,
      [categoryId, branchId]
    );

    res.json(items);
  } catch (err) {
    console.error("❌ GET /menu/category/:id error:", err);
    res.status(500).json({ error: "Failed to fetch category items." });
  }
});

// ➕ Add or update item (branch-scoped)
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id, name, description, categoryId, price, stock, available } =
      req.body;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to save menu item." });
    }

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }

    const availableValue = Number(available) ? 1 : 0;

    if (id) {
      // UPDATE (only in this branch)
      const [result] = await pool.query(
        `
        UPDATE MenuItems
        SET name = ?, description = ?, categoryId = ?, price = ?, stock = ?, available = ?
        WHERE id = ? AND branchId = ?
      `,
        [
          name,
          description,
          categoryId || null,
          price,
          stock,
          availableValue,
          id,
          branchId,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Menu item not found in this branch." });
      }

      return res.json({ success: true });
    } else {
      // INSERT new item for this branch
      const [insertResult] = await pool.query(
        `
        INSERT INTO MenuItems (branchId, name, description, categoryId, price, stock, available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          branchId,
          name,
          description || null,
          categoryId || null,
          price || 0,
          stock || 0,
          availableValue,
        ]
      );

      const newId = insertResult.insertId;
      const [rows] = await pool.query(
        "SELECT * FROM MenuItems WHERE id = ? AND branchId = ?",
        [newId, branchId]
      );
      const newItem = rows[0] || null;
      return res.json(newItem);
    }
  } catch (err) {
    console.error("❌ POST /menu error:", err);
    res.status(500).json({ error: "Failed to add or update menu item." });
  }
});

// 📸 Upload photo (branch-scoped)
router.post("/:id/photo", upload.single("photo"), async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id } = req.params;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to upload photo." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      "UPDATE MenuItems SET photo = ? WHERE id = ? AND branchId = ?",
      [filePath, id, branchId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Menu item not found in this branch." });
    }

    res.json({ success: true, photo: filePath });
  } catch (err) {
    console.error("❌ POST /menu/:id/photo error:", err);
    res.status(500).json({ error: "Failed to upload photo." });
  }
});

// ❌ Delete item (branch-scoped)
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const branchId = resolveBranchId(req);
    const { id } = req.params;

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID is required to delete menu item." });
    }

    // Fetch item (to delete photo file if exists)
    const [rows] = await pool.query(
      "SELECT * FROM MenuItems WHERE id = ? AND branchId = ?",
      [id, branchId]
    );
    const item = rows[0];

    if (!item) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    if (item.photo) {
      const filePath = path.join(
        __dirname,
        "..",
        item.photo.replace(/^\//, "")
      );
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error("Failed to delete photo file:", fileErr);
        }
      }
    }

    await pool.query("DELETE FROM MenuItems WHERE id = ? AND branchId = ?", [
      id,
      branchId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /menu error:", err);
    res.status(500).json({ error: "Failed to delete menu item." });
  }
});

module.exports = router;

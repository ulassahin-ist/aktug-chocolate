// routes/branches.js
const express = require("express");
const router = express.Router();
const { getPool } = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🔹 Get all branches (admin only)
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT
        id,
        code,
        name,
        country,
        timezone,
        currency,
        active,
        menuDefaultStock,
        menuDefaultPrice,
        stockWarnEnabled,
        stockWarnThreshold,
        showInactiveMenuItems,
        showOutOfStockItems,
        ordersAutoRefreshEnabled,
        ordersAutoRefreshSeconds
      FROM Branches
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /branches error:", err);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

router.post(
  "/:id/settings",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const pool = getPool();
      const { id } = req.params;

      const {
        menuDefaultStock,
        menuDefaultPrice,
        stockWarnEnabled,
        stockWarnThreshold,
        showInactiveMenuItems,
        showOutOfStockItems,
        ordersAutoRefreshEnabled,
        ordersAutoRefreshSeconds,
      } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: "Branch id is required." });
      }

      await pool.query(
        `
        UPDATE Branches
        SET
          menuDefaultStock = ?,
          menuDefaultPrice = ?,
          stockWarnEnabled = ?,
          stockWarnThreshold = ?,
          showInactiveMenuItems = ?,
          showOutOfStockItems = ?,
          ordersAutoRefreshEnabled = ?,
          ordersAutoRefreshSeconds = ?
        WHERE id = ?
      `,
        [
          Number(menuDefaultStock ?? 20),
          Number(menuDefaultPrice ?? 400),
          stockWarnEnabled ? 1 : 0,
          Number(stockWarnThreshold ?? 5),
          showInactiveMenuItems ? 1 : 0,
          showOutOfStockItems ? 1 : 0,
          ordersAutoRefreshEnabled ? 1 : 0,
          Number(ordersAutoRefreshSeconds ?? 15),
          id,
        ]
      );

      const [rows] = await pool.query(
        `
        SELECT
          id,
          code,
          name,
          country,
          timezone,
          currency,
          active,
          menuDefaultStock,
          menuDefaultPrice,
          stockWarnEnabled,
          stockWarnThreshold,
          showInactiveMenuItems,
          showOutOfStockItems,
          ordersAutoRefreshEnabled,
          ordersAutoRefreshSeconds
        FROM Branches
        WHERE id = ?
        `,
        [id]
      );

      res.json(rows[0] || null);
    } catch (err) {
      console.error("❌ POST /branches/:id/settings error:", err);
      res.status(500).json({ error: "Failed to save branch settings" });
    }
  }
);

module.exports = router;

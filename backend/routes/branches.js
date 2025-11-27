// routes/branches.js
const express = require("express");
const router = express.Router();
const { getPool } = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🔹 Get all branches (admin only)
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const [branches] = await pool.query(
      "SELECT * FROM Branches WHERE active = 1 ORDER BY name ASC"
    );
    res.json(branches);
  } catch (err) {
    console.error("❌ Failed to fetch branches:", err);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

module.exports = router;

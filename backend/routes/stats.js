const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/reportController");

router.get("/", verifyToken, authorizeRoles("staff", "admin"), getStats);

module.exports = router;

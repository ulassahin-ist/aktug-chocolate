const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createOrder,
  getActiveOrders,
  completeOrder,
  getCompletedOrders,
} = require("../controllers/orderController");

// 👇 PUBLIC: QR / anonymous customers can create orders
router.post("/create", createOrder);

// ✅ Only waiter or admin can see active orders
router.get(
  "/active",
  verifyToken,
  authorizeRoles("staff", "admin"),
  getActiveOrders
);

// ✅ Only waiter or admin can mark order completed
router.put(
  "/complete",
  verifyToken,
  authorizeRoles("staff", "admin"),
  completeOrder
);

// ✅ Only waiter or admin can get completed order list
router.get(
  "/completed",
  verifyToken,
  authorizeRoles("staff", "admin"),
  getCompletedOrders
);

module.exports = router;

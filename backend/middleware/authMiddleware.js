// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { uid, username, role, branchId }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};

exports.requireBranch = (req, res, next) => {
  if (!req.user?.branchId) {
    return res.status(400).json({ message: "Branch ID missing in token" });
  }
  next();
};

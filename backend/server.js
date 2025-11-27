// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb } = require("./config/dbInit");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const menuRoutes = require("./routes/menu");
const categoryRoutes = require("./routes/categories");
const statsRoutes = require("./routes/stats");
const branchRoutes = require("./routes/branches");

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/branches", branchRoutes);

// Simple health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Start
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb(); // ⬅️ ensures DB + tables + seeds, and creates pool
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

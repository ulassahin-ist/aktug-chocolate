// ============================================
// backend/server.js
// ============================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb } = require("./config/dbInit");

const app = express();

// ✅ CORS - Allow frontend origin
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aktugchocolate.com",
      "https://www.aktugchocolate.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve static uploads BEFORE routes (no /api prefix)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Mount API routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const menuRoutes = require("./routes/menu");
const categoryRoutes = require("./routes/categories");
const statsRoutes = require("./routes/stats");
const branchRoutes = require("./routes/branches");

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/menu", menuRoutes);
app.use("/categories", categoryRoutes);
app.use("/stats", statsRoutes);
app.use("/branches", branchRoutes);

// ✅ Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

// ============================================
// URL Structure:
// ============================================
//
// API routes:
// http://84.247.20.171:5000/menu         ← GET menu items
// http://84.247.20.171:5000/orders       ← POST create order
// http://84.247.20.171:5000/auth/login   ← POST login
//
// Static files:
// http://84.247.20.171:5000/uploads/menu_1.jpg  ← Images

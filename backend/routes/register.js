const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ REGISTER
router.post("/register", (req, res) => {
  const { fullName, username, phone, password } = req.body;

  // ✅ Check missing fields
  if (!fullName || !username || !phone || !password)
    return res.status(400).json({ error: "Alanlar eksik" });

  // ✅ Check if username exists
  const exists = db
    .prepare("SELECT id FROM Users WHERE username = ?")
    .get(username);
  if (exists)
    return res.status(400).json({ error: "Kullanıcı adı kullanımda" });

  // ✅ Hash password
  const hash = bcrypt.hashSync(password, 10);

  // ✅ Insert user
  const result = db
    .prepare(
      `INSERT INTO Users (fullName, username, phone, password, role)
       VALUES (?, ?, ?, ?, 'customer')`
    )
    .run(fullName, username, phone, hash);

  const user = db
    .prepare(
      "SELECT id, fullName, username, phone, role FROM Users WHERE id = ?"
    )
    .get(result.lastInsertRowid);

  // ✅ Generate token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({ token, user });
});

// ✅ LOGIN (make sure this already exists)
router.post("/login", (req, res) => {
  // your existing login code...
});

module.exports = router;

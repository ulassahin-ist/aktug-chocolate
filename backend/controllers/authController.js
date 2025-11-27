// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getPool } = require("../config/db");
const { sendVerificationEmail } = require("../utils/emailService");
require("dotenv").config();

function splitFullName(fullName) {
  if (!fullName) return { name: null, surname: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: null };
  return { name: parts[0], surname: parts.slice(1).join(" ") };
}

/**
 * 📝 REGISTER - Create pending user and send verification email
 */
exports.register = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı en az 3 karakter olmalı." });
    }
    if (password.length < 1) {
      return res.status(400).json({ error: "Şifre en az 1 karakter olmalı." });
    }

    const pool = getPool();

    // Check if username already exists in Users table
    const [existingUser] = await pool.query(
      "SELECT id FROM Users WHERE username = ? LIMIT 1",
      [username.trim()]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
    }

    // Check if already pending verification
    const [existingPending] = await pool.query(
      "SELECT id FROM PendingUsers WHERE username = ? LIMIT 1",
      [username.trim()]
    );
    if (existingPending.length > 0) {
      return res.status(400).json({
        error:
          "Bu e-posta adresi için zaten bir doğrulama bekleniyor. Lütfen e-postanızı kontrol edin.",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const { name, surname } = splitFullName(fullName);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000 * 3; // 72 hours

    // Insert into PendingUsers
    await pool.query(
      `INSERT INTO PendingUsers (username, password, name, surname, verificationToken, tokenExpiry)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username.trim(), hash, name, surname, verificationToken, tokenExpiry]
    );

    // Send verification email
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify?token=${verificationToken}`;

    try {
      await sendVerificationEmail(username.trim(), fullName, verificationUrl);
    } catch (emailErr) {
      console.error("❌ Email send failed:", emailErr);
      // Delete pending user if email fails
      await pool.query("DELETE FROM PendingUsers WHERE verificationToken = ?", [
        verificationToken,
      ]);
      return res.status(500).json({
        error:
          "E-posta gönderilemedi. Lütfen geçerli bir e-posta adresi kullanın.",
      });
    }

    res.json({
      success: true,
      message:
        "Kayıt başarılı! Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

/**
 * ✅ VERIFY EMAIL - Move user from PendingUsers to Users
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Doğrulama token'ı eksik." });
    }

    const pool = getPool();

    // Find pending user
    const [pending] = await pool.query(
      "SELECT * FROM PendingUsers WHERE verificationToken = ? LIMIT 1",
      [token]
    );

    if (pending.length === 0) {
      return res.status(400).json({
        error: "Geçersiz veya süresi dolmuş doğrulama linki.",
      });
    }

    const user = pending[0];

    // Check expiry
    if (Date.now() > user.tokenExpiry) {
      await pool.query("DELETE FROM PendingUsers WHERE id = ?", [user.id]);
      return res.status(400).json({
        error: "Doğrulama linki süresi doldu. Lütfen tekrar kayıt olun.",
      });
    }

    // Move to Users table
    await pool.query(
      `INSERT INTO Users (username, password, name, surname, usertype, branchId)
       VALUES (?, ?, ?, ?, 'customer', NULL)`,
      [user.username, user.password, user.name, user.surname]
    );

    // Delete from PendingUsers
    await pool.query("DELETE FROM PendingUsers WHERE id = ?", [user.id]);

    res.json({
      success: true,
      message: "E-posta başarıyla doğrulandı! Artık giriş yapabilirsiniz.",
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

/**
 * 🔑 LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { username, password, branchId } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı ve şifre zorunludur." });
    }
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID zorunludur." });
    }

    const pool = getPool();

    // Validate branch
    const [bRows] = await pool.query(
      "SELECT id FROM Branches WHERE id = ? LIMIT 1",
      [branchId]
    );
    if (bRows.length === 0) {
      return res.status(400).json({ message: "Geçersiz şube (branchId)." });
    }

    // Find user
    const [rows] = await pool.query(
      "SELECT id, username, password, usertype, branchId FROM Users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      // Check if still pending verification
      const [pendingRows] = await pool.query(
        "SELECT id FROM PendingUsers WHERE username = ? LIMIT 1",
        [username]
      );

      if (pendingRows.length > 0) {
        return res.status(403).json({
          message:
            "Hesabınız henüz doğrulanmadı. Lütfen e-postanızı kontrol edin.",
        });
      }

      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Şifre yanlış" });
    }

    const payload = {
      uid: user.id,
      username: user.username,
      role: user.usertype,
      branchId: branchId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.usertype,
        branchId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

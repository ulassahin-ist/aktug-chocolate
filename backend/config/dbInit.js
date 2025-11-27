// config/dbInit.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { createPool } = require("./db");

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;

async function ensureDatabase() {
  const root = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    multipleStatements: true,
  });

  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );

  await root.end();
}

async function runMigrations(pool) {
  // --- Branches ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      country VARCHAR(100),
      timezone VARCHAR(64) DEFAULT 'Europe/Istanbul',
      currency VARCHAR(8) DEFAULT 'TRY',
      active TINYINT(1) DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // --- Users ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      surname VARCHAR(100),
      usertype ENUM('customer','staff','admin') DEFAULT 'customer',
      branchId INT NULL,
      active TINYINT(1) DEFAULT 1,
      basket JSON DEFAULT (JSON_ARRAY()),
      refreshToken VARCHAR(255),
      resetToken VARCHAR(255),
      resetTokenExpiry BIGINT,
      lastLogin DATETIME NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branchId) REFERENCES Branches(id)
        ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB;
  `);

  // --- 🆕 PendingUsers (for email verification) ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS PendingUsers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      surname VARCHAR(100),
      verificationToken VARCHAR(255) UNIQUE NOT NULL,
      tokenExpiry BIGINT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (verificationToken),
      INDEX idx_expiry (tokenExpiry)
    ) ENGINE=InnoDB;
  `);

  // --- Categories ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branchId INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      sortOrder INT NOT NULL DEFAULT 0,
      UNIQUE KEY u_branch_name (branchId, name),
      FOREIGN KEY (branchId) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_sort (branchId, sortOrder)
    ) ENGINE=InnoDB;
  `);

  // --- MenuItems ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS MenuItems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branchId INT NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      photo VARCHAR(255),
      categoryId INT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INT DEFAULT 0,
      available TINYINT(1) DEFAULT 0,
      FOREIGN KEY (branchId) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES Categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
      KEY idx_menu_branch (branchId)
    ) ENGINE=InnoDB;
  `);

  // --- Orders ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branchId INT NOT NULL,
      userId INT NULL,
      total DECIMAL(10,2) DEFAULT 0,
      active TINYINT(1) DEFAULT 1,
      orderTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      tableId INT NULL,
      notes TEXT,
      FOREIGN KEY (branchId) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_order_branch (branchId),
      INDEX idx_orderTime (orderTime),
      INDEX idx_active (active),
      INDEX idx_tableId (tableId)
    ) ENGINE=InnoDB;
  `);

  // --- OrderItems ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS OrderItems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      itemId INT NULL,
      qty INT NOT NULL,
      priceAtTime DECIMAL(10,2) NOT NULL,
      CONSTRAINT fk_orderitems_order
        FOREIGN KEY (orderId) REFERENCES Orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_orderitems_item
        FOREIGN KEY (itemId) REFERENCES MenuItems(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_orderId (orderId),
      INDEX idx_itemId (itemId)
    ) ENGINE=InnoDB;
  `);
}

async function runSeeds(pool) {
  // Seed branches
  const branches = [
    {
      code: "IST",
      name: "Istanbul",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      currency: "TRY",
    },
    {
      code: "MLA",
      name: "Malta",
      country: "Malta",
      timezone: "Europe/Malta",
      currency: "EUR",
    },
  ];

  for (const b of branches) {
    await pool.query(
      `INSERT INTO Branches (code, name, country, timezone, currency, active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), 
         country=VALUES(country), 
         timezone=VALUES(timezone), 
         currency=VALUES(currency), 
         active=1`,
      [b.code, b.name, b.country, b.timezone, b.currency]
    );
  }

  const [[ist]] = await pool.query(
    `SELECT id FROM Branches WHERE code='IST' LIMIT 1`
  );
  const [[mla]] = await pool.query(
    `SELECT id FROM Branches WHERE code='MLA' LIMIT 1`
  );
  const istId = ist?.id;
  const mlaId = mla?.id;

  const defaultCategories = ["Chocolate"];

  async function seedCats(branchId) {
    for (const name of defaultCategories) {
      await pool.query(
        `INSERT IGNORE INTO Categories (branchId, name) VALUES (?, ?)`,
        [branchId, name]
      );
    }
  }

  if (istId) await seedCats(istId);
  if (mlaId) await seedCats(mlaId);

  // Seed admin user
  const [rows] = await pool.execute(
    `SELECT id FROM Users WHERE username='admin' LIMIT 1`
  );

  if (rows.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await pool.execute(
      `INSERT INTO Users (username, password, usertype, branchId)
       VALUES (?, ?, 'admin', NULL)`,
      ["admin", hashed]
    );
    console.log(
      "🧑‍💼 Default admin created → username: admin | password: admin123"
    );
  } else {
    console.log("✅ Admin already exists.");
  }
}

async function initDb() {
  await ensureDatabase();
  const pool = await createPool();
  await runMigrations(pool);
  await runSeeds(pool);

  console.log("✅ Database ready.");
}

module.exports = { initDb };

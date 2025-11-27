// config/db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_TIMEZONE } =
  process.env;

let pool = null;

/**
 * Create (or return existing) pool.
 * This does NOT create tables or seed data – just connects.
 */
async function createPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    multipleStatements: false,
    timezone: "Z", // store UTC in DB
    decimalNumbers: true,
  });

  // Optional: set session time zone (affects NOW())
  if (DB_TIMEZONE) {
    await pool.query(`SET time_zone = ?;`, [DB_TIMEZONE]);
  }

  return pool;
}

function getPool() {
  if (!pool)
    throw new Error("DB pool not initialized. Call createPool/initDb() first.");
  return pool;
}

module.exports = { createPool, getPool };

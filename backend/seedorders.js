// seedorders.js (MariaDB version, branch-aware)
require("dotenv").config();
const { init, getPool } = require("./config/db");

// Helpers
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function randomPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysAgo));
  d.setHours(rand(9, 23), rand(0, 59), rand(0, 59), 0);
  // Format as MySQL DATETIME (UTC string without 'T')
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds()
  )}`;
}

async function main() {
  await init();
  const pool = getPool();

  // 1) Ensure we have at least one user (admin)
  let adminId = null;
  {
    const [rows] = await pool.query(
      `SELECT id FROM Users WHERE username='admin' LIMIT 1`
    );
    if (rows.length) {
      adminId = rows[0].id;
    } else {
      // Should exist from db init; but if not, create a placeholder user
      const [ins] = await pool.execute(
        `INSERT INTO Users (username, password, usertype) VALUES ('admin','__seed__','admin')`
      );
      adminId = ins.insertId;
    }
  }

  // 2) Load branches
  const [branches] = await pool.query(
    `SELECT id, code, name FROM Branches WHERE active=1`
  );
  if (!branches.length) {
    console.log("❌ No branches found. Seed branches first.");
    process.exit(1);
  }

  // 3) For each branch, load its menu items (id, price)
  const branchItems = new Map(); // branchId -> [{id, price}, ...]
  for (const b of branches) {
    const [items] = await pool.execute(
      `SELECT id, price FROM MenuItems WHERE branchId=?`,
      [b.id]
    );
    if (items.length === 0) {
      console.log(
        `⚠️  Branch ${b.code} has no menu items. Orders will not be created for this branch.`
      );
    }
    branchItems.set(b.id, items);
  }

  // Filter to branches that actually have items
  const usableBranches = branches.filter(
    (b) => (branchItems.get(b.id) || []).length > 0
  );
  if (!usableBranches.length) {
    console.log("❌ No branches with menu items. Add menu items first.");
    process.exit(1);
  }

  const TOTAL_ORDERS = 120;
  let created = 0;

  for (let i = 0; i < TOTAL_ORDERS; i++) {
    // Pick a random branch that has items
    const branch = usableBranches[rand(0, usableBranches.length - 1)];
    const items = branchItems.get(branch.id);
    const orderTime = randomPastDate(120); // last 120 days
    const active = 0; // completed order
    const tableNumber = `T${rand(1, 20)}`;
    const notes = Math.random() < 0.15 ? "seeded order" : null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert order with total=0 initially (will update after inserting items)
      const [orderRes] = await conn.execute(
        `INSERT INTO Orders (branchId, userId, total, active, orderTime, tableNumber, notes)
         VALUES (?, ?, 0, ?, ?, ?, ?)`,
        [branch.id, adminId, active, orderTime, tableNumber, notes]
      );
      const orderId = orderRes.insertId;

      // 1–4 random items
      const itemCount = rand(1, 4);
      let orderTotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const pick = items[rand(0, items.length - 1)];
        const qty = rand(1, 5);
        const price = Number(pick.price);

        orderTotal += qty * price;

        await conn.execute(
          `INSERT INTO OrderItems (orderId, itemId, qty, priceAtTime)
           VALUES (?, ?, ?, ?)`,
          [orderId, pick.id, qty, price]
        );
      }

      // Update total
      await conn.execute(`UPDATE Orders SET total=? WHERE id=?`, [
        orderTotal,
        orderId,
      ]);

      await conn.commit();
      conn.release();
      created++;
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error("❌ Failed to insert a seeded order:", err.message);
    }
  }

  console.log(
    `✅ Seed complete: inserted ${created}/${TOTAL_ORDERS} orders across branches.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Unhandled error in seeding:", e);
  process.exit(1);
});

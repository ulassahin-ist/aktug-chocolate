// controllers/orderController.js
const { getPool } = require("../config/db");

/**
 * GET /api/orders/completed
 */
exports.getCompletedOrders = async (req, res) => {
  try {
    const pool = getPool();
    const isAdmin = req.user?.role === "admin";
    const branchId = req.user?.branchId || null;

    let sql = `SELECT * FROM Orders WHERE active = 0`;
    const params = [];

    if (!isAdmin) {
      if (!branchId) {
        return res
          .status(400)
          .json({ error: "Branch ID missing in user session." });
      }
      sql += ` AND branchId = ?`;
      params.push(branchId);
    }

    sql += ` ORDER BY orderTime DESC`;

    const [orders] = await pool.query(sql, params);

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(
      `
      SELECT 
        oi.orderId,
        oi.itemId,
        oi.qty,
        oi.priceAtTime,
        m.name,
        m.photo
      FROM OrderItems oi
      JOIN MenuItems m ON m.id = oi.itemId
      WHERE oi.orderId IN (?)
    `,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const it of items) {
      if (!itemsByOrder[it.orderId]) itemsByOrder[it.orderId] = [];
      itemsByOrder[it.orderId].push({
        itemId: it.itemId,
        qty: it.qty,
        priceAtTime: it.priceAtTime,
        name: it.name,
        photo: it.photo,
      });
    }

    const formatted = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getCompletedOrders error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/orders/create
 * ✅ Uses tableId only (tableNumber removed)
 */
exports.createOrder = async (req, res) => {
  const pool = getPool();

  const branchId = req.body.branchId || req.user?.branchId || null;
  const userId = req.user?.uid || null;
  const { items, total, tableId, notes } = req.body;

  // ✅ Validate branchId
  if (!branchId) {
    return res
      .status(400)
      .json({ error: "Branch ID is required to create an order." });
  }

  // ✅ Validate tableId for non-staff (QR customers)
  const isStaffOrAdmin =
    req.user?.role && ["admin", "staff"].includes(req.user.role);

  if (!isStaffOrAdmin) {
    if (!tableId || tableId <= 0) {
      return res.status(400).json({
        error: "Table ID is required. Please scan the QR code at your table.",
      });
    }
  }

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Sepet boş." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) Verify each item
    const checkItemSql = `
      SELECT id, price, stock, available
      FROM MenuItems
      WHERE id = ? AND branchId = ?
      FOR UPDATE
    `;

    for (const item of items) {
      const [rows] = await conn.query(checkItemSql, [item.id, branchId]);
      const dbItem = rows[0];

      if (!dbItem) {
        await conn.rollback();
        return res
          .status(400)
          .json({ error: `Ürün artık mevcut değil: ${item.name || "Ürün"}` });
      }

      if (!dbItem.available || dbItem.stock <= 0) {
        await conn.rollback();
        return res.status(400).json({
          error: `Ürün stokta yok veya kullanılamaz: ${item.name || "Ürün"}`,
        });
      }

      if (dbItem.stock < item.qty) {
        await conn.rollback();
        return res.status(400).json({
          error: `${item.name || "Ürün"} stokta sadece ${
            dbItem.stock
          } adet var.`,
        });
      }
    }

    // 2) Insert order WITH tableId only
    // ⚠️ Make sure Orders table has a `tableId` column (INT / VARCHAR).
    const [orderResult] = await conn.query(
      `
      INSERT INTO Orders (branchId, userId, total, tableId, notes)
      VALUES (?, ?, ?, ?, ?)
    `,
      [branchId, userId, total || 0, tableId || null, notes || null]
    );

    const orderId = orderResult.insertId;

    // 3) Save items and reduce stock
    const addItemSql = `
      INSERT INTO OrderItems (orderId, itemId, qty, priceAtTime)
      VALUES (?, ?, ?, ?)
    `;
    const reduceStockSql = `
      UPDATE MenuItems
      SET stock = stock - ?
      WHERE id = ? AND branchId = ?
    `;

    for (const i of items) {
      const [rows] = await conn.query(
        `SELECT price FROM MenuItems WHERE id = ? AND branchId = ?`,
        [i.id, branchId]
      );
      const dbItem = rows[0];

      await conn.query(addItemSql, [
        orderId,
        i.id,
        i.qty,
        dbItem ? dbItem.price : i.price,
      ]);
      await conn.query(reduceStockSql, [i.qty, i.id, branchId]);
    }

    await conn.commit();

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Order create error:", err);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

/**
 * GET /api/orders/active
 */
exports.getActiveOrders = async (req, res) => {
  try {
    const pool = getPool();
    const isAdmin = req.user?.role === "admin";
    const branchId = req.user?.branchId || null;

    let sql = `
      SELECT * FROM Orders
      WHERE active = 1
    `;
    const params = [];

    if (!isAdmin) {
      if (!branchId) {
        return res
          .status(400)
          .json({ error: "Branch ID missing in user session." });
      }
      sql += ` AND branchId = ?`;
      params.push(branchId);
    }

    sql += ` ORDER BY orderTime DESC`;

    const [orders] = await pool.query(sql, params);

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(
      `
      SELECT 
        oi.orderId,
        oi.itemId,
        oi.qty,
        oi.priceAtTime,
        m.name,
        m.photo
      FROM OrderItems oi
      JOIN MenuItems m ON m.id = oi.itemId
      WHERE oi.orderId IN (?)
    `,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const it of items) {
      if (!itemsByOrder[it.orderId]) itemsByOrder[it.orderId] = [];
      itemsByOrder[it.orderId].push({
        itemId: it.itemId,
        qty: it.qty,
        priceAtTime: it.priceAtTime,
        name: it.name,
        photo: it.photo,
      });
    }

    const formatted = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Fetch active orders error:", err);
    res.status(500).json({ error: "Server error during order fetch" });
  }
};

/**
 * PUT /api/orders/complete
 * Mark order as completed
 */
exports.completeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const pool = getPool();
    const isAdmin = req.user?.role === "admin";
    const branchId = req.user?.branchId || null;

    let sql = `UPDATE Orders SET active = 0 WHERE id = ?`;
    const params = [orderId];

    if (!isAdmin) {
      if (!branchId) {
        return res
          .status(400)
          .json({ error: "Branch ID missing in user session." });
      }
      sql += ` AND branchId = ?`;
      params.push(branchId);
    }

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Order not found or not in this branch." });
    }

    res.json({ message: "Order marked as completed" });
  } catch (err) {
    console.error("❌ Complete order error:", err);
    res.status(500).json({ error: "Server error while updating order" });
  }
};

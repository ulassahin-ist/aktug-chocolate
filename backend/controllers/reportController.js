// controllers/reportController.js
const { getPool } = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const pool = getPool();
    const isAdmin = req.user?.role === "admin";

    // For admins: optional branchId filter via query (?branchId=)
    // For non-admins: always scoped to their own branchId from token
    let effectiveBranchId = null;

    if (isAdmin) {
      // admin can see all branches OR filter by a specific branch
      effectiveBranchId = req.query.branchId || null;
    } else {
      effectiveBranchId = req.user?.branchId || null;
      if (!effectiveBranchId) {
        return res
          .status(400)
          .json({ error: "Branch ID missing in user session." });
      }
    }

    // Helper to append branch condition if we have one
    const addBranchFilter = (sql, params) => {
      if (effectiveBranchId) {
        sql += ` AND branchId = ?`;
        params.push(effectiveBranchId);
      }
      return sql;
    };

    // 1) TODAY revenue
    let todaySql = `
      SELECT COALESCE(SUM(total), 0) AS rev
      FROM Orders
      WHERE active = 0
        AND DATE(orderTime) = CURDATE()
    `;
    const todayParams = [];
    todaySql = addBranchFilter(todaySql, todayParams);
    const [tRows] = await pool.query(todaySql, todayParams);
    const todayRevenue = Number(tRows[0]?.rev || 0);

    // 2) THIS MONTH revenue
    let monthSql = `
      SELECT COALESCE(SUM(total), 0) AS rev
      FROM Orders
      WHERE active = 0
        AND YEAR(orderTime) = YEAR(CURDATE())
        AND MONTH(orderTime) = MONTH(CURDATE())
    `;
    const monthParams = [];
    monthSql = addBranchFilter(monthSql, monthParams);
    const [mRows] = await pool.query(monthSql, monthParams);
    const monthRevenue = Number(mRows[0]?.rev || 0);

    // 3) TOTAL revenue (all time)
    let totalRevSql = `
      SELECT COALESCE(SUM(total), 0) AS rev
      FROM Orders
      WHERE active = 0
    `;
    const totalRevParams = [];
    totalRevSql = addBranchFilter(totalRevSql, totalRevParams);
    const [totalRRows] = await pool.query(totalRevSql, totalRevParams);
    const totalRevenue = Number(totalRRows[0]?.rev || 0);

    // 4) TOTAL orders count
    let totalOrderSql = `SELECT COUNT(*) AS c FROM Orders WHERE 1=1`;
    const totalOrderParams = [];
    totalOrderSql = addBranchFilter(totalOrderSql, totalOrderParams);
    const [oRows] = await pool.query(totalOrderSql, totalOrderParams);
    const totalOrders = Number(oRows[0]?.c || 0);

    // 5) WEEKLY revenue (last 7 days, grouped by weekday)
    let weeklyRevenue = [];
    try {
      let weeklySql = `
        SELECT 
          (DAYOFWEEK(orderTime) - 1) AS dayNum,
          CASE (DAYOFWEEK(orderTime) - 1)
            WHEN 0 THEN 'Paz'
            WHEN 1 THEN 'Pts'
            WHEN 2 THEN 'Sal'
            WHEN 3 THEN 'Çar'
            WHEN 4 THEN 'Per'
            WHEN 5 THEN 'Cum'
            WHEN 6 THEN 'Cts'
          END AS day,
          SUM(total) AS total
        FROM Orders
        WHERE active = 0
          AND orderTime >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      `;
      const weeklyParams = [];
      weeklySql = addBranchFilter(weeklySql, weeklyParams);
      weeklySql += `
        GROUP BY dayNum
        ORDER BY dayNum
      `;

      const [wRows] = await pool.query(weeklySql, weeklyParams);
      weeklyRevenue = wRows;
    } catch (err) {
      console.error("Weekly revenue error:", err);
      weeklyRevenue = [];
    }

    // 6) TOP ITEMS ALL TIME (globalTop)
    let topSql = `
      SELECT 
        m.id,
        m.name,
        SUM(oi.qty) AS totalQty
      FROM OrderItems oi
      JOIN Orders o ON o.id = oi.orderId
      JOIN MenuItems m ON m.id = oi.itemId
      WHERE 1=1
    `;
    const topParams = [];
    if (effectiveBranchId) {
      topSql += ` AND o.branchId = ?`;
      topParams.push(effectiveBranchId);
    }
    topSql += `
      GROUP BY m.id, m.name
      ORDER BY totalQty DESC
      LIMIT 3
    `;
    const [topRows] = await pool.query(topSql, topParams);
    const globalTop = topRows || [];

    // 7) ORDER STATUS SUMMARY (derived from `active`, for TODAY)
    // waiting  = active = 1 (open orders)
    // served   = active = 0 (closed orders)
    // cancelled = 0 for now (no schema for this yet)
    let statusSummary = {
      waiting: 0,
      preparing: 0, // reserved for future
      served: 0,
      cancelled: 0,
    };

    try {
      let statusSql = `
        SELECT 
          CASE 
            WHEN active = 1 THEN 'waiting'
            WHEN active = 0 THEN 'served'
          END AS statusKey,
          COUNT(*) AS cnt
        FROM Orders
        WHERE orderTime >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      `;
      const statusParams = [];

      if (!isAdmin) {
        statusSql += ` AND branchId = ?`;
        statusParams.push(branchId);
      }

      statusSql += ` GROUP BY statusKey`;

      const [statusRows] = await pool.query(statusSql, statusParams);

      for (const row of statusRows) {
        if (row.statusKey === "waiting") {
          statusSummary.waiting = Number(row.cnt || 0);
        } else if (row.statusKey === "served") {
          statusSummary.served = Number(row.cnt || 0);
        }
      }
    } catch (err) {
      console.error("Status summary error:", err);
      // keep defaults (all zero)
    }

    // Final response
    res.json({
      todayRevenue,
      monthRevenue,
      totalRevenue,
      totalOrders,
      weeklyRevenue,
      globalTop,
      statusSummary,
    });
  } catch (err) {
    console.error("❌ Stats fetch error:", err);
    res.status(500).json({ error: "Server error while fetching stats" });
  }
};

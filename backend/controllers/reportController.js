// controllers/reportController.js
const { getPool } = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const pool = getPool();
    const isAdmin = req.user?.role === "admin";
    const branchId = req.user?.branchId || null;

    // Non-admin must have a branch
    if (!isAdmin && !branchId) {
      return res
        .status(400)
        .json({ error: "Branch ID missing in user session." });
    }

    // 1) TODAY revenue
    let todaySql = `
      SELECT COALESCE(SUM(total), 0) AS rev
      FROM Orders
      WHERE active = 0
        AND DATE(orderTime) = CURDATE()
    `;
    const todayParams = [];
    if (!isAdmin) {
      todaySql += ` AND branchId = ?`;
      todayParams.push(branchId);
    }
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
    if (!isAdmin) {
      monthSql += ` AND branchId = ?`;
      monthParams.push(branchId);
    }
    const [mRows] = await pool.query(monthSql, monthParams);
    const monthRevenue = Number(mRows[0]?.rev || 0);

    // 3) TOTAL revenue (all time, scoped by branch if not admin)
    let totalRevSql = `
      SELECT COALESCE(SUM(total), 0) AS rev
      FROM Orders
      WHERE active = 0
    `;
    const totalRevParams = [];
    if (!isAdmin) {
      totalRevSql += ` AND branchId = ?`;
      totalRevParams.push(branchId);
    }
    const [totalRRows] = await pool.query(totalRevSql, totalRevParams);
    const totalRevenue = Number(totalRRows[0]?.rev || 0);

    // 4) TOTAL orders count
    let totalOrderSql = `SELECT COUNT(*) AS c FROM Orders`;
    const totalOrderParams = [];
    if (!isAdmin) {
      totalOrderSql += ` WHERE branchId = ?`;
      totalOrderParams.push(branchId);
    }
    const [oRows] = await pool.query(totalOrderSql, totalOrderParams);
    const totalOrders = Number(oRows[0]?.c || 0);

    // 5) WEEKLY revenue (last 7 days, grouped by weekday)
    // We mimic SQLite's %w (0=Sun..6=Sat) using DAYOFWEEK()-1
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
      if (!isAdmin) {
        weeklySql += ` AND branchId = ?`;
        weeklyParams.push(branchId);
      }
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
    // Admin: across all branches
    // Others: only within their branch via Orders.branchId
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
    if (!isAdmin) {
      topSql += ` AND o.branchId = ?`;
      topParams.push(branchId);
    }
    topSql += `
      GROUP BY m.id, m.name
      ORDER BY totalQty DESC
      LIMIT 3
    `;
    const [topRows] = await pool.query(topSql, topParams);
    const globalTop = topRows || [];

    // Final response
    res.json({
      todayRevenue,
      monthRevenue,
      totalRevenue,
      totalOrders,
      weeklyRevenue,
      globalTop,
    });
  } catch (err) {
    console.error("❌ Stats fetch error:", err);
    res.status(500).json({ error: "Server error while fetching stats" });
  }
};

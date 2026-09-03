import { pool } from "../config/db.js";

const LOW_STOCK_THRESHOLD = 20;

export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomersResult = await pool.query("SELECT COUNT(*) FROM customers");
    const totalProductsResult = await pool.query("SELECT COUNT(*) FROM products");
    const availableStockResult = await pool.query("SELECT COALESCE(SUM(current_stock), 0) AS total FROM products");
    const lowStockResult = await pool.query(
      "SELECT COUNT(*) FROM products WHERE current_stock <= $1",
      [LOW_STOCK_THRESHOLD]
    );
    const totalPurchaseResult = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM purchases");

    const recentPurchasesResult = await pool.query(`
      SELECT customer_name AS customer, product_name AS product, total_amount AS amount,
             TO_CHAR(purchase_date, 'YYYY-MM-DD') AS date
      FROM purchases
      ORDER BY id DESC
      LIMIT 5
    `);

    const salesTrendResult = await pool.query(`
      SELECT TO_CHAR(purchase_date, 'YYYY-MM-DD') AS date, SUM(total_amount) AS amount
      FROM purchases
      GROUP BY purchase_date
      ORDER BY purchase_date DESC
      LIMIT 7
    `);

    res.json({
      totalCustomers: Number(totalCustomersResult.rows[0].count),
      totalProducts: Number(totalProductsResult.rows[0].count),
      availableStock: Number(availableStockResult.rows[0].total),
      lowStockCount: Number(lowStockResult.rows[0].count),
      totalPurchaseAmount: Number(totalPurchaseResult.rows[0].total),
      recentPurchases: recentPurchasesResult.rows,
      salesTrend: salesTrendResult.rows.reverse().map((r) => ({
        date: r.date,
        amount: Number(r.amount),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
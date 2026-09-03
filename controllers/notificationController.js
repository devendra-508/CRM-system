import { pool } from "../config/db.js";

const LOW_STOCK_THRESHOLD = 20;

export const getNotifications = async (req, res) => {
  try {
    const lowStockResult = await pool.query(
      `SELECT id, product_name AS "productName", current_stock AS "currentStock"
       FROM products WHERE current_stock <= $1 ORDER BY current_stock ASC`,
      [LOW_STOCK_THRESHOLD]
    );

    const recentPurchasesResult = await pool.query(`
      SELECT id, customer_name AS "customerName", product_name AS "productName",
             total_amount AS "totalAmount", TO_CHAR(purchase_date, 'YYYY-MM-DD') AS "purchaseDate"
      FROM purchases ORDER BY id DESC LIMIT 5
    `);

    const notifications = [
      ...lowStockResult.rows.map((p) => ({
        id: `stock-${p.id}`,
        type: "low_stock",
        message: `${p.productName} is low on stock (${p.currentStock} left)`,
      })),
      ...recentPurchasesResult.rows.map((p) => ({
        id: `purchase-${p.id}`,
        type: "purchase",
        message: `New purchase: ${p.customerName} bought ${p.productName} for ₹${p.totalAmount}`,
      })),
    ];

    res.json({ count: notifications.length, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};
import { pool } from "../config/db.js";

const SELECT_FIELDS = `
  p.id,
  p.customer_id AS "customerId",
  p.customer_name AS "customerName",
  p.product_id AS "productId",
  p.product_name AS "productName",
  p.quantity,
  p.purchase_rate AS "purchaseRate",
  p.total_amount AS "totalAmount",
  p.invoice_number AS "invoiceNumber",
  TO_CHAR(p.purchase_date, 'YYYY-MM-DD') AS "purchaseDate"
`;

export const getAllPurchases = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM purchases p ORDER BY p.id DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM purchases p WHERE p.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Purchase not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchase" });
  }
};

export const createPurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    const { customerId, productId, quantity, purchaseRate, invoiceNumber, purchaseDate } = req.body;

    const qty = Number(quantity);
    const rate = Number(purchaseRate);
    const totalAmount = qty * rate;

    await client.query("BEGIN");

    const customerResult = await client.query("SELECT name FROM customers WHERE id = $1", [customerId]);
    const productResult = await client.query("SELECT product_name FROM products WHERE id = $1", [productId]);

    if (customerResult.rows.length === 0 || productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid customer or product" });
    }

    const customerName = customerResult.rows[0].name;
    const productName = productResult.rows[0].product_name;

    // Decrement stock
    await client.query(
      "UPDATE products SET current_stock = GREATEST(0, current_stock - $1) WHERE id = $2",
      [qty, productId]
    );

    // Update customer's total purchase
    await client.query(
      "UPDATE customers SET total_purchase = total_purchase + $1 WHERE id = $2",
      [totalAmount, customerId]
    );

    // Insert purchase record
    const insertResult = await client.query(
      `INSERT INTO purchases (customer_id, customer_name, product_id, product_name, quantity, purchase_rate, total_amount, invoice_number, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, customer_id AS "customerId", customer_name AS "customerName", product_id AS "productId",
                 product_name AS "productName", quantity, purchase_rate AS "purchaseRate",
                 total_amount AS "totalAmount", invoice_number AS "invoiceNumber",
                 TO_CHAR(purchase_date, 'YYYY-MM-DD') AS "purchaseDate"`,
      [customerId, customerName, productId, productName, qty, rate, totalAmount, invoiceNumber, purchaseDate]
    );

    await client.query("COMMIT");
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to create purchase" });
  } finally {
    client.release();
  }
};
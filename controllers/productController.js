import { pool } from "../config/db.js";

const LOW_STOCK_THRESHOLD = 20;

const SELECT_FIELDS = `
  id,
  product_name AS "productName",
  product_code AS "productCode",
  batch_number AS "batchNumber",
  current_stock AS "currentStock",
  purchase_rate AS "purchaseRate",
  mrp,
  TO_CHAR(expiry_date, 'YYYY-MM-DD') AS "expiryDate"
`;

export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM products ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM products WHERE current_stock <= $1 ORDER BY id`,
      [LOW_STOCK_THRESHOLD]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM products WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { productName, productCode, batchNumber, quantity, purchaseRate, mrp, expiryDate } = req.body;
    const result = await pool.query(
      `INSERT INTO products (product_name, product_code, batch_number, current_stock, purchase_rate, mrp, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${SELECT_FIELDS}`,
      [productName, productCode, batchNumber, quantity, purchaseRate, mrp, expiryDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productName, productCode, batchNumber, quantity, purchaseRate, mrp, expiryDate } = req.body;
    const result = await pool.query(
      `UPDATE products SET product_name=$1, product_code=$2, batch_number=$3, current_stock=$4,
       purchase_rate=$5, mrp=$6, expiry_date=$7 WHERE id=$8 RETURNING ${SELECT_FIELDS}`,
      [productName, productCode, batchNumber, quantity, purchaseRate, mrp, expiryDate, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const stockIn = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE products SET current_stock = current_stock + $1 WHERE id = $2 RETURNING ${SELECT_FIELDS}`,
      [Number(req.body.quantity) || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

export const stockOut = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE products SET current_stock = GREATEST(0, current_stock - $1) WHERE id = $2 RETURNING ${SELECT_FIELDS}`,
      [Number(req.body.quantity) || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update stock" });
  }
};
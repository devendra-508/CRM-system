import { pool } from "../config/db.js";

const SELECT_FIELDS = `
  id, name, phone, email, address, city,
  customer_type AS "customerType",
  total_purchase AS "totalPurchase"
`;

export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM customers ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM customers WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, city, customerType } = req.body;
    const result = await pool.query(
      `INSERT INTO customers (name, phone, email, address, city, customer_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${SELECT_FIELDS}`,
      [name, phone, email, address, city, customerType]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, city, customerType } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name=$1, phone=$2, email=$3, address=$4, city=$5, customer_type=$6
       WHERE id=$7 RETURNING ${SELECT_FIELDS}`,
      [name, phone, email, address, city, customerType, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM customers WHERE id=$1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};
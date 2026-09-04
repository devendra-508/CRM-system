import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", (client) => {
  console.log("Connected to PostgreSQL database");
  client.query("SET search_path TO public");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});
import express from "express";
import {
  getAllProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/low-stock", getLowStockProducts); // must come before /:id
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/stock-in", stockIn);
router.post("/:id/stock-out", stockOut);

export default router;
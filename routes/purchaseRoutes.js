import express from "express";
import { getAllPurchases, getPurchaseById, createPurchase } from "../controllers/purchaseController.js";

const router = express.Router();

router.get("/", getAllPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);

export default router;
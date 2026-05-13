import express from "express";
const router = express.Router();
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/", authMiddleware, getAllInvoices);
router.get("/:id", authMiddleware, getInvoiceById);
router.post("/create", authMiddleware, createInvoice);
router.put("/:id", authMiddleware, updateInvoice);
router.delete("/:id", authMiddleware, deleteInvoice);

export default router;

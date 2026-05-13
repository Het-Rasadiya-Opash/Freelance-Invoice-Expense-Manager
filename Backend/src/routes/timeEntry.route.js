import express from "express";
import {
  createTimeEntry,
  deleteTimeEntry,
  getAllTimeEntries,
  getTimeEntryById,
  stopTimer,
  updateTimeEntry,
} from "../controllers/timeEntry.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, getAllTimeEntries);
router.post("/create", authMiddleware, createTimeEntry);
router.get("/:id", authMiddleware, getTimeEntryById);
router.patch("/:id/stop", authMiddleware, stopTimer);
router.put("/:id", authMiddleware, updateTimeEntry);
router.delete("/:id", authMiddleware, deleteTimeEntry);

export default router;

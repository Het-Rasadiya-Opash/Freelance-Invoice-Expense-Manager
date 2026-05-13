import express from "express";
const router = express.Router();
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/", authMiddleware, getProjects);
router.post("/create", authMiddleware, createProject);
router.get("/:id", authMiddleware, getProjectById);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;

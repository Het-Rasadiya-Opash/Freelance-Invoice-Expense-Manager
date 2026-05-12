import express from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, getMe);
router.post("/register", upload.single("logoUrl"), register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;

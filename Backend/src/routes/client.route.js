import express from 'express';
const router = express.Router();
import { createClient } from '../controllers/client.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

router.post('/create',authMiddleware, createClient);

export default router;
import express from 'express';
const router = express.Router();
import { createClient, getClients, getClientById, updateClient, deleteClient } from '../controllers/client.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

router.post('/create', authMiddleware, createClient);
router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, getClientById);
router.put('/:id', authMiddleware, updateClient);
router.delete('/:id', authMiddleware, deleteClient);

export default router;
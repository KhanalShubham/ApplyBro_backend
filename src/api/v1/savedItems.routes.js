import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as savedItemsController from './savedItems.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/saved - Get all saved items
router.get('/', savedItemsController.getSavedItems);

// POST /api/v1/saved - Save an item
router.post('/', savedItemsController.saveItem);

// DELETE /api/v1/saved/:itemId - Remove a saved item
router.delete('/:itemId', savedItemsController.removeSavedItem);

export default router;

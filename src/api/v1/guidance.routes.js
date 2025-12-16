import express from 'express';
import { authenticate, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';
import * as guidanceController from './guidance.controller.js';

const router = express.Router();

// Public Routes (Optional Auth for potential user parsing if needed later)
router.get('/', optionalAuth, guidanceController.getGuidance);
router.get('/:id', optionalAuth, guidanceController.getGuidanceDetail);

export default router;

// Admin Routes - Mounted separately or here? 
// Strategy: I will export a separate Admin router or rely on the main index to mount this differently.
// Actually, better to keep them here but protect them.
// HOWEVER, the main index structure separates things nicely.
// Let's create an 'adminGuidanceRouter' inside this file or just protect the routes here.

// But wait, standard REST usually is:
// GET /guidance (public)
// POST /guidance (admin)
// PUT /guidance/:id (admin)
// DELETE /guidance/:id (admin)

// Admin Routes
router.post('/', authenticate, requireAdmin, guidanceController.createGuidance);
router.put('/:id', authenticate, requireAdmin, guidanceController.updateGuidance);
router.delete('/:id', authenticate, requireAdmin, guidanceController.deleteGuidance);

// Special Admin List Route (if needed for unpublished items)
// GET /api/v1/guidance/admin/all
router.get('/admin/all', authenticate, requireAdmin, guidanceController.getAdminGuidance);

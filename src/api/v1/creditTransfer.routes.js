import express from 'express';
import * as creditTransferController from './creditTransfer.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/colleges', creditTransferController.getNepalColleges);
router.get('/colleges/:collegeId/programs', creditTransferController.getCollegePrograms);
router.get('/colleges/:collegeId/courses', creditTransferController.getCourses);
router.post('/match', creditTransferController.findMatchingUniversities);
router.get('/mapping/:universityId', creditTransferController.getCreditMapping);

// Protected routes (require authentication)
router.post('/request', authenticate, creditTransferController.saveCreditTransferRequest);
router.get('/request', authenticate, creditTransferController.getUserCreditTransferRequest);
router.post('/toggle-saved', authenticate, creditTransferController.toggleSavedUniversity);

// Admin routes (authentication only - dashboard already restricts access)
router.get('/admin/universities', authenticate, creditTransferController.getAllUniversities);
router.post('/admin/colleges', authenticate, creditTransferController.createCollege);
router.put('/admin/colleges/:id', authenticate, creditTransferController.updateCollege);
router.delete('/admin/colleges/:id', authenticate, creditTransferController.deleteCollege);
router.post('/admin/universities', authenticate, creditTransferController.createUniversity);
router.put('/admin/universities/:id', authenticate, creditTransferController.updateUniversity);
router.delete('/admin/universities/:id', authenticate, creditTransferController.deleteUniversity);

export default router;

import express from 'express';
import { authenticate, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

// Import controllers
import * as authController from './auth.controller.js';
import * as usersController from './users.controller.js';
import * as scholarshipsController from './scholarships.controller.js';
import * as postsController from './posts.controller.js';
import * as adminController from './admin.controller.js';
import * as uploadsController from './uploads.controller.js';

const router = express.Router();

// ========== AUTH ROUTES ==========
router.post('/auth/signup', validate(schemas.signup), authController.signup);
router.post('/auth/login', validate(schemas.login), authController.login);
router.post('/auth/refresh', validate(schemas.refreshToken), authController.refresh);
router.post('/auth/logout', authenticate, authController.logout);
router.get('/auth/me', authenticate, authController.getMe);

// ========== USER ROUTES ==========
router.get('/users/me', authenticate, usersController.getCurrentUser);
router.put('/users/me', authenticate, usersController.updateCurrentUser);
router.post('/users/me/documents', authenticate, usersController.addDocument);
router.delete('/users/me/documents/:docId', authenticate, usersController.deleteDocument);

// ========== SCHOLARSHIP ROUTES ==========
router.get('/scholarships', optionalAuth, scholarshipsController.getScholarships);
router.get('/scholarships/popular', optionalAuth, scholarshipsController.getPopular);
router.get('/scholarships/recommendations', authenticate, scholarshipsController.getRecommendationsEndpoint);
router.get('/scholarships/:id', optionalAuth, scholarshipsController.getScholarship);
router.post('/scholarships/:id/bookmark', authenticate, scholarshipsController.toggleBookmark);

// Admin scholarship routes
router.post('/scholarships', authenticate, requireAdmin, scholarshipsController.createScholarship);
router.put('/scholarships/:id', authenticate, requireAdmin, scholarshipsController.updateScholarship);
router.delete('/scholarships/:id', authenticate, requireAdmin, scholarshipsController.deleteScholarship);

// ========== POST ROUTES ==========
router.get('/posts', optionalAuth, postsController.getPosts);
router.get('/posts/:id', optionalAuth, postsController.getPost);
router.post('/posts', authenticate, postsController.createPost);
router.post('/posts/:id/like', authenticate, postsController.toggleLike);
router.post('/posts/:id/comments', authenticate, postsController.addComment);

// ========== UPLOAD ROUTES ==========
router.get('/uploads/presign', authenticate, uploadsController.getPresignedUrl);
router.post('/uploads/local', uploadsController.uploadLocal);

// ========== ADMIN ROUTES ==========
// User management
router.get('/admin/users', authenticate, requireAdmin, adminController.getUsers);
router.put('/admin/users/:id/role', authenticate, requireAdmin, adminController.updateUserRole);
router.delete('/admin/users/:id', authenticate, requireAdmin, adminController.deleteUser);

// Document verification
router.get('/admin/documents/pending', authenticate, requireAdmin, adminController.getPendingDocuments);
router.put('/admin/documents/:userId/:docId/verify', authenticate, requireAdmin, adminController.verifyDocument);

// Post moderation
router.get('/admin/posts/pending', authenticate, requireAdmin, adminController.getPendingPosts);
router.put('/admin/posts/:id/moderate', authenticate, requireAdmin, adminController.moderatePost);

// Analytics
router.get('/admin/analytics', authenticate, requireAdmin, adminController.getAnalytics);
router.get('/admin/actions', authenticate, requireAdmin, adminController.getAdminActions);

export default router;

import express from 'express';
import { authenticate, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

// Import controllers
import * as authController from './auth.controller.js';
import * as usersController from './users.controller.js';
import * as scholarshipsController from './scholarships.controller.js';
import * as postsController from './posts.controller.js';
import * as commentsController from './comments.controller.js';
import * as adminController from './admin.controller.js';
import * as uploadsController from './uploads.controller.js';
import * as documentsController from './documents.controller.js';
import * as matchingController from './matching.controller.js';

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
router.get('/scholarships/match', authenticate, matchingController.matchUserScholarships);
router.get('/scholarships/:id', optionalAuth, scholarshipsController.getScholarship);
router.post('/scholarships/:id/bookmark', authenticate, scholarshipsController.toggleBookmark);

// Admin scholarship routes
router.post('/scholarships', authenticate, requireAdmin, scholarshipsController.createScholarship);
router.put('/scholarships/:id', authenticate, requireAdmin, scholarshipsController.updateScholarship);
router.delete('/scholarships/:id', authenticate, requireAdmin, scholarshipsController.deleteScholarship);

// ========== POST ROUTES ==========
router.get('/posts', optionalAuth, postsController.getPosts);
router.get('/posts/me', authenticate, postsController.getMyPosts);
router.get('/posts/:id', optionalAuth, postsController.getPost);
router.post('/posts', authenticate, postsController.createPost);
router.put('/posts/:id', authenticate, postsController.updatePost);
router.delete('/posts/:id', authenticate, postsController.deletePost);
router.post('/posts/:id/like', authenticate, postsController.toggleLike);
router.post('/posts/:id/report', authenticate, postsController.reportPost);

// ========== COMMENT ROUTES ==========
router.get('/posts/:postId/comments', optionalAuth, commentsController.getComments);
router.post('/posts/:postId/comments', authenticate, commentsController.addComment);
router.put('/comments/:id', authenticate, commentsController.updateComment);
router.delete('/comments/:id', authenticate, commentsController.deleteComment);
router.post('/comments/:id/like', authenticate, commentsController.toggleLike);
router.post('/comments/:id/report', authenticate, commentsController.reportComment);

// ========== DOCUMENT ROUTES ==========
router.post('/documents/upload', documentsController.uploadDocument);
router.get('/documents/my-documents', authenticate, documentsController.getMyDocuments);
router.get('/documents/:id', authenticate, documentsController.getDocument);
router.delete('/documents/:id', authenticate, documentsController.deleteDocument);

// ========== UPLOAD ROUTES ==========
router.get('/uploads/presign', authenticate, uploadsController.getPresignedUrl);
router.post('/uploads/local', uploadsController.uploadLocal);
// Serve uploaded files - must be after other upload routes
// Handle both GET and OPTIONS for CORS preflight
router.get('/uploads/file/*', uploadsController.serveFile);
router.options('/uploads/file/*', uploadsController.serveFile);

// ========== ADMIN ROUTES ==========
// User management
router.get('/admin/users', authenticate, requireAdmin, adminController.getUsers);
router.put('/admin/users/:id/role', authenticate, requireAdmin, adminController.updateUserRole);
router.delete('/admin/users/:id', authenticate, requireAdmin, adminController.deleteUser);

// Document verification
router.get('/admin/documents/all', authenticate, requireAdmin, adminController.getAllDocuments);
router.get('/admin/documents/pending', authenticate, requireAdmin, adminController.getPendingDocuments);
// More specific route (with userId) must come first to avoid route conflicts
router.put('/admin/documents/:userId/:docId/verify', authenticate, requireAdmin, adminController.verifyDocument);
router.put('/admin/documents/:docId/verify', authenticate, requireAdmin, adminController.verifyDocument);

// Post moderation
router.get('/admin/posts/pending', authenticate, requireAdmin, adminController.getPendingPosts);
router.post('/admin/posts/:id/approve', authenticate, requireAdmin, adminController.approvePost);
router.post('/admin/posts/:id/decline', authenticate, requireAdmin, adminController.declinePost);
router.delete('/admin/posts/:id', authenticate, requireAdmin, adminController.deletePost);
router.put('/admin/posts/:id/moderate', authenticate, requireAdmin, adminController.moderatePost); // Backward compatibility

// Comment moderation
router.post('/admin/comments/:id/remove', authenticate, requireAdmin, adminController.removeComment);

// Reports
router.get('/admin/reports', authenticate, requireAdmin, adminController.getReports);
router.post('/admin/reports/:id/resolve', authenticate, requireAdmin, adminController.resolveReport);

// Analytics
router.get('/admin/analytics', authenticate, requireAdmin, adminController.getAnalytics);
router.get('/admin/actions', authenticate, requireAdmin, adminController.getAdminActions);

export default router;

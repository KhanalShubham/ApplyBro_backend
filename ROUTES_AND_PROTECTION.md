# 🚦 ApplyBro Backend API Routes & Protection

## Overview
This document outlines all API routes in the ApplyBro backend, their protection levels, and required authentication/authorization.

---

## 🔐 Security Middleware

### Available Middleware
- `authenticate` - Verifies JWT token and attaches user to req.user
- `requireAdmin` - Checks if req.user.role === 'admin' (must be used after authenticate)
- `optionalAuth` - Attaches user if token provided, but doesn't block unauthenticated requests

### HTTP Status Codes
- `200` - Success
- `401` - Unauthorized (no valid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 📋 Route Categories

## 1️⃣ PUBLIC ROUTES (No Authentication Required)

### Authentication Routes
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
```

**Protection**: None
**Access**: Everyone
**Purpose**: Allow users to create accounts and authenticate

---

### Public Scholarship Routes
```
GET    /api/scholarships
GET    /api/scholarships/:id
```

**Protection**: `optionalAuth` (optional - shows more details if logged in)
**Access**: Everyone
**Purpose**: Allow visitors to browse scholarships before signing up

---

### Public Guidance Routes
```
GET    /api/guidance
GET    /api/guidance/:id
GET    /api/guidance/category/:category
```

**Protection**: None or `optionalAuth`
**Access**: Everyone
**Purpose**: Allow visitors to view educational content

---

## 2️⃣ USER PROTECTED ROUTES (Authentication Required)

### Profile Routes
```
GET    /api/auth/me
PUT    /api/users/profile
POST   /api/users/avatar
PUT    /api/users/password
DELETE /api/users/account
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Manage user account and profile

---

### Document Routes
```
POST   /api/documents/upload
GET    /api/documents
GET    /api/documents/:id
DELETE /api/documents/:id
PUT    /api/documents/:id
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Upload and manage scholarship documents
**Note**: Users can only access their own documents

---

### Saved Items / Bookmarks
```
GET    /api/users/saved
POST   /api/users/saved/:scholarshipId
DELETE /api/users/saved/:scholarshipId
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Save and manage scholarship bookmarks

---

### Recommendations
```
GET    /api/scholarships/recommendations
GET    /api/scholarships/matched
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Get personalized scholarship recommendations

---

### Calendar Events
```
GET    /api/calendar
POST   /api/calendar
PUT    /api/calendar/:id
DELETE /api/calendar/:id
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Manage personal calendar events and deadlines

---

### Community Posts
```
GET    /api/community/posts
POST   /api/community/posts
PUT    /api/community/posts/:id
DELETE /api/community/posts/:id
POST   /api/community/posts/:id/like
POST   /api/community/posts/:id/comment
POST   /api/community/posts/:id/report
```

**Protection**: `authenticate`
**Access**: Logged-in users only
**Purpose**: Participate in community discussions
**Note**: Users can only edit/delete their own posts

---

## 3️⃣ ADMIN PROTECTED ROUTES (Admin Role Required)

### Admin - User Management
```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/role
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/ban
POST   /api/admin/users/:id/unban
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Manage users, roles, and permissions

---

### Admin - Scholarship Management
```
POST   /api/admin/scholarships
PUT    /api/admin/scholarships/:id
DELETE /api/admin/scholarships/:id
PUT    /api/admin/scholarships/:id/verify
GET    /api/admin/scholarships/pending
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Create, update, and verify scholarships

---

### Admin - Document Verification
```
GET    /api/admin/documents
GET    /api/admin/documents/pending
PUT    /api/admin/documents/:id/verify
PUT    /api/admin/documents/:id/reject
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Verify or reject user-uploaded documents

---

### Admin - Post Moderation
```
GET    /api/admin/posts
GET    /api/admin/posts/pending
PUT    /api/admin/posts/:id/approve
PUT    /api/admin/posts/:id/decline
DELETE /api/admin/posts/:id
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Moderate and manage community posts

---

### Admin - Reports Management
```
GET    /api/admin/reports
GET    /api/admin/reports/:id
PUT    /api/admin/reports/:id/resolve
PUT    /api/admin/reports/:id/dismiss
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Handle user-reported content

---

### Admin - Guidance Management
```
POST   /api/admin/guidance
PUT    /api/admin/guidance/:id
DELETE /api/admin/guidance/:id
PUT    /api/admin/guidance/:id/publish
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Create and manage guidance content

---

### Admin - Calendar Management
```
GET    /api/admin/calendar
POST   /api/admin/calendar
PUT    /api/admin/calendar/:id
DELETE /api/admin/calendar/:id
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: Manage global calendar events and deadlines

---

### Admin - Analytics
```
GET    /api/admin/analytics
GET    /api/admin/analytics/users
GET    /api/admin/analytics/scholarships
GET    /api/admin/analytics/posts
```

**Protection**: `authenticate` + `requireAdmin`
**Access**: Admin only
**Purpose**: View system analytics and statistics

---

## 🛡️ Security Best Practices

### Backend Enforcement
1. **Never trust frontend** - Always validate on server
2. **Token validation** - Verify JWT on every protected route
3. **Role verification** - Check user.role for admin routes
4. **Resource ownership** - Ensure users can only access their own data
5. **Input validation** - Validate all request data
6. **Rate limiting** - Prevent abuse
7. **HTTPS only** - In production

### Example Route Protection

```javascript
// Public route - no protection
router.get('/scholarships', scholarshipController.getAll);

// User protected route
router.post('/documents/upload', 
  authenticate,  // Verify JWT
  uploadDocument
);

// Admin protected route
router.post('/admin/scholarships',
  authenticate,   // Verify JWT
  requireAdmin,   // Verify role
  createScholarship
);

// Optional auth (logged-in users see more)
router.get('/scholarships/:id',
  optionalAuth,
  getScholarshipDetails
);
```

---

## 🔄 Token Refresh Flow

1. Access token expires (15 minutes)
2. Frontend intercepts 401 error
3. Sends refresh token to `/api/auth/refresh-token`
4. Receives new access token
5. Retries original request
6. If refresh token invalid → logout user

---

## ⚠️ Common Security Issues

### DON'T:
❌ Accept client-side role claims
❌ Expose admin endpoints to non-admins
❌ Skip authentication checks
❌ Use weak password requirements
❌ Store sensitive data in tokens

### DO:
✅ Validate every request
✅ Use environment variables for secrets
✅ Implement rate limiting
✅ Log security events
✅ Use HTTPS in production
✅ Rotate refresh tokens
✅ Implement CORS properly

---

## 📊 Route Summary

| Type | Count | Protection |
|------|-------|-----------|
| Public | ~10 | None |
| User Protected | ~30 | authenticate |
| Admin Protected | ~25 | authenticate + requireAdmin |
| **Total** | **~65** | - |

---

## 🧪 Testing Routes

### Test Authentication
```bash
# Get access token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Use token in protected route
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Admin Access
```bash
# Should succeed (admin user)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Should fail with 403 (regular user)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer USER_TOKEN"
```

---

**Last Updated**: 2025-12-19
**Version**: 1.0
**Maintained by**: ApplyBro Development Team

# ApplyBro Backend API

Complete backend API for the ApplyBro scholarship platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (student/admin)
  - Email verification flow
  - Password hashing with bcrypt

- **Scholarships Management**
  - CRUD operations for scholarships
  - Advanced search and filtering
  - Text-based search with MongoDB indexes
  - Bookmarking functionality
  - Rule-based recommendation engine

- **User Management**
  - User profiles with academic information
  - Document upload and verification
  - Profile customization

- **Community Posts**
  - Create posts (pending → approved workflow)
  - Like and comment functionality
  - Admin moderation system

- **Admin Dashboard**
  - User management
  - Document verification
  - Post moderation
  - Scholarship management
  - Analytics and statistics
  - Audit logging

- **File Upload**
  - S3 presigned URLs for direct uploads
  - Local storage fallback for development
  - Document type validation

- **Background Jobs**
  - Deadline reminders (BullMQ + Redis)
  - Daily digest emails
  - Scheduled tasks

- **Security**
  - Helmet for security headers
  - Rate limiting
  - CORS configuration
  - Input validation with Joi
  - Error handling middleware

## 📄 Document Verification System

The document verification system provides a complete workflow for users to upload academic documents and admins to verify them.

### Workflow Overview

1. **User Uploads Document**
   - User uploads a document via `POST /documents/upload`
   - Document is automatically set to `status: 'pending'`
   - Document is stored in both `UserDocument` collection and `User.documents` array
   - Document parsing happens asynchronously in the background
   - Document immediately appears in admin panel

2. **Admin Views Pending Documents**
   - Admin can view pending documents via `GET /admin/documents/pending`
   - Admin can view all documents with status filter via `GET /admin/documents/all?status=pending`
   - Both endpoints include document metadata (file size, MIME type, parsing status, etc.)

3. **Admin Accesses Document File**
   - Document files are accessible via:
     - Direct static serving: `/uploads/document/userId/filename.pdf` (with CORS headers)
     - API route: `/api/v1/uploads/file/document/userId/filename.pdf` (with CORS headers)
   - Both routes include proper CORS headers for cross-origin access

4. **Admin Verifies Document**
   - Admin verifies/rejects document via:
     - `PUT /api/v1/admin/documents/:docId/verify` (for UserDocument collection)
     - `PUT /api/v1/admin/documents/:userId/:docId/verify` (for User.documents array)
   - Status is synced between both systems automatically
   - Admin action is logged in audit trail

5. **User Sees Status**
   - User can view document status via `GET /documents/my-documents`
   - Status is synced and visible to the user immediately

### Key Features

- **Dual Storage System**: Documents are stored in both `UserDocument` collection (for advanced features) and `User.documents` array (for backward compatibility)
- **Automatic Status Sync**: When a document is verified/rejected, the status is automatically synced between both storage systems
- **CORS Support**: Document files are accessible with proper CORS headers for frontend access
- **Metadata Rich**: Documents include file size, MIME type, parsing status, verification status, and admin notes
- **Audit Trail**: All admin actions are logged for accountability

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (for background jobs)
- AWS account with S3 bucket (optional, for production)
- SendGrid account (optional, for emails)

## 🛠️ Installation

1. **Clone and navigate to the backend folder:**
   ```bash
   cd applybro-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/applybro
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   REDIS_URL=redis://localhost:6379
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB and Redis (if using Docker):**
   ```bash
   docker-compose up -d mongo redis
   ```

5. **Seed admin user:**
   ```bash
   node scripts/seed-admin.js
   ```
   
   Default admin credentials:
   - Email: `admin@applybro.com`
   - Password: `admin123`

6. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:4000`

## 🐳 Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- API server on port 4000

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "country": "Nepal"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### POST `/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/auth/refresh`
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

#### GET `/auth/me`
Get current user profile (requires authentication)

### Scholarship Endpoints

#### GET `/scholarships`
Get all scholarships with filters

**Query Parameters:**
- `q` - Search query
- `country` - Filter by country
- `level` - Filter by education level (+2, Bachelor, Master, PhD)
- `status` - Filter by status (open, upcoming, closed)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)
- `sort` - Sort field (deadline, title, createdAt)
- `order` - Sort order (asc, desc)

#### GET `/scholarships/:id`
Get single scholarship details

#### GET `/scholarships/recommendations`
Get personalized recommendations (requires authentication)

#### GET `/scholarships/popular`
Get popular scholarships (most bookmarked)

#### POST `/scholarships/:id/bookmark`
Toggle bookmark for a scholarship (requires authentication)

**Admin Only:**
- `POST /scholarships` - Create scholarship
- `PUT /scholarships/:id` - Update scholarship
- `DELETE /scholarships/:id` - Delete scholarship

### User Endpoints

#### GET `/users/me`
Get current user profile (requires authentication)

#### PUT `/users/me`
Update current user profile (requires authentication)

#### POST `/users/me/documents`
Add document to user profile (requires authentication)

**Request Body:**
```json
{
  "type": "transcript",
  "name": "Bachelor Transcript.pdf",
  "url": "https://..."
}
```

#### DELETE `/users/me/documents/:docId`
Delete a document (requires authentication)

### Document Endpoints

#### POST `/documents/upload`
Upload a document with automatic parsing (requires authentication)

**Form Data:**
- `file` - Document file (PDF, DOC, DOCX)
- `type` - Education level type (e.g., "+2", "bachelor", "ielts", "master")
- `documentType` - Document type (e.g., "transcript", "certificate", "ielts")

**Response:**
```json
{
  "status": "success",
  "message": "Document uploaded successfully. Parsing in progress. Document is pending admin verification.",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "type": "bachelor",
      "documentType": "transcript",
      "originalFilename": "transcript.pdf",
      "fileUrl": "/uploads/document/userId/transcript.pdf",
      "parsingStatus": "processing",
      "verificationStatus": "pending",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Notes:**
- Documents are automatically set to `status: 'pending'` upon upload
- Document parsing happens asynchronously in the background
- Documents are immediately visible to admins for verification
- Document is stored in both `UserDocument` collection and `User.documents` array for backward compatibility

#### GET `/documents/my-documents`
Get all documents uploaded by the current user (requires authentication)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "bachelor",
        "documentType": "transcript",
        "originalFilename": "transcript.pdf",
        "fileUrl": "/uploads/document/userId/transcript.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed",
        "status": "verified",
        "verifiedAt": "2024-01-16T09:00:00Z",
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Post Endpoints

#### GET `/posts`
Get all posts (filtered by status for non-admins)

#### GET `/posts/:id`
Get single post details

#### POST `/posts`
Create a new post (requires authentication)

**Request Body:**
```json
{
  "title": "My Scholarship Journey",
  "body": "Here's my story...",
  "category": "Success Story",
  "imageUrl": "https://..." // optional
}
```

#### POST `/posts/:id/like`
Toggle like on a post (requires authentication)

#### POST `/posts/:id/comments`
Add comment to a post (requires authentication)

**Request Body:**
```json
{
  "text": "Great post!"
}
```

### Upload Endpoints

#### GET `/uploads/presign`
Get presigned URL for file upload (requires authentication)

**Query Parameters:**
- `filename` - File name (e.g., "document.pdf")
- `type` - File type (document, image, profile)

**Response:**
```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://...",
    "publicUrl": "https://...",
    "key": "..."
  }
}
```

#### POST `/uploads/local`
Local file upload (development fallback)

**Form Data:**
- `file` - File to upload
- `type` - File type (document, image, profile)

### Admin Endpoints (Admin Only)

#### User Management
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user

#### Document Verification

##### GET `/admin/documents/pending`
Get all pending documents from both `UserDocument` collection and `User.documents` array

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "docId": "507f1f77bcf86cd799439011",
        "userId": "507f191e810c19729de860ea",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "type": "transcript",
        "name": "transcript.pdf",
        "url": "/uploads/document/userId/transcript.pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "source": "UserDocument",
        "documentType": "transcript",
        "educationType": "bachelor",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

##### GET `/admin/documents/all`
Get all documents (pending, verified, rejected) with optional status filter

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)
- `status` - Filter by status: `pending`, `verified`, or `rejected` (optional)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "docId": "507f1f77bcf86cd799439011",
        "userId": "507f191e810c19729de860ea",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "type": "transcript",
        "name": "transcript.pdf",
        "url": "/uploads/document/userId/transcript.pdf",
        "status": "verified",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "verifiedAt": "2024-01-16T09:00:00Z",
        "verifiedBy": "507f191e810c19729de860eb",
        "adminNote": "Document verified successfully",
        "source": "UserDocument",
        "documentType": "transcript",
        "educationType": "bachelor",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

##### PUT `/admin/documents/:docId/verify`
Verify or reject a document from the `UserDocument` collection

**Request Body:**
```json
{
  "status": "verified", // or "rejected"
  "adminNote": "Document verified successfully", // optional
  "userId": "507f191e810c19729de860ea" // optional, for UserDocument lookup
}
```

##### PUT `/admin/documents/:userId/:docId/verify`
Verify or reject a document from the `User.documents` array

**Request Body:**
```json
{
  "status": "verified", // or "rejected"
  "adminNote": "Document verified successfully" // optional
}
```

**Response (both endpoints):**
```json
{
  "status": "success",
  "message": "Document verified successfully",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "status": "verified",
      "verifiedAt": "2024-01-16T09:00:00Z",
      "verifiedBy": "507f191e810c19729de860eb",
      "adminNote": "Document verified successfully"
    }
  }
}
```

**Notes:**
- Both verification endpoints sync the status between `UserDocument` collection and `User.documents` array
- Admin actions are logged in the audit trail
- Document files are accessible via:
  - Direct static serving: `/uploads/document/userId/filename.pdf` (with CORS headers)
  - API route: `/api/v1/uploads/file/document/userId/filename.pdf` (with CORS headers)

#### Post Moderation
- `GET /admin/posts/pending` - Get pending posts
- `PUT /admin/posts/:id/moderate` - Approve/decline post

**Request Body:**
```json
{
  "status": "approved", // or "declined"
  "adminNote": "Post approved" // optional
}
```

#### Analytics
- `GET /admin/analytics` - Get platform analytics

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Use the refresh token to get a new access token.

## 📝 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🏗️ Project Structure

```
applybro-backend/
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.controller.js
│   │       ├── users.controller.js
│   │       ├── scholarships.controller.js
│   │       ├── posts.controller.js
│   │       ├── admin.controller.js
│   │       ├── uploads.controller.js
│   │       └── index.js (routes)
│   ├── models/
│   │   ├── user.model.js
│   │   ├── scholarship.model.js
│   │   ├── post.model.js
│   │   ├── college.model.js
│   │   └── adminAction.model.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── s3.service.js
│   │   ├── recommendation.service.js
│   │   └── email.service.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── jobs/
│   │   └── reminders.job.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── scripts/
│   └── seed-admin.js
├── tests/
├── logs/
├── uploads/
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": [ // Optional, for validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 📊 Health Check

Check API health:
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T02:14:00.000Z",
  "uptime": 3600
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secrets**: Use strong, random secrets (min 32 characters)
3. **Rate Limiting**: Enabled by default (120 req/min)
4. **CORS**: Configured for your frontend URL
5. **Helmet**: Security headers enabled
6. **Input Validation**: All inputs validated with Joi schemas

## 🚀 Deployment

### Environment Variables for Production

Make sure to set:
- Strong JWT secrets
- Production MongoDB URI
- AWS S3 credentials (for file uploads)
- SendGrid API key (for emails)
- Production frontend URL

### Docker Deployment

Build and run:
```bash
docker-compose up -d
```

### Manual Deployment

1. Set production environment variables
2. Build the application: `npm ci --production`
3. Start with PM2 or similar: `pm2 start src/server.js`

## 📧 Email Configuration

For production, configure SendGrid:

1. Get API key from SendGrid
2. Add to `.env`: `SENDGRID_API_KEY=SG...`
3. Set from email: `FROM_EMAIL=noreply@applybro.com`

For development, emails are logged to console.

## 📝 License

This project is private and proprietary.

## 👥 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for ApplyBro**







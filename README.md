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
- `GET /admin/documents/pending` - Get pending documents
- `PUT /admin/documents/:userId/:docId/verify` - Verify/reject document

**Request Body:**
```json
{
  "status": "verified", // or "rejected"
  "adminNote": "Document verified successfully" // optional
}
```

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







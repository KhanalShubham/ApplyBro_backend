# ApplyBro Backend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd applybro-backend
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and set at minimum:
# - MONGO_URI=mongodb://localhost:27017/applybro
# - JWT_SECRET=your_random_secret_32_chars_min
# - JWT_REFRESH_SECRET=your_random_refresh_secret
```

### 3. Start MongoDB & Redis (Docker - Recommended)
```bash
docker-compose up -d mongo redis
```

**OR** use local MongoDB and Redis if installed.

### 4. Seed Admin User
```bash
npm run seed:admin
```

Default admin credentials:
- Email: `admin@applybro.com`
- Password: `admin123`

### 5. Start Server
```bash
npm run dev
```

API will be running at: `http://localhost:4000`

### 6. Test Health Endpoint
```bash
curl http://localhost:4000/health
```

## 📝 Environment Variables

Minimum required for development:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/applybro
JWT_SECRET=change_this_to_a_random_string_min_32_chars
JWT_REFRESH_SECRET=change_this_to_another_random_string
FRONTEND_URL=http://localhost:3000
```

Optional (for production features):
- `REDIS_URL` - For background jobs
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` - For file uploads
- `SENDGRID_API_KEY` - For emails

## 🧪 Test the API

### Sign Up
```bash
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "country": "Nepal"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@applybro.com",
    "password": "admin123"
  }'
```

### Get Scholarships (Public)
```bash
curl http://localhost:4000/api/v1/scholarships
```

## 🗂️ Project Structure

```
applybro-backend/
├── src/
│   ├── api/v1/          # API routes & controllers
│   ├── models/          # Mongoose models
│   ├── services/        # Business logic
│   ├── middlewares/     # Auth, validation, error handling
│   ├── jobs/           # Background workers
│   ├── utils/          # Utilities (logger, etc.)
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── scripts/            # Utility scripts
├── tests/              # Test files
├── docker-compose.yml  # Docker setup
└── package.json        # Dependencies
```

## 🔗 API Endpoints Summary

### Public
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/scholarships` - List scholarships
- `GET /api/v1/scholarships/:id` - Get scholarship
- `GET /api/v1/posts` - Get posts (approved only)

### Authenticated (Student)
- `GET /api/v1/users/me` - Get profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/scholarships/recommendations` - Get recommendations
- `POST /api/v1/scholarships/:id/bookmark` - Bookmark scholarship
- `POST /api/v1/posts` - Create post

### Admin Only
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/documents/pending` - Pending documents
- `GET /api/v1/admin/posts/pending` - Pending posts
- `GET /api/v1/admin/analytics` - Analytics
- `POST /api/v1/scholarships` - Create scholarship
- `PUT /api/v1/scholarships/:id` - Update scholarship

See README.md for full API documentation.

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📚 Next Steps

1. ✅ Backend is running
2. ✅ Test endpoints with Postman or curl
3. ✅ Connect frontend to backend API
4. ✅ Configure S3 for production file uploads
5. ✅ Set up SendGrid for production emails

## 🆘 Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running: `docker-compose up -d mongo`
- Check MONGO_URI in .env

**Redis connection error:**
- Background jobs will be disabled (optional)
- To enable: `docker-compose up -d redis`

**Port already in use:**
- Change PORT in .env file
- Or stop the service using port 4000

---

**Happy coding! 🎉**







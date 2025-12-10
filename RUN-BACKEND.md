# 🚀 Running the Backend

## Quick Start (From Project Root)

### Option 1: PowerShell Script
```powershell
.\run-backend.ps1
```

### Option 2: Batch File
Double-click `run-backend.bat` or run:
```cmd
run-backend.bat
```

### Option 3: Manual Commands
```bash
cd applybro-backend
npm install    # Only needed first time
npm run dev    # Starts the server
```

## What the Scripts Do

1. ✅ Automatically navigate to the `applybro-backend` directory
2. ✅ Check and install dependencies if needed
3. ✅ Start the backend server on `http://localhost:4000`
4. ✅ Uses in-memory MongoDB if no MongoDB instance is available (development mode)

## Server Information

- **Port**: `4000`
- **API Base URL**: `http://localhost:4000/api/v1`
- **Health Check**: `http://localhost:4000/health`
- **Environment**: Development (with auto-seeded admin user)

## Default Admin Credentials

The server auto-creates an admin user if one doesn't exist:
- **Email**: `admin@applybro.com`
- **Password**: `admin123`

## Available Scripts

- `npm run dev` - Start development server with nodemon (auto-restart on changes)
- `npm run start` - Start production server
- `npm run seed:admin` - Manually seed admin user
- `npm test` - Run tests

## Environment Variables (Optional)

Create a `.env` file in `applybro-backend/` for custom configuration:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/applybro
JWT_SECRET=your_random_secret_32_chars_min
JWT_REFRESH_SECRET=your_random_refresh_secret
FRONTEND_URL=http://localhost:3000
```

**Note**: The server will work without a `.env` file using sensible defaults and in-memory MongoDB for development.

## Features

- ✅ **Auto-seeding**: Creates admin user automatically
- ✅ **MongoDB Fallback**: Uses in-memory MongoDB if connection fails (dev mode)
- ✅ **Hot Reload**: Nodemon automatically restarts on file changes
- ✅ **Health Endpoint**: Check server status at `/health`

## Troubleshooting

- **Port 4000 already in use**: Change PORT in `.env` or stop the service using port 4000
- **MongoDB connection**: The server will automatically use in-memory MongoDB in development
- **Module errors**: Make sure you're in the `applybro-backend` directory when running commands









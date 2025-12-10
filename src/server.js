import mongoose from 'mongoose';
import app from './app.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { startWorker } from './jobs/reminders.job.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

// Non-blocking auto-seed for development: create default admin in whichever DB the server connects to
async function seedAdminIfNeeded() {
  try {
    // require here to avoid module cycles during startup
    const User = (await import('./models/user.model.js')).default;
    const { hashPassword } = await import('./services/auth.service.js');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@applybro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const passwordHash = await hashPassword(adminPassword);
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        emailVerified: true,
      });
      logger.info('✅ Auto-seeded default admin user');
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      existing.emailVerified = true;
      await existing.save();
      logger.info('✅ Promoted existing user to admin');
    }
  } catch (err) {
    // Don't crash server if seeding fails; log and continue.
    logger.warn('Auto-seed admin failed (non-fatal):', err?.message || err);
  }
}

// MongoDB connection with development fallback to in-memory server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message || error);

    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.info('Starting in-memory MongoDB for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        logger.info('✅ Connected to in-memory MongoDB');
      } catch (memErr) {
        logger.error('Failed to start in-memory MongoDB:', memErr);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Start the server
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
    logger.info(`💚 Health: http://localhost:${PORT}/health`);
    // In development, try to auto-seed an admin for convenience (non-blocking)
    if (process.env.NODE_ENV !== 'production') {
      seedAdminIfNeeded().catch((err) => logger.warn('seedAdminIfNeeded failed:', err?.message || err));
    }
  });

  // Start background worker for reminders (will no-op if Redis not available)
  try {
    const worker = startWorker();
    if (worker) logger.info('✅ Background worker started');
  } catch (werr) {
    logger.warn('Background worker failed to start:', werr.message || werr);
  }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});








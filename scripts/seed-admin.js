import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';
import { hashPassword } from '../src/services/auth.service.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

/**
 * Seed admin user
 * Usage: node scripts/seed-admin.js
 * Or provide env vars: ADMIN_EMAIL and ADMIN_PASSWORD
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    try {
      await mongoose.connect(MONGO_URI);
      logger.info('Connected to MongoDB');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Real MongoDB unavailable, using in-memory database...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        logger.info('Connected to in-memory MongoDB');
      } else {
        throw error;
      }
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@applybro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        logger.info(`Admin user already exists: ${adminEmail}`);
        logger.info('Updating password...');
        existingAdmin.passwordHash = await hashPassword(adminPassword);
        existingAdmin.emailVerified = true;
        await existingAdmin.save();
        logger.info('✅ Admin password updated successfully');
      } else {
        logger.info(`User exists but is not admin. Updating role...`);
        existingAdmin.role = 'admin';
        existingAdmin.passwordHash = await hashPassword(adminPassword);
        existingAdmin.emailVerified = true;
        await existingAdmin.save();
        logger.info('✅ User promoted to admin successfully');
      }
    } else {
      // Create admin user
      const passwordHash = await hashPassword(adminPassword);
      
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        emailVerified: true
      });
      
      logger.info('✅ Admin user created successfully');
      logger.info(`   Email: ${adminEmail}`);
      logger.info(`   Password: ${adminPassword}`);
      logger.info(`   Role: ${admin.role}`);
    }
    
    // Close connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();







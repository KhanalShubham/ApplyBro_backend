import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import { hashPassword } from '../src/services/auth.service.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

async function restoreAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@applybro.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            console.log('Creating admin user...');
            const passwordHash = await hashPassword(adminPassword);
            await User.create({
                name: process.env.ADMIN_NAME || 'Admin User',
                email: adminEmail,
                passwordHash,
                role: 'admin',
                emailVerified: true,
            });
            console.log(`✅ Admin user restored: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log('✅ Admin user already exists');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

restoreAdmin();

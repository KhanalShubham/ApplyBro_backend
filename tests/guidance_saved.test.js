process.env.JWT_SECRET = 'test_secret'; // Ensure app uses this too if imported after

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Guidance from '../src/models/guidance.model.js';
import SavedItem from '../src/models/savedItem.model.js';
import jwt from 'jsonwebtoken';

let mongoServer;

const generateToken = (userId, role = 'student') => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Disconnect existing connection if any (from app.js or other tests)
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
    await Guidance.deleteMany({});
    await SavedItem.deleteMany({});
});

describe('Guidance & Saved Items API', () => {
    let adminUser, studentUser, adminToken, studentToken, guidanceItem;

    beforeEach(async () => {
        // Create Admin
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            passwordHash: 'hashedpassword',
            role: 'admin'
        });
        adminToken = generateToken(adminUser._id, 'admin');

        // Create Student
        studentUser = await User.create({
            name: 'Student User',
            email: 'student@example.com',
            passwordHash: 'hashedpassword',
            role: 'student'
        });
        studentToken = generateToken(studentUser._id, 'student');

        // Create Initial Guidance
        guidanceItem = await Guidance.create({
            title: 'Test Article',
            description: 'Test Description',
            type: 'article',
            topic: 'General',
            createdBy: adminUser._id
        });
    });

    describe('Guidance Module', () => {
        it('should allow admin to create guidance', async () => {
            const res = await request(app)
                .post('/api/v1/guidance')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'New Video',
                    description: 'Video Description',
                    type: 'video',
                    topic: 'IELTS',
                    videoUrl: 'http://example.com/video',
                    duration: '10:00'
                });

            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe('New Video');
        });

        it('should NOT allow student to create guidance', async () => {
            const res = await request(app)
                .post('/api/v1/guidance')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ title: 'Hacked Article', type: 'article' });

            expect(res.status).toBe(403);
        });

        it('should allow public to fetch guidance', async () => {
            const res = await request(app).get('/api/v1/guidance?topic=General');
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data[0].title).toBe('Test Article');
        });
    });

    describe('Saved Items Module', () => {
        it('should allow user to save a guidance item', async () => {
            const res = await request(app)
                .post('/api/v1/saved')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    itemType: 'article',
                    itemId: guidanceItem._id
                });

            expect(res.status).toBe(201);
            expect(res.body.data.itemId).toBe(guidanceItem._id.toString());
        });

        it('should prevent duplicate saves', async () => {
            // First save
            await request(app)
                .post('/api/v1/saved')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ itemType: 'article', itemId: guidanceItem._id });

            // Second save
            const res = await request(app)
                .post('/api/v1/saved')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ itemType: 'article', itemId: guidanceItem._id });

            expect(res.status).toBe(409);
        });

        it('should allow user to get saved items', async () => {
            await SavedItem.create({
                userId: studentUser._id,
                itemType: 'article',
                itemId: guidanceItem._id
            });

            const res = await request(app)
                .get('/api/v1/saved')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data[0].details.title).toBe('Test Article');
        });

        it('should allow user to remove saved item', async () => {
            // Save item
            await SavedItem.create({
                userId: studentUser._id,
                itemType: 'article',
                itemId: guidanceItem._id
            });

            // Remove
            const res = await request(app)
                .delete(`/api/v1/saved/${guidanceItem._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(200);

            // Verify removal
            const check = await SavedItem.findOne({ userId: studentUser._id });
            expect(check).toBeNull();
        });
    });
});

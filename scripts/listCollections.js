import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/applybro';

async function listCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log('📚 All Collections in applybro database:\n');
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`   ${collection.name}: ${count} documents`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listCollections();

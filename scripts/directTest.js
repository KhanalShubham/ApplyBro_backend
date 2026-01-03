import mongoose from 'mongoose';
import NepalCollege from '../src/models/nepalCollege.model.js';

const MONGO_URI = 'mongodb://localhost:27017/applybro';

async function testDirectInsert() {
    try {
        console.log('Connecting...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        // Clear
        await NepalCollege.deleteMany({});
        console.log('Cleared existing\n');

        // Insert ONE college directly
        const testCollege = {
            name: 'Direct Test College',
            location: 'Kathmandu',
            affiliation: 'UK',
            affiliatedUniversity: 'Test University',
            programs: [
                { name: 'Test Program', duration: '4 years', totalCredits: 360 }
            ]
        };

        console.log('Inserting test college...');
        const result = await NepalCollege.create(testCollege);
        console.log('✅ Inserted:', result._id);

        // Count
        const count = await NepalCollege.countDocuments();
        console.log(`\n📊 Total in DB: ${count}`);

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Collections:');
        for (const coll of collections) {
            const c = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`  ${coll.name}: ${c}`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDirectInsert();

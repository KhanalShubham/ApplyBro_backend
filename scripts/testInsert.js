import mongoose from 'mongoose';
import NepalCollege from '../src/models/nepalCollege.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/applybro';

async function testInsert() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Try to insert one college
        const testCollege = {
            name: 'Test College',
            location: 'Kathmandu',
            affiliation: 'UK',
            affiliatedUniversity: 'Test University',
            website: 'https://test.edu.np',
            logo: 'https://test.edu.np/logo.png',
            programs: [
                { name: 'Test Program', duration: '4 years', totalCredits: 360 }
            ]
        };

        console.log('Inserting test college...');
        const inserted = await NepalCollege.create(testCollege);
        console.log('✅ Inserted:', inserted);

        // Count all colleges
        const count = await NepalCollege.countDocuments();
        console.log(`\n📊 Total colleges in database: ${count}`);

        // List all colleges
        const all = await NepalCollege.find().select('name location');
        console.log('\n📚 All colleges:');
        all.forEach((c, i) => console.log(`${i + 1}. ${c.name} - ${c.location}`));

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testInsert();

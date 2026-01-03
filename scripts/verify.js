import mongoose from 'mongoose';
import NepalCollege from '../src/models/nepalCollege.model.js';

async function verify() {
    try {
        await mongoose.connect('mongodb://localhost:27017/applybro');

        const count = await NepalCollege.countDocuments();
        console.log(`Total colleges: ${count}`);

        if (count > 0) {
            const colleges = await NepalCollege.find().limit(5);
            console.log('\nFirst 5 colleges:');
            colleges.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verify();

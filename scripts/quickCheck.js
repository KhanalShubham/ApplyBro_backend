import mongoose from 'mongoose';

async function checkAll() {
    try {
        await mongoose.connect('mongodb://localhost:27017/applybro');
        console.log('✅ Connected\n');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('All collections:');
        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`  ${coll.name}: ${count} docs`);

            if (count > 0) {
                const sample = await mongoose.connection.db.collection(coll.name).findOne();
                console.log(`    Sample:`, sample.name || sample._id);
            }
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAll();

import mongoose from 'mongoose';

async function findAllDatabases() {
    try {
        await mongoose.connect('mongodb://localhost:27017/admin');
        console.log('✅ Connected to MongoDB\n');

        // List all databases
        const adminDb = mongoose.connection.db.admin();
        const { databases } = await adminDb.listDatabases();

        console.log('📊 All Databases:\n');
        for (const db of databases) {
            console.log(`\n🗄️  Database: ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);

            // Connect to each database and list collections
            const dbConn = mongoose.connection.client.db(db.name);
            const collections = await dbConn.listCollections().toArray();

            for (const coll of collections) {
                const count = await dbConn.collection(coll.name).countDocuments();
                if (count > 0) {
                    console.log(`   ✅ ${coll.name}: ${count} documents`);
                }
            }
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findAllDatabases();

import mongoose from 'mongoose';

async function findData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/applybro');
        console.log('✅ Connected to MongoDB\n');

        // Get database name
        const dbName = mongoose.connection.db.databaseName;
        console.log(`📊 Current Database: ${dbName}\n`);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections in this database:');
        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`   - ${coll.name}: ${count} documents`);
        }

        // Try to find colleges in nepalcolleges collection
        console.log('\n🔍 Searching for colleges in nepalcolleges collection...');
        const nepalColleges = await mongoose.connection.db.collection('nepalcolleges').find().limit(5).toArray();
        console.log(`Found ${nepalColleges.length} colleges in nepalcolleges`);

        // Try colleges collection
        console.log('\n🔍 Searching for colleges in colleges collection...');
        const colleges = await mongoose.connection.db.collection('colleges').find().limit(5).toArray();
        console.log(`Found ${colleges.length} colleges in colleges`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findData();

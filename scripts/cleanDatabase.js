import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/applybro';

async function cleanDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log('🗑️  Cleaning database...\n');

        // Collections to keep (only college-related data)
        const collectionsToKeep = [
            'nepalcolleges',
            'foreignuniversities',
            'courses',
            'creditmappings'
        ];

        // Collections to delete
        const collectionsToDelete = [
            'users',
            'admin',
            'adminactions',
            'auditlogs',
            'posts',
            'comments',
            'likes',
            'reports',
            'scholarships',
            'saveditems',
            'userdocuments',
            'guidances',
            'calendarevents',
            'credittransferrequests'
        ];

        for (const collName of collectionsToDelete) {
            const exists = collections.find(c => c.name === collName);
            if (exists) {
                const count = await mongoose.connection.db.collection(collName).countDocuments();
                await mongoose.connection.db.collection(collName).deleteMany({});
                console.log(`✅ Deleted ${count} documents from ${collName}`);
            }
        }

        console.log('\n📊 Remaining data:');
        for (const collName of collectionsToKeep) {
            const exists = collections.find(c => c.name === collName);
            if (exists) {
                const count = await mongoose.connection.db.collection(collName).countDocuments();
                console.log(`   ${collName}: ${count} documents`);
            }
        }

        console.log('\n✨ Database cleaned successfully!');
        console.log('✅ College data preserved');

        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

cleanDatabase();

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/applybro';

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Count colleges
        const collegeCount = await mongoose.connection.db.collection('nepalcolleges').countDocuments();
        console.log(`📊 Total Colleges in Database: ${collegeCount}\n`);

        // Get sample colleges
        const colleges = await mongoose.connection.db.collection('nepalcolleges')
            .find()
            .limit(5)
            .toArray();

        console.log('📚 Sample Colleges:\n');
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.name}`);
            console.log(`   Location: ${college.location}`);
            console.log(`   Affiliation: ${college.affiliation}`);
            console.log(`   Programs: ${college.programs?.length || 0}`);
            console.log('');
        });

        // Check other collections
        const universities = await mongoose.connection.db.collection('foreignuniversities').countDocuments();
        const courses = await mongoose.connection.db.collection('courses').countDocuments();
        const mappings = await mongoose.connection.db.collection('creditmappings').countDocuments();

        console.log('📈 Other Collections:');
        console.log(`   Foreign Universities: ${universities}`);
        console.log(`   Courses: ${courses}`);
        console.log(`   Credit Mappings: ${mappings}`);

        await mongoose.connection.close();
        console.log('\n✅ Check complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkData();

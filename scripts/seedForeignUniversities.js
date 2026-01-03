import mongoose from 'mongoose';
import ForeignUniversity from '../src/models/foreignUniversity.model.js';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';
const universitiesData = [
    { name: 'Coventry University', country: 'UK', city: 'Coventry', programName: 'BSc (Hons) Computing', programLevel: 'Bachelor', totalCredits: 360, duration: { years: 3, semesters: 6 }, tuitionRange: { min: 14000, max: 16000, currency: 'GBP' }, entryRequirements: { minGPA: 2.5, englishTest: 'IELTS', minScore: 6.0, otherRequirements: ['High School Diploma'] }, acceptsCreditTransfer: true, website: 'https://www.coventry.ac.uk', imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1000&auto=format&fit=crop', isVerified: true },
    { name: 'University of Wolverhampton', country: 'UK', city: 'Wolverhampton', programName: 'BSc (Hons) Computer Science', programLevel: 'Bachelor', totalCredits: 360, duration: { years: 3, semesters: 6 }, tuitionRange: { min: 13000, max: 15000, currency: 'GBP' }, entryRequirements: { minGPA: 2.4, englishTest: 'IELTS', minScore: 6.0 }, acceptsCreditTransfer: true, website: 'https://www.wlv.ac.uk', imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop', isVerified: true },
    { name: 'London Metropolitan University', country: 'UK', city: 'London', programName: 'BSc (Hons) Computing', programLevel: 'Bachelor', totalCredits: 360, duration: { years: 3, semesters: 6 }, tuitionRange: { min: 14500, max: 16500, currency: 'GBP' }, entryRequirements: { minGPA: 2.2, englishTest: 'IELTS', minScore: 6.0 }, acceptsCreditTransfer: true, website: 'https://www.londonmet.ac.uk', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop', isVerified: true },
    { name: 'University of Northampton', country: 'UK', city: 'Northampton', programName: 'BSc (Hons) Computing', programLevel: 'Bachelor', totalCredits: 360, duration: { years: 3, semesters: 6 }, tuitionRange: { min: 13500, max: 15500, currency: 'GBP' }, entryRequirements: { minGPA: 2.4, englishTest: 'IELTS', minScore: 6.0 }, acceptsCreditTransfer: true, website: 'https://www.northampton.ac.uk', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop', isVerified: true },
    { name: 'Westcliff University', country: 'USA', city: 'Irvine, California', programName: 'BBA', programLevel: 'Bachelor', totalCredits: 120, duration: { years: 4, semesters: 8 }, tuitionRange: { min: 10000, max: 15000, currency: 'USD' }, entryRequirements: { minGPA: 2.5, englishTest: 'TOEFL', minScore: 60 }, acceptsCreditTransfer: true, website: 'https://www.westcliff.edu', imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1000&auto=format&fit=crop', isVerified: true }
];
async function seedUniversities() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
        console.log('🗑️  Clearing existing Foreign Universities...');
        await ForeignUniversity.deleteMany({});
        console.log('✅ Existing universities cleared\n');
        console.log(`📚 Inserting ${universitiesData.length} Foreign Universities...`);
        const inserted = await ForeignUniversity.insertMany(universitiesData);
        console.log(`✅ Successfully inserted ${inserted.length} universities\n`);
        await mongoose.connection.close();
        console.log('🎉 Seeding completed successfully!');
    } catch (error) { console.error('❌ Error seeding universities:', error); }
}
seedUniversities();

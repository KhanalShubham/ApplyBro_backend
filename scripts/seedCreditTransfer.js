/**
 * Seed Script for Credit Transfer Feature
 * 
 * This script populates the database with sample data for:
 * - Nepal Colleges
 * - Courses
 * - Foreign Universities
 * - Credit Mappings
 * 
 * Run with: node scripts/seedCreditTransfer.js
 */

import mongoose from 'mongoose';
import NepalCollege from '../src/models/nepalCollege.model.js';
import Course from '../src/models/course.model.js';
import ForeignUniversity from '../src/models/foreignUniversity.model.js';
import CreditMapping from '../src/models/creditMapping.model.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/applybro';

// Sample Nepal Colleges
const nepalColleges = [
    {
        name: 'Softwarica College of IT and E-Commerce',
        affiliation: 'UK',
        location: 'Dillibazar, Kathmandu',
        website: 'https://softwarica.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop', // Modern Tech Building
        programs: [
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computer Networking and IT Security', duration: '4 years', totalCredits: 360 },
        ],
    },
    {
        name: 'Islington College',
        affiliation: 'UK',
        location: 'Kamalpokhari, Kathmandu',
        website: 'https://islington.edu.np',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=1000&auto=format&fit=crop', // Modern Campus
        programs: [
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 },
            { name: 'BBA', duration: '3 years', totalCredits: 360 },
        ],
    },
    {
        name: 'The British College',
        affiliation: 'UK',
        location: 'Thapathali, Kathmandu',
        website: 'https://thebritishcollege.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop', // Classic British Building
        programs: [
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BBA (Hons)', duration: '3 years', totalCredits: 360 },
        ],
    },
    {
        name: 'Herald College Kathmandu',
        affiliation: 'UK',
        location: 'Naxal, Kathmandu',
        website: 'https://heraldcollege.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop', // Library / Study Hall
        programs: [
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BBA (Hons)', duration: '3 years', totalCredits: 360 },
        ],
    },
    {
        name: 'Ace International Business School',
        affiliation: 'UK',
        location: 'Sinamangal, Kathmandu',
        website: 'https://ace.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1000&auto=format&fit=crop', // Modern Library
        programs: [
            { name: 'BBA', duration: '3 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
        ],
    },
    {
        name: 'Texas College of Management and IT',
        affiliation: 'Local',
        location: 'Mitrapark, Kathmandu',
        website: 'https://texascollege.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BSc CSIT', duration: '3 years', totalCredits: 126 },
            { name: 'BBA', duration: '3 years', totalCredits: 126 },
        ]
    },
    {
        name: 'Asian Institute of Technology and Management',
        affiliation: 'Local',
        location: 'Khumaltar, Lalitpur',
        website: 'https://aitm.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BIM', duration: '3 years', totalCredits: 126 },
            { name: 'BHM', duration: '3 years', totalCredits: 126 },
        ]
    },
    {
        name: 'Balmiki Lincoln College',
        affiliation: 'Malaysia',
        location: 'Birtamod, Jhapa',
        website: 'https://balmikicollege.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 },
        ]
    },
    {
        name: 'Techspire College',
        affiliation: 'Malaysia',
        location: 'New Baneshwor, Kathmandu',
        website: 'https://techspire.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BSc IT', duration: '3 years', totalCredits: 360 },
        ]
    },
    {
        name: 'Sunway College',
        affiliation: 'Malaysia',
        location: 'Maitidevi, Kathmandu',
        website: 'https://sunway.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 },
        ]
    },
    {
        name: 'Biratnagar International College',
        affiliation: 'UK',
        location: 'Biratnagar',
        website: 'https://bic.edu.np',
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000&auto=format&fit=crop',
        programs: [
            { name: 'BSc (Hons) International Business Management', duration: '3 years', totalCredits: 360 },
        ]
    }
];

// Sample Courses (for Softwarica - BSc Computing)
const sampleCourses = [
    // Year 1
    { courseName: 'Programming Fundamentals', courseCode: 'CSY1018', creditValue: 30, semester: 1, year: 1, keywords: ['programming', 'fundamentals', 'coding'] },
    { courseName: 'Computer Systems', courseCode: 'CSY1019', creditValue: 30, semester: 1, year: 1, keywords: ['systems', 'hardware', 'architecture'] },
    { courseName: 'Web Development', courseCode: 'CSY1020', creditValue: 30, semester: 2, year: 1, keywords: ['web', 'html', 'css', 'javascript'] },
    { courseName: 'Database Systems', courseCode: 'CSY1021', creditValue: 30, semester: 2, year: 1, keywords: ['database', 'sql', 'data'] },

    // Year 2
    { courseName: 'Object-Oriented Programming', courseCode: 'CSY2028', creditValue: 30, semester: 1, year: 2, keywords: ['oop', 'java', 'objects'] },
    { courseName: 'Data Structures and Algorithms', courseCode: 'CSY2029', creditValue: 30, semester: 1, year: 2, keywords: ['algorithms', 'data structures', 'complexity'] },
    { courseName: 'Software Engineering', courseCode: 'CSY2030', creditValue: 30, semester: 2, year: 2, keywords: ['software', 'engineering', 'sdlc'] },
    { courseName: 'Computer Networks', courseCode: 'CSY2031', creditValue: 30, semester: 2, year: 2, keywords: ['networks', 'tcp', 'protocols'] },

    // Year 3
    { courseName: 'Mobile Application Development', courseCode: 'CSY3038', creditValue: 30, semester: 1, year: 3, keywords: ['mobile', 'android', 'ios'] },
    { courseName: 'Artificial Intelligence', courseCode: 'CSY3039', creditValue: 30, semester: 1, year: 3, keywords: ['ai', 'machine learning', 'neural networks'] },
    { courseName: 'Cloud Computing', courseCode: 'CSY3040', creditValue: 30, semester: 2, year: 3, keywords: ['cloud', 'aws', 'azure'] },
    { courseName: 'Cybersecurity', courseCode: 'CSY3041', creditValue: 30, semester: 2, year: 3, keywords: ['security', 'encryption', 'threats'] },
];

// Sample Foreign Universities
const foreignUniversities = [
    {
        name: 'University of Westminster',
        country: 'UK',
        city: 'London',
        programName: 'BSc (Hons) Computer Science',
        programLevel: 'Bachelor',
        totalCredits: 360,
        duration: { years: 3, semesters: 6 },
        tuitionRange: { min: 14000, max: 18000, currency: 'GBP' },
        entryRequirements: {
            minGPA: 3.0,
            englishTest: 'IELTS',
            minScore: 6.0,
            otherRequirements: ['Completed Year 1 or 2', 'Relevant coursework'],
        },
        acceptsCreditTransfer: true,
        creditTransferPolicy: 'Accepts up to 120 credits from affiliated institutions',
        website: 'https://www.westminster.ac.uk',
        ranking: 150,
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop', // London City / University Vibe
    },
    {
        name: 'Coventry University',
        country: 'UK',
        city: 'Coventry',
        programName: 'BSc (Hons) Computing',
        programLevel: 'Bachelor',
        totalCredits: 360,
        duration: { years: 3, semesters: 6 },
        tuitionRange: { min: 15000, max: 17000, currency: 'GBP' },
        entryRequirements: {
            minGPA: 2.8,
            englishTest: 'IELTS',
            minScore: 6.0,
            otherRequirements: ['Completed Year 1', 'Good academic standing'],
        },
        acceptsCreditTransfer: true,
        creditTransferPolicy: 'RPL available for affiliated programs',
        website: 'https://www.coventry.ac.uk',
        ranking: 200,
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop', // Classic Campus
    },
    {
        name: 'Deakin University',
        country: 'Australia',
        city: 'Melbourne',
        programName: 'Bachelor of Information Technology',
        programLevel: 'Bachelor',
        totalCredits: 240,
        duration: { years: 3, semesters: 6 },
        tuitionRange: { min: 32000, max: 38000, currency: 'AUD' },
        entryRequirements: {
            minGPA: 3.0,
            englishTest: 'IELTS',
            minScore: 6.5,
            otherRequirements: ['Completed Year 1 or 2', 'Credit transfer assessment'],
        },
        acceptsCreditTransfer: true,
        creditTransferPolicy: 'Credit transfer available for equivalent subjects',
        website: 'https://www.deakin.edu.au',
        ranking: 250,
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop', // Modern University Interior
    },
    {
        name: 'University of Hertfordshire',
        country: 'UK',
        city: 'Hatfield',
        programName: 'BSc (Hons) Computer Science',
        programLevel: 'Bachelor',
        totalCredits: 360,
        duration: { years: 3, semesters: 6 },
        tuitionRange: { min: 14500, max: 16500, currency: 'GBP' },
        entryRequirements: {
            minGPA: 2.8,
            englishTest: 'IELTS',
            minScore: 6.0,
            otherRequirements: ['Completed Year 1', 'Relevant subjects'],
        },
        acceptsCreditTransfer: true,
        creditTransferPolicy: 'Accepts credits from partner institutions',
        website: 'https://www.herts.ac.uk',
        ranking: 300,
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1000&auto=format&fit=crop', // Campus Greenery
    },
    {
        name: 'University of Sunderland',
        country: 'UK',
        city: 'Sunderland',
        programName: 'BSc (Hons) Computing',
        programLevel: 'Bachelor',
        totalCredits: 360,
        duration: { years: 3, semesters: 6 },
        tuitionRange: { min: 13500, max: 15500, currency: 'GBP' },
        entryRequirements: {
            minGPA: 2.5,
            englishTest: 'IELTS',
            minScore: 6.0,
            otherRequirements: ['Completed Year 1', 'Good academic record'],
        },
        acceptsCreditTransfer: true,
        creditTransferPolicy: 'Flexible credit transfer for affiliated colleges',
        website: 'https://www.sunderland.ac.uk',
        ranking: 350,
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1000&auto=format&fit=crop', // Modern Building
    },
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await NepalCollege.deleteMany({});
        await Course.deleteMany({});
        await ForeignUniversity.deleteMany({});
        await CreditMapping.deleteMany({});
        console.log('✅ Existing data cleared');

        // Insert Nepal Colleges
        console.log('📚 Inserting Nepal colleges...');
        const insertedColleges = await NepalCollege.insertMany(nepalColleges);
        console.log(`✅ Inserted ${insertedColleges.length} colleges`);

        // Insert Courses for Softwarica
        console.log('📖 Inserting courses...');
        const softwaricaCollege = insertedColleges.find(c => c.name.includes('Softwarica'));
        const coursesWithCollege = sampleCourses.map(course => ({
            ...course,
            collegeId: softwaricaCollege._id,
            programName: 'BSc (Hons) Computing',
        }));
        const insertedCourses = await Course.insertMany(coursesWithCollege);
        console.log(`✅ Inserted ${insertedCourses.length} courses`);

        // Insert Foreign Universities
        console.log('🌍 Inserting foreign universities...');
        const insertedUniversities = await ForeignUniversity.insertMany(foreignUniversities);
        console.log(`✅ Inserted ${insertedUniversities.length} universities`);

        // Create Credit Mappings
        console.log('🔗 Creating credit mappings...');
        const mappings = [];

        // Map courses to each university
        for (const university of insertedUniversities) {
            // Map Year 1 and Year 2 courses (typically transferable)
            const transferableCourses = insertedCourses.filter(c => c.year <= 2);

            for (const course of transferableCourses) {
                // Most courses get full acceptance
                const acceptanceStatus = Math.random() > 0.2 ? 'full' : 'partial';

                mappings.push({
                    localCourseId: course._id,
                    foreignUniversityId: university._id,
                    acceptanceStatus,
                    creditsTransferred: acceptanceStatus === 'full' ? course.creditValue : Math.floor(course.creditValue * 0.5),
                    equivalentCourseName: course.courseName,
                    verificationStatus: 'verified',
                    matchScore: acceptanceStatus === 'full' ? 100 : 50,
                });
            }
        }

        const insertedMappings = await CreditMapping.insertMany(mappings);
        console.log(`✅ Inserted ${insertedMappings.length} credit mappings`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Colleges: ${insertedColleges.length}`);
        console.log(`   - Courses: ${insertedCourses.length}`);
        console.log(`   - Universities: ${insertedUniversities.length}`);
        console.log(`   - Credit Mappings: ${insertedMappings.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the seed function
seedDatabase();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Guidance from '../src/models/guidance.model.js';
import User from '../src/models/user.model.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const seedDatabase = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/applybro';
        console.log('🔌 Connecting to MongoDB...', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find or Create Admin User
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('👤 No admin found, creating seed admin...');
            // Check if seed admin exists by email even if not role=admin (safety)
            let seedUser = await User.findOne({ email: 'seed-admin@applybro.com' });
            if (!seedUser) {
                seedUser = await User.create({
                    name: 'Seed Admin',
                    email: 'seed-admin@applybro.com',
                    passwordHash: 'seeded_password_hash', // Dummy hash
                    role: 'admin',
                    preferences: {}
                });
            } else {
                seedUser.role = 'admin';
                await seedUser.save();
            }
            adminUser = seedUser;
        }
        console.log(`👤 Using Admin: ${adminUser.name} (${adminUser._id})`);

        // 2. Clear existing Guidance
        console.log('🗑️  Clearing existing guidance...');
        await Guidance.deleteMany({});
        console.log('✅ Existing guidance cleared');

        // 3. Define Guidance Data
        const guidanceItems = [
            // --- ARTICLES ---
            {
                title: 'Ultimate Guide to DAAD Scholarships',
                description: 'Everything you need to know about applying for DAAD scholarships in Germany.',
                content: `The DAAD (German Academic Exchange Service) offers a wide range of scholarships...
                
                ### Eligibility Criteria
                - Completed Bachelor's degree
                - at least 2 years of professional experience
                - English or German language proficiency
                
                ### Application Process
                1. Choose your program
                2. Prepare documents (CV, Motivation Letter, Certificates)
                3. Submit via DAAD portal
                
                Good luck!`,
                type: 'article',
                topic: 'DAAD',
                thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000&auto=format&fit=crop', // Germany/Travel
                readTime: '8 min',
                difficulty: 'Intermediate',
                createdBy: adminUser._id
            },
            {
                title: 'Writing a Winning Statement of Purpose (SOP)',
                description: 'Learn the structure and secrets of a successful SOP for top universities.',
                content: `Your SOP is your personal story. It should explain WHO you are, WHAT you want to study, and WHY.
                
                ### Key Structure
                1. **Hook:** Start with an engaging anecdote.
                2. **Academic Background:** Briefly mention your undergrad achievements.
                3. **Professional Experience:** Connect your work to your future studies.
                4. **Why This University:** Be specific about professors and courses.
                `,
                type: 'article',
                topic: 'SOP',
                thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop', // Writing/Study
                readTime: '12 min',
                difficulty: 'Advanced',
                createdBy: adminUser._id
            },
            {
                title: 'US Student Visa (F1) Application Steps',
                description: 'Step-by-step walkthrough for the F1 visa interview and application.',
                content: `Getting an F1 visa involves several steps:
                1. Get accepted and receive I-20 form.
                2. Pay SEVIS fee.
                3. Complete DS-160.
                4. Schedule interview.
                `,
                type: 'article',
                topic: 'Visas',
                thumbnail: 'https://images.unsplash.com/photo-1544262105-0249da26c27f?q=80&w=1000&auto=format&fit=crop', // Passport/Travel
                readTime: '10 min',
                difficulty: 'Intermediate',
                createdBy: adminUser._id
            },

            // --- VIDEOS ---
            {
                title: 'IELTS Speaking Test: Band 9 Example',
                description: 'Watch a full mock test of a Band 9 Speaking candidate.',
                videoUrl: 'https://www.youtube.com/embed/sRFEV28r9lY', // Example URL (often embeds need specific format, but standard URL works for seeded players usually if handled)
                // Note: Frontend uses <video src="...">, implying direct file or direct link. YouTube links often fail in <video> tags. 
                // However, I'll use a sample mp4 URL if possible, or just a placeholder if the player supports it.
                // Re-reading frontend: <video src={activeVideo?.videoUrl} ... />. This requires a direct video file (mp4/webm).
                // YouTube links WON'T work in a <video> tag. 
                // I will use a sample public MP4 for testing.
                videoUrl: 'https://cdn.coverr.co/videos/coverr-reading-books-in-library-4592/1080p.mp4',
                type: 'video',
                topic: 'IELTS',
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop', // Speaking/Interview
                duration: '15 min',
                createdBy: adminUser._id
            },
            {
                title: 'How to Write a Motivation Letter for Scholarship',
                description: 'Expert tips on drafting a compelling motivation letter.',
                videoUrl: 'https://cdn.coverr.co/videos/coverr-typing-on-computer-keyboard-4663/1080p.mp4',
                type: 'video',
                topic: 'Motivation Letter',
                thumbnail: 'https://images.unsplash.com/photo-1517433007180-2d929d2b23a7?q=80&w=1000&auto=format&fit=crop', // Writing
                duration: '8 min',
                createdBy: adminUser._id
            },

            // --- TESTS ---
            {
                title: 'IELTS Reading Practice Test 1',
                description: 'Test your reading skills with this timed practice module.',
                type: 'test',
                topic: 'IELTS',
                thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop', // Books
                difficulty: 'Intermediate',
                questions: [
                    {
                        questionText: 'What is the main purpose of the passage?',
                        options: ['To inform', 'To persuade', 'To entertain', 'To criticize'],
                        correctOptionIndex: 0
                    },
                    {
                        questionText: 'Which statement is true according to the text?',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctOptionIndex: 2
                    }
                ],
                createdBy: adminUser._id
            },
            {
                title: 'General Scholarship Eligibility Quiz',
                description: 'Find out if you qualify for major international scholarships.',
                type: 'test',
                topic: 'General',
                thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop', // Exam
                difficulty: 'Beginner',
                questions: [
                    {
                        questionText: 'Do you have a Bachelor\'s degree?',
                        options: ['Yes', 'No', 'In Progress'],
                        correctOptionIndex: 0
                    },
                    {
                        questionText: 'What is your GPA?',
                        options: ['Below 2.5', '2.5 - 3.0', '3.0 - 3.5', 'Above 3.5'],
                        correctOptionIndex: 3
                    }
                ],
                createdBy: adminUser._id
            },

            // --- FAQs ---
            {
                title: 'Do I need IELTS for USA?',
                description: 'Common question regarding English proficiency requirements.',
                content: `Most universities in the USA require an English proficiency test like TOEFL or IELTS. However, some universities may waive this requirement if your previous education was in English.`,
                type: 'faq',
                topic: 'IELTS',
                thumbnail: 'https://images.unsplash.com/photo-1565514020176-db79238b6d87?q=80&w=1000&auto=format&fit=crop', // Question mark
                readTime: '2 min',
                difficulty: 'Beginner',
                createdBy: adminUser._id
            },
            {
                title: 'How much bank balance is required for F1 Visa?',
                description: 'Financial requirements for US student visa.',
                content: `You typically need to show liquid funds covering at least one year of tuition and living expenses as stated on your I-20 form.`,
                type: 'faq',
                topic: 'Visas',
                thumbnail: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=1000&auto=format&fit=crop', // Money
                readTime: '3 min',
                difficulty: 'Intermediate',
                createdBy: adminUser._id
            }
        ];

        // 4. Insert Data
        console.log(`📚 Inserting ${guidanceItems.length} guidance items...`);
        await Guidance.insertMany(guidanceItems);
        console.log('✅ Guidance items inserted successfully');

    } catch (error) {
        console.error('❌ Error seeding guidance:', error);
    } finally {
        console.log('🔌 Database connection closed');
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedDatabase();

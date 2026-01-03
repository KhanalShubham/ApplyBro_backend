import mongoose from 'mongoose';
import Scholarship from '../src/models/scholarship.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

const scholarshipsData = [
    {
        title: 'MEXT (Monbukagakusho) Scholarship',
        country: 'Japan',
        countryFlag: '🇯🇵',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'Ministry of Education, Culture, Sports, Science and Technology (MEXT)',
            website: 'https://www.mext.go.jp/en/',
            location: {
                country: 'Japan',
                city: 'Tokyo',
                address: '3-2-2 Kasumigaseki, Chiyoda-ku, Tokyo 100-8959'
            }
        },
        level: ['Undergraduate', 'Master', 'PhD'],
        benefits: 'Full tuition waiver, Monthly stipend (approx. 117,000–145,000 JPY), Round-trip airfare, Accommodation support, Japanese language training.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Academic Transcripts', 'Recommendation Letters', 'Health Certificate', 'Research Proposal'],
            minGPA: 3.0
        },
        fields: ['Engineering', 'IT', 'Science', 'Social Science', 'Humanities', 'Japanese Studies'],
        requirements: ['Japanese / English (depends on program)', 'Age under 35 for graduates', 'Good physical and mental health'],
        description: 'The MEXT Scholarship is a prestigious fully funded program by the Japanese Government. It offers students the opportunity to study at Japanese universities with a full tuition waiver and a monthly living allowance. Applicants can apply via Embassy Recommendation or University Recommendation tracks.',
        deadline: new Date('2026-05-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'DAAD Scholarship',
        country: 'Germany',
        countryFlag: '🇩🇪',
        imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'German Academic Exchange Service (DAAD)',
            website: 'https://www.daad.de/en/',
            location: {
                country: 'Germany',
                city: 'Bonn',
                address: 'Kennedyallee 50, 53175 Bonn'
            }
        },
        level: ['Master', 'PhD'],
        benefits: 'Monthly stipend (€934 for grads, €1,200 for PhD), Health insurance, Travel allowance, Rent subsidy (if applicable)',
        eligibility: {
            nationality: ['Nepal', 'Developing Countries'],
            requiredDocs: ['DAAD Application Form', 'CV (Europass)', 'Motivation Letter', 'Transcripts']
        },
        fields: ['Engineering', 'IT', 'Public Policy', 'Development Studies', 'Economics', 'Environmental Science'],
        requirements: ['English (IELTS 6.5+) / German (TestDaF)', 'At least 2 years of work experience (for some programs)', 'Bachelor degree not older than 6 years'],
        description: 'The DAAD Scholarship is the world’s largest funding organisation for the international exchange of students and researchers. Targeted at developing countries, it supports Development-Related Postgraduate Courses (EPOS) with full financial backing.',
        deadline: new Date('2026-10-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Erasmus Mundus Joint Master Degree',
        country: 'Multiple (EU)',
        countryFlag: '🇪🇺',
        imageUrl: 'https://images.unsplash.com/photo-1467049293311-8c2750cda7a1?q=80&w=2072&auto=format&fit=crop',
        university: {
            name: 'European Union',
            website: 'https://erasmus-plus.ec.europa.eu/',
            location: {
                country: 'European Union',
                city: 'Brussels',
                address: 'Rue de la Loi 200 / Wetstraat 200, 1049 Brussels, Belgium'
            }
        },
        level: ['Master'],
        benefits: 'Full participation costs (tuition, insurance), Monthly allowance (€1,400), Travel & installation costs (€3,000 per year).',
        eligibility: {
            nationality: ['Global', 'Nepal'],
            requiredDocs: ['Proof of Residence', 'Degree Certificate', '2 Letters of Recommendation', 'English Proficiency']
        },
        fields: ['Data Science', 'Engineering', 'Business', 'Health', 'Social Science', 'Sustainable Energy'],
        requirements: ['English (IELTS 6.5+)', 'Bachelor Degree', 'No age limit'],
        description: 'Erasmus Mundus Joint Masters are high-level integrated study programmes delivered by an international partnership of higher education institutions. Students study in at least two different European countries, gaining a joint degree upon graduation.',
        deadline: new Date('2026-01-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Chevening Scholarship',
        country: 'United Kingdom',
        countryFlag: '🇬🇧',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2068&auto=format&fit=crop',
        university: {
            name: 'Foreign, Commonwealth & Development Office',
            website: 'https://www.chevening.org/',
            location: {
                country: 'United Kingdom',
                city: 'London',
                address: 'King Charles Street, London, SW1A 2AH'
            }
        },
        level: ['Master'],
        benefits: 'Full university tuition fees, Monthly stipend, Return airfare to UK, Visa fees, Travel grants to attend Chevening events.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Essay Questions', 'References', 'Unconditional Offer from UK Uni', 'Transcripts']
        },
        fields: ['All fields'],
        requirements: ['English (IELTS)', 'Min. 2 years work experience (2800 hours)', 'Return to home country for 2 years after award'],
        description: 'Chevening is the UK government’s international awards programme aimed at developing global leaders. Funded by the FCDO, it offers a unique opportunity for future leaders to study in the UK for one year on a fully funded master’s degree.',
        deadline: new Date('2026-11-01'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Commonwealth Scholarship',
        country: 'United Kingdom',
        countryFlag: '🇬🇧',
        imageUrl: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=1974&auto=format&fit=crop',
        university: {
            name: 'Commonwealth Scholarship Commission',
            website: 'https://cscuk.fcdo.gov.uk/',
            location: {
                country: 'United Kingdom',
                city: 'London',
                address: 'Woburn House, 20-24 Tavistock Square, London WC1H 9HF'
            }
        },
        level: ['Master', 'PhD'],
        benefits: 'Approved airfare, Approved tuition, Stipend (£1,347/month, higher in London), Warm clothing allowance, Study travel grant.',
        eligibility: {
            nationality: ['Nepal', 'Commonwealth Countries'],
            requiredDocs: ['Citizenship Proof', 'Transcripts', 'References', 'Supporting Statement']
        },
        fields: ['Development-focused programs', 'Science & Tech', 'Health Systems', 'Global Prosperity'],
        requirements: ['English', 'Unable to afford study in UK without scholarship', 'First Class or Upper Second Class degree'],
        description: 'The Commonwealth Scholarship Commission in the UK provides the main UK government scholarship scheme led by international development objectives. It is designed for talent from least developed and middle-income Commonwealth countries.',
        deadline: new Date('2026-01-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Australia Awards Scholarship',
        country: 'Australia',
        countryFlag: '🇦🇺',
        imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'Australian Government (DFAT)',
            website: 'https://www.dfat.gov.au/people-to-people/australia-awards',
            location: {
                country: 'Australia',
                city: 'Canberra',
                address: 'R.G. Casey Building, John McEwen Crescent, Barton ACT 0221'
            }
        },
        level: ['Bachelor', 'Master'],
        benefits: 'Full tuition fees, Return air travel, Establishment allowance (A$5,000), Contribution to Living Expenses (CLE), OSHC Health Cover.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Passport', 'Academic Transcripts', 'IELTS/TOEFL Score', 'Curriculum Vitae', 'Referee Reports']
        },
        fields: ['Development', 'Engineering', 'Health', 'Education', 'Governance', 'Agriculture'],
        requirements: ['English (IELTS 6.5, no band < 6.0)', 'Return to Nepal for 2 years', 'Min. 2 years work experience likely required'],
        description: 'Australia Awards are prestigious international scholarships and short courses offering the next generation of global leaders an opportunity to undertake study, research and professional development in Australia.',
        deadline: new Date('2026-04-30'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Fulbright Foreign Student Program',
        country: 'USA',
        countryFlag: '🇺🇸',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'U.S. Department of State',
            website: 'https://fulbright.state.gov/',
            location: {
                country: 'USA',
                city: 'Washington D.C.',
                address: 'Bureau of Educational and Cultural Affairs'
            }
        },
        level: ['Master', 'PhD'],
        benefits: 'Tuition and fees, Monthly maintenance allowance, Health & Accident insurance, Round-trip travel, Book & Research allowance.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['3 Letters of Reference', 'Standardized Test Scores (GRE/GMAT)', 'Transcripts', 'Personal Statement']
        },
        fields: ['STEM', 'Social Sciences', 'Arts', 'Public Health', 'Economics'],
        requirements: ['English (TOEFL/IELTS)', 'Bachelor degree (4 years) or eqv.', 'Commitment to return to Nepal'],
        description: 'The Fulbright Foreign Student Program enables graduate students, young professionals and artists from abroad to study and conduct research in the United States. It operates in more than 160 countries worldwide.',
        deadline: new Date('2026-06-30'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Global Korea Scholarship (GKS)',
        country: 'South Korea',
        countryFlag: '🇰🇷',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'NIIED (Korean Government)',
            website: 'https://www.studyinkorea.go.kr/',
            location: {
                country: 'South Korea',
                city: 'Sejong-si',
                address: '191 Jeongjail-ro, Bundang-gu, Seongnam-si, Gyeonggi-do'
            }
        },
        level: ['Undergraduate', 'Graduate'],
        benefits: 'Airfare, Settlement Allowance (200,000 KRW), Monthly Allowance (1,000,000 KRW), Medical Insurance, Language Training Fee, Tuition.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Personal Statement', 'Study Plan', 'Letters of Recommendation', 'GKS Applicant Agreement']
        },
        fields: ['Engineering', 'IT', 'Business', 'Sciences', 'Korean Language', 'International Relations'],
        requirements: ['GPA > 80% or top 20% of class', 'Under 25 (UG) or 40 (Grad)', 'Korean/English proficiency preferred'],
        description: 'GKS is designed to provide international students with an opportunity to conduct advanced studies at higher educational institutions in Korea, promoting international exchange in education and mutual friendship.',
        deadline: new Date('2026-03-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Chinese Government Scholarship (CSC)',
        country: 'China',
        countryFlag: '🇨🇳',
        imageUrl: 'https://images.unsplash.com/photo-1547981609-4b6bfe6770b0?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'China Scholarship Council',
            website: 'https://www.campuschina.org/',
            location: {
                country: 'China',
                city: 'Beijing',
                address: 'Level 13, Building A3, No. 9 Chegongzhuang Avenue, Beijing'
            }
        },
        level: ['Bachelor', 'Master', 'PhD'],
        benefits: 'Tuition waiver, Free university dormitory or subsidy, Monthly stipend (2,500-3,500 CNY), Comprehensive Medical Insurance.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['CSC Application Form', 'Notarized Highest Diploma', 'Foreigner Physical Examination Form', 'Study Plan']
        },
        fields: ['Engineering', 'Medicine', 'IT', 'Business', 'Agriculture', 'Chinese Language'],
        requirements: ['Language proficiency (HSK for Chinese, IELTS/TOEFL for English)', 'Age limits apply per degree level'],
        description: 'Established by the Ministry of Education of China, this scholarship supports international students, teachers and scholars to study and conduct research in Chinese universities.',
        deadline: new Date('2026-04-30'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Swedish Institute Scholarship',
        country: 'Sweden',
        countryFlag: '🇸🇪',
        imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'Swedish Institute',
            website: 'https://si.se/en/scholarships/',
            location: {
                country: 'Sweden',
                city: 'Stockholm',
                address: 'Virakesvägen 2, 120 30 Stockholm'
            }
        },
        level: ['Master'],
        benefits: 'Full tuition fees, Monthly payment (SEK 12,000), Insurance against illness and accident, Travel Grant (SEK 10,000).',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['CV', 'Letters of Reference', 'Proof of Work Experience', 'Motivation Letter']
        },
        fields: ['Sustainability', 'Technology', 'Policy', 'Innovation', 'Human Rights'],
        requirements: ['Min. 3,000 hours of work experience', 'Leadership experience', 'Admission to a Swedish master\'s programme'],
        description: 'The Swedish Institute Scholarship for Global Professionals (SISGP) is a highly competitive fully funded scholarship that aims to develop future global leaders. It targets professionals with ambition to contribute to sustainable development.',
        deadline: new Date('2026-01-31'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Orange Knowledge Programme',
        country: 'Netherlands',
        countryFlag: '🇳🇱',
        imageUrl: 'https://images.unsplash.com/photo-1596707328731-297eb6e55648?q=80&w=2070&auto=format&fit=crop',
        university: {
            name: 'Nuffic (Dutch Govt)',
            website: 'https://www.studyinnl.org/finances/orange-knowledge-programme',
            location: {
                country: 'Netherlands',
                city: 'The Hague',
                address: 'Kortenaerkade 11, 2518 AX The Hague'
            }
        },
        level: ['Short Course', 'Master'],
        benefits: 'Cost of living, Tuition fees, Visas, Travel, Insurance (Partial or Full funding depending on employer contribution).',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Employer Statement', 'Government Statement (if applicable)', 'Copy of Passport', 'Admission Letter']
        },
        fields: ['Agriculture', 'Water', 'Development', 'Food & Nutrition', 'Sexual Health'],
        requirements: ['Mid-career professional', 'Working in a priority field', 'English/French proficiency'],
        description: 'The Orange Knowledge Programme is a Dutch global development programme implementing a holistic approach to strengthening higher education and vocational education training in developing countries.',
        deadline: new Date('2026-06-30'),
        verified: true,
        status: 'open'
    },
    {
        title: 'Manaaki New Zealand Scholarship',
        country: 'New Zealand',
        countryFlag: '🇳🇿',
        imageUrl: 'https://images.unsplash.com/photo-1548545582-777353ae41d0?q=80&w=2071&auto=format&fit=crop',
        university: {
            name: 'New Zealand Government',
            website: 'https://www.nzscholarships.govt.nz/',
            location: {
                country: 'New Zealand',
                city: 'Wellington',
                address: 'Ministry of Foreign Affairs and Trade'
            }
        },
        level: ['Undergraduate', 'Master', 'PhD'],
        benefits: 'Full tuition fees, Living allowance (NZ$ 531/week), Establishment allowance (NZ$ 3,000), Medical insurance, Travel.',
        eligibility: {
            nationality: ['Nepal'],
            requiredDocs: ['Verified Transcripts', 'English Language Test (IELTS/PTE)', 'Birth Certificate']
        },
        fields: ['Renewable Energy', 'Agriculture', 'Disaster Risk Management', 'Public Sector Management'],
        requirements: ['18 years or older', 'English proficiency', 'Commitment to return to home country for 2 years'],
        description: 'Manaaki New Zealand Scholarships help build prosperity, security, and sustainable growth in partner countries. They are funded by the New Zealand Government and offer a world-class education.',
        deadline: new Date('2026-02-28'),
        verified: true,
        status: 'open'
    }
];

async function seedScholarships() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        console.log('🗑️  Clearing existing Scholarships...');
        await Scholarship.deleteMany({});
        console.log('✅ Scholarships cleared\n');

        console.log(`📚 Inserting ${scholarshipsData.length} enriched Scholarships...`);
        const inserted = await Scholarship.insertMany(scholarshipsData);
        console.log(`✅ Successfully inserted ${inserted.length} scholarships with images and real details\n`);

        await mongoose.connection.close();
        console.log('🎉 Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding scholarships:', error);
        process.exit(1);
    }
}

seedScholarships();

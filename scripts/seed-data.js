import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scholarship from '../src/models/scholarship.model.js';
import Guidance from '../src/models/guidance.model.js';
import User from '../src/models/user.model.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

// Scholarship data
const scholarships = [
    {
        title: "DAAD Scholarship for Development-Related Postgraduate Courses",
        description: "The German Academic Exchange Service (DAAD) offers scholarships to graduate students from developing countries to pursue a master's degree in Germany. This comprehensive program covers tuition, living expenses, and travel costs.",
        country: "Germany",
        countryFlag: "🇩🇪",
        imageUrl: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800",
        university: {
            name: "Various German Universities",
            location: {
                country: "Germany",
                city: "Multiple Cities",
                address: "Kennedyallee 50, 53175 Bonn"
            },
            website: "https://www.daad.de"
        },
        requirements: [
            "Bachelor's degree with above-average results",
            "At least 2 years of professional experience",
            "IELTS 6.5 or TOEFL 88 (for English programs)",
            "German language proficiency (for German programs)",
            "Motivation letter and research proposal"
        ],
        level: "Master",
        fields: ["Engineering", "Agriculture", "Public Health", "Development Economics", "Environmental Sciences"],
        deadline: new Date("2025-09-30"),
        eligibility: {
            minGPA: 3.0,
            requiredDocs: ["CV", "Motivation Letter", "Recommendation Letters", "Transcripts", "Language Certificate"],
            nationality: ["Developing Countries"]
        },
        benefits: "Full tuition coverage, monthly stipend of €934, health insurance, travel allowance, and study & research allowance",
        amount: "€934/month + Full Tuition",
        externalLink: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
        status: "open",
        verified: true
    },
    {
        title: "Chevening Scholarships UK",
        description: "Chevening Scholarships are the UK government's global scholarship programme, funded by the Foreign and Commonwealth Office (FCO) and partner organisations. Awards are typically for a one-year Master's degree.",
        country: "United Kingdom",
        countryFlag: "🇬🇧",
        imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
        university: {
            name: "UK Universities",
            location: {
                country: "United Kingdom",
                city: "Various Cities",
                address: "London, United Kingdom"
            },
            website: "https://www.chevening.org"
        },
        requirements: [
            "Undergraduate degree equivalent to UK upper second-class 2:1 honors",
            "At least 2 years of work experience",
            "IELTS 6.5 overall (5.5 in each component)",
            "Apply to 3 eligible UK universities",
            "Return to home country for minimum 2 years after scholarship"
        ],
        level: "Master",
        fields: ["Business", "Law", "Public Policy", "International Relations", "Economics", "Media"],
        deadline: new Date("2025-11-07"),
        eligibility: {
            minGPA: 3.3,
            requiredDocs: ["Personal Statement", "Reference Letters", "University Offers", "IELTS Certificate"],
            nationality: ["160+ Countries Eligible"]
        },
        benefits: "Full tuition fees, monthly living allowance, travel costs, arrival and departure allowances, visa application cost",
        amount: "Full Tuition + £1,347/month",
        externalLink: "https://www.chevening.org/scholarships/",
        status: "open",
        verified: true
    },
    {
        title: "Fulbright Foreign Student Program USA",
        description: "The Fulbright Program offers scholarships for graduate students, young professionals and artists from abroad to study and conduct research in the United States.",
        country: "United States",
        countryFlag: "🇺🇸",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
        university: {
            name: "US Universities",
            location: {
                country: "United States",
                city: "Various Cities",
                address: "Washington, DC"
            },
            website: "https://foreign.fulbrightonline.org"
        },
        requirements: [
            "Bachelor's degree or equivalent",
            "TOEFL iBT 80+ or IELTS 6.5+",
            "Strong academic record",
            "Statement of Purpose",
            "Research proposal (for research programs)",
            "Commitment to return to home country"
        ],
        level: "Master",
        fields: ["Sciences", "Engineering", "Social Sciences", "Humanities", "Arts"],
        deadline: new Date("2025-10-15"),
        eligibility: {
            minGPA: 3.5,
            requiredDocs: ["Statement of Purpose", "Transcripts", "Language Test", "Letters of Recommendation", "CV"],
            nationality: ["160+ Countries"]
        },
        benefits: "Tuition, airfare, living stipend, health insurance",
        amount: "Full Tuition + $1,500-2,500/month",
        externalLink: "https://foreign.fulbrightonline.org/",
        status: "open",
        verified: true
    },
    {
        title: "Swedish Institute Scholarships for Global Professionals",
        description: "SISGP is a scholarship program for global professionals to develop professionally and academically, to experience Swedish society and culture, and to build long-lasting relations with Sweden and with each other.",
        country: "Sweden",
        countryFlag: "🇸🇪",
        imageUrl: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800",
        university: {
            name: "Swedish Universities",
            location: {
                country: "Sweden",
                city: "Various Cities",
                address: "Stockholm, Sweden"
            },
            website: "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/"
        },
        requirements: [
            "Bachelor's degree or equivalent",
            "At least 3,000 hours of work experience",
            "IELTS 6.5 or TOEFL 90",
            "Leadership qualities and commitment to making a difference",
            "Citizenship in eligible countries"
        ],
        level: "Master",
        fields: ["Sustainability", "Innovation", "Social Sciences", "Business", "Engineering"],
        deadline: new Date("2025-02-20"),
        eligibility: {
            minGPA: 3.2,
            requiredDocs: ["CV", "Motivation Letter", "References", "University Admission", "Language Certificate"],
            nationality: ["Eligible Countries List on Website"]
        },
        benefits: "Full tuition fee, living expenses SEK 11,000/month, travel grant, insurance",
        amount: "Full Tuition + SEK 11,000/month",
        externalLink: "https://si.se/en/apply/scholarships/",
        status: "upcoming",
        verified: true
    },
    {
        title: "Australia Awards Scholarships",
        description: "Australia Awards Scholarships are long-term development awards administered by the Australian Government that provide opportunities for people from developing countries, particularly those in the Indo-Pacific region.",
        country: "Australia",
        countryFlag: "🇦🇺",
        imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800",
        university: {
            name: "Australian Universities",
            location: {
                country: "Australia",
                city: "Various Cities",
                address: "Canberra, Australia"
            },
            website: "https://www.dfat.gov.au/people-to-people/australia-awards"
        },
        requirements: [
            "Minimum undergraduate degree",
            "IELTS 6.5 (no band less than 6.0) or equivalent",
            "Work experience (preferred)",
            "Leadership potential",
            "Commitment to return home after studies"
        ],
        level: "Master",
        fields: ["Public Policy", "Education", "Agriculture", "Health", "Infrastructure", "Environment"],
        deadline: new Date("2025-04-30"),
        eligibility: {
            minGPA: 3.0,
            requiredDocs: ["Application Form", "Academic Transcripts", "IELTS Results", "References", "Employer Support Letter"],
            nationality: ["Indo-Pacific Region Countries"]
        },
        benefits: "Full tuition, return air travel, establishment allowance, living allowance, health insurance",
        amount: "Full Tuition + AUD 3,511/month",
        externalLink: "https://www.dfat.gov.au/people-to-people/australia-awards/",
        status: "open",
        verified: true
    },
    {
        title: "Erasmus Mundus Joint Master Degrees",
        description: "Erasmus Mundus Joint Master Degrees are prestigious, integrated, international study programmes, jointly delivered by an international consortium of higher education institutions.",
        country: "European Union",
        countryFlag: "🇪🇺",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
        university: {
            name: "Multiple European Universities",
            location: {
                country: "European Union",
                city: "Multiple Cities",
                address: "Brussels, Belgium"
            },
            website: "https://ec.europa.eu/programmes/erasmus-plus/"
        },
        requirements: [
            "Bachelor's degree",
            "English proficiency (IELTS 6.5 or TOEFL 90)",
            "Academic excellence",
            "Motivation letter",
            "Specific requirements vary by program"
        ],
        level: "Master",
        fields: ["Engineering", "Environmental Sciences", "Computer Science", "Business", "Social Sciences", "Medicine"],
        deadline: new Date("2025-01-15"),
        eligibility: {
            minGPA: 3.5,
            requiredDocs: ["Transcripts", "Motivation Letter", "CV", "Language Certificate", "Recommendation Letters"],
            nationality: ["Worldwide"]
        },
        benefits: "€1,400/month scholarship, travel costs, installation costs, tuition fees covered",
        amount: "€1,400/month + Full Tuition",
        externalLink: "https://ec.europa.eu/programmes/erasmus-plus/opportunities/individuals/students/erasmus-mundus-joint-master-degrees_en",
        status: "upcoming",
        verified: true
    },
    {
        title: "Swiss Government Excellence Scholarships",
        description: "The Swiss Government Excellence Scholarships are aimed at young researchers from abroad who have completed a master's degree or PhD and at foreign artists holding a bachelor's degree.",
        country: "Switzerland",
        countryFlag: "🇨🇭",
        imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
        university: {
            name: "Swiss Universities",
            location: {
                country: "Switzerland",
                city: "Various Cities",
                address: "Bern, Switzerland"
            },
            website: "https://www.sbfi.admin.ch/scholarships"
        },
        requirements: [
            "Master's degree with excellent academic record",
            "Research proposal approved by Swiss supervisor",
            "Language proficiency (English, German, or French)",
            "Born after December 31, 1989"
        ],
        level: "PhD",
        fields: ["Natural Sciences", "Engineering", "Social Sciences", "Humanities", "Arts"],
        deadline: new Date("2025-12-15"),
        eligibility: {
            minGPA: 3.7,
            requiredDocs: ["Research Proposal", "CV", "Transcripts", "Recommendation Letters", "Language Certificate"],
            nationality: ["180+ Countries"]
        },
        benefits: "CHF 1,920/month, health insurance, housing allowance, tuition fees",
        amount: "CHF 1,920/month + Benefits",
        externalLink: "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
        status: "open",
        verified: true
    },
    {
        title: "Orange Knowledge Programme Netherlands",
        description: "The Orange Knowledge Programme (OKP) is a budget programme of the Dutch Ministry of Foreign Affairs. It aims to contribute to the development, to strengthen the position of partner countries through skills development.",
        country: "Netherlands",
        countryFlag: "🇳🇱",
        imageUrl: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800",
        university: {
            name: "Dutch Universities",
            location: {
                country: "Netherlands",
                city: "Various Cities",
                address: "The Hague, Netherlands"
            },
            website: "https://www.studyinholland.nl/scholarships"
        },
        requirements: [
            "Bachelor's degree",
            "Professional work experience",
            "IELTS 6.0 or TOEFL 80",
            "Employed in eligible country",
            "Commitment to return home"
        ],
        level: "Master",
        fields: ["Agriculture", "Water Management", "Public Health", "Education", "Rights"],
        deadline: new Date("2025-03-01"),
        eligibility: {
            minGPA: 3.0,
            requiredDocs: ["Application Form", "Employer Statement", "CV", "Motivation Letter", "Academic Documents"],
            nationality: ["Selected Developing Countries"]
        },
        benefits: "Full tuition, travel costs, visa costs, living allowance, insurance",
        amount: "Full Tuition + €1,000/month",
        externalLink: "https://www.studyinholland.nl/finances/scholarships/highlighted-scholarships/orange-knowledge-programme",
        status: "open",
        verified: true
    },
    {
        title: "Gates Cambridge Scholarships",
        description: "Gates Cambridge Scholarships are one of the most prestigious international scholarships in the world. They are awarded to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree.",
        country: "United Kingdom",
        countryFlag: "🇬🇧",
        imageUrl: "https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?w=800",
        university: {
            name: "University of Cambridge",
            location: {
                country: "United Kingdom",
                city: "Cambridge",
                address: "Trinity Ln, Cambridge CB2 1TQ"
            },
            website: "https://www.gatescambridge.org"
        },
        requirements: [
            "Outstanding intellectual ability",
            "Leadership potential",
            "Commitment to improving lives of others",
            "Good fit with Cambridge",
            "Strong academic record"
        ],
        level: "Master",
        fields: ["All Subjects"],
        deadline: new Date("2025-12-06"),
        eligibility: {
            minGPA: 3.8,
            requiredDocs: ["Research Proposal", "Personal Statement", "References", "Academic Transcripts"],
            nationality: ["Non-UK Citizens"]
        },
        benefits: "Full tuition, maintenance allowance £20,000/year, airfare, visa costs, family allowance",
        amount: "Full Tuition + £20,000/year",
        externalLink: "https://www.gatescambridge.org/",
        status: "open",
        verified: true
    },
    {
        title: "Korean Government Scholarship Program (KGSP)",
        description: "The Korean Government Scholarship Program offers international students an opportunity to conduct advanced studies at higher educational institutions in Korea for a bachelor's, master's, or doctoral degree.",
        country: "South Korea",
        countryFlag: "🇰🇷",
        imageUrl: "https://images.unsplash.com/photo-1583393838768-881e3fb87e35?w=800",
        university: {
            name: "Korean Universities",
            location: {
                country: "South Korea",
                city: "Various Cities",
                address: "Seoul, South Korea"
            },
            website: "https://www.studyinkorea.go.kr"
        },
        requirements: [
            "Bachelor's degree for Master's program",
            "Age under 40",
            "GPA 2.64/4.0 or above in bachelor's",
            "Good health",
            "Preference for Korean language ability"
        ],
        level: "Master",
        fields: ["Engineering", "Natural Sciences", "Korean Studies", "Business", "Arts"],
        deadline: new Date("2025-03-22"),
        eligibility: {
            minGPA: 2.64,
            requiredDocs: ["Application Form", "Personal Statement", "Study Plan", "Recommendation Letters", "Health Certificate"],
            ageLimit: 40,
            nationality: ["Worldwide"]
        },
        benefits: "Full tuition, monthly allowance KRW 1,000,000, settlement allowance, Korean language training, airfare, medical insurance",
        amount: "Full Tuition + KRW 1,000,000/month",
        externalLink: "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
        status: "upcoming",
        verified: true
    }
];

// Guidance data
const guidances = [
    {
        title: "Complete Guide to IELTS Preparation",
        description: "Master all four sections of IELTS with proven strategies, tips, and practice materials to achieve your target band score.",
        content: `# Complete IELTS Preparation Guide

## Introduction
The International English Language Testing System (IELTS) is one of the world's most popular English proficiency tests. This comprehensive guide will help you prepare effectively for all four sections.

## Test Format
- **Listening**: 30 minutes + 10 minutes transfer time
- **Reading**: 60 minutes
- **Writing**: 60 minutes
- **Speaking**: 11-14 minutes

## Listening Section Tips
1. Practice active listening daily
2. Use authentic materials (podcasts, news, lectures)
3. Focus on different accents (British, Australian, American)
4. Learn to identify keywords and paraphrase

## Reading Section Strategies
1. Skim and scan techniques
2. Time management (20 minutes per passage)
3. Understand question types
4. Practice with academic texts

## Writing Section
### Task 1 (20 minutes)
- Describe visual information clearly
- Use appropriate vocabulary
- Organize response logically

### Task 2 (40 minutes)
- Plan your essay (5 minutes)
- Write 250+ words
- Use cohesive devices
- Present clear arguments

## Speaking Section
1. Practice speaking daily
2. Record yourself
3. Expand your vocabulary
4. Stay calm and confident

## Study Schedule
- 8-12 weeks preparation recommended
- Daily practice: 2-3 hours
- Weekly mock tests
- Regular vocabulary building`,
        type: "article",
        topic: "IELTS",
        readTime: "15 min",
        difficulty: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400"
    },
    {
        title: "IELTS Reading Practice Test",
        description: "Test your IELTS reading skills with this comprehensive practice test covering all question types.",
        type: "test",
        topic: "IELTS",
        duration: "60 min",
        difficulty: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        questions: [
            {
                questionText: "The main purpose of a thesis statement in an essay is to:",
                options: [
                    "Introduce the topic",
                    "Present the main argument",
                    "Conclude the essay",
                    "Provide background information"
                ],
                correctOptionIndex: 1,
                explanation: "A thesis statement presents the main argument or claim of an essay, guiding the entire piece."
            },
            {
                questionText: "In IELTS Reading, 'True/False/Not Given' questions require you to:",
                options: [
                    "Give your opinion",
                    "Compare with passage information only",
                    "Use general knowledge",
                    "Summarize the passage"
                ],
                correctOptionIndex: 1,
                explanation: "These questions test whether information matches what's stated in the passage - not your opinion or external knowledge."
            },
            {
                questionText: "The best strategy for matching headings questions is to:",
                options: [
                    "Read the entire passage first",
                    "Skim paragraphs for main ideas",
                    "Find keywords only",
                    "Read headings multiple times"
                ],
                correctOptionIndex: 1,
                explanation: "Skimming each paragraph to understand its main idea is the most efficient approach for matching headings."
            }
        ]
    },
    {
        title: "How to Write a Compelling Statement of Purpose",
        description: "Learn the essential elements of an outstanding SOP that will make your application stand out to admission committees.",
        content: `# Writing a Compelling Statement of Purpose

## What is an SOP?
A Statement of Purpose (SOP) is a critical component of your graduate school application. It's your opportunity to tell your story and convince the admissions committee why you're the perfect candidate.

## Structure

### Introduction (1 paragraph)
- Hook the reader
- Briefly state your goals
- Mention the program you're applying to

### Academic Background (1-2 paragraphs)
- Relevant coursework
- Research experience
- Academic achievements
- Projects that shaped your interests

### Professional Experience (1-2 paragraphs)
- Work experience related to your field
- Skills developed
- How it influenced your decision

### Why This Program (1 paragraph)
- Specific professors you want to work with
- Unique program features
- Research facilities
- How it aligns with your goals

### Future Goals (1 paragraph)
- Short-term goals
- Long-term career aspirations
- How you'll contribute to the field

### Conclusion (1 paragraph)
- Summarize key points
- Reaffirm your interest
- Strong closing statement

## Do's and Don'ts

### Do:
✅ Be specific and personal
✅ Show passion and commitment
✅ Demonstrate research about the program
✅ Proofread multiple times
✅ Get feedback from mentors

### Don't:
❌ Use generic templates
❌ Include irrelevant information
❌ Exceed word limit
❌ Make grammar/spelling errors
❌ Be too humble or too arrogant

## Tips for Success
1. Start early (4-6 weeks before deadline)
2. Multiple drafts are essential
3. Tailor each SOP to specific programs
4. Use concrete examples
5. Maintain professional tone
6. Show, don't tell`,
        type: "article",
        topic: "SOP",
        readTime: "12 min",
        difficulty: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
    },
    {
        title: "DAAD Scholarship Application Masterclass",
        description: "Complete video tutorial on navigating the DAAD scholarship application process, from eligibility to submission.",
        type: "video",
        topic: "DAAD",
        videoUrl: "https://www.youtube.com/watch?v=example",
        duration: "45 min",
        difficulty: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
        content: `This comprehensive video covers:
- DAAD scholarship types
- Eligibility criteria
- Required documents
- Application timeline
- Writing effective motivation letters
- Common mistakes to avoid
- Interview preparation`
    },
    {
        title: "Student Visa Application FAQ",
        description: "Answers to the most frequently asked questions about student visa applications for popular study destinations.",
        type: "faq",
        topic: "Visa",
        readTime: "10 min",
        difficulty: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400",
        content: `# Student Visa FAQ

## General Questions

**Q: When should I apply for a student visa?**
A: Apply as soon as you receive your admission letter. Most countries recommend applying 3-4 months before your program starts.

**Q: How long does visa processing take?**
A: Processing times vary:
- USA (F-1): 3-5 weeks
- UK (Tier 4): 3 weeks
- Canada: 4-6 weeks
- Australia: 4 weeks
- Germany: 6-8 weeks

**Q: What documents are generally required?**
A: Common documents include:
- Valid passport
- Admission letter
- Financial proof
- Language proficiency certificates
- Photographs
- Health insurance
- Academic transcripts

## Financial Requirements

**Q: How much bank balance do I need?**
A: Varies by country:
- USA: Tuition + $15,000-20,000/year
- UK: Tuition + £1,023-1,334/month
- Canada: Tuition + CAD 10,000/year
- Australia: Tuition + AUD 21,041/year

**Q: Who can be my financial sponsor?**
A: Parents, legal guardians, or scholarship providers. Some countries also accept personal savings.

## Application Process

**Q: Do I need to attend an interview?**
A: Depends on the country:
- USA: Yes, mandatory
- UK: Usually no
- Canada: Sometimes
- Australia: Rarely

**Q: Can I work while studying?**
A: Most countries allow part-time work:
- USA: 20 hours/week on-campus
- UK: 20 hours/week
- Canada: 20 hours/week
- Australia: Unlimited hours

## After Visa Approval

**Q: When can I travel?**
A: USA allows entry 30 days before program start. Other countries vary - check your visa conditions.

**Q: What if my visa is rejected?**
A: You can usually reapply after addressing the rejection reasons. Some countries offer appeal processes.`
    },
    {
        title: "Motivation Letter Writing Guide",
        description: "Step-by-step guide to crafting a powerful motivation letter that highlights your strengths and aspirations.",
        content: `# Motivation Letter Writing Guide

## Difference: Motivation Letter vs SOP
- **Motivation Letter**: More personal, focuses on WHY
- **SOP**: More academic, focuses on WHAT and HOW

## Structure (1 page max)

### Opening Paragraph
- Introduce yourself briefly
- State the program and university
- Your main motivation (hook)

### Body Paragraphs (2-3)

**Paragraph 1: Academic Interest**
- What sparked your interest
- Relevant coursework/projects
- Academic achievements

**Paragraph 2: Why This Program**
- Specific features that attract you
- Faculty members you admire
- Unique opportunities

**Paragraph 3: Your Contribution**
- What you bring to the program
- Extracurricular activities
- Leadership experiences

### Closing Paragraph
- Summarize your enthusiasm
- Future vision
- Thank the committee

## Writing Tips

### Style
- Professional yet personal
- Active voice
- Specific examples
- Confident tone

### Content
- Connect your past, present, and future
- Show genuine interest
- Demonstrate research
- Be authentic

### Format
- 1 page (400-600 words)
- Standard font (Arial, Times New Roman)
- 12pt font size
- 1-inch margins

## Common Mistakes to Avoid
❌ Generic content
❌ Repeating CV information
❌ Focusing only on rankings
❌ Grammatical errors
❌ Exceeding length limit
❌ Being too modest or too boastful

## Sample Phrases

**Opening:**
- "I am writing to express my strong interest in..."
- "It has always been my aspiration to..."

**Body:**
- "My passion for [field] was ignited when..."
- "What particularly attracts me to your program is..."
- "Through my experience in..., I developed..."

**Closing:**
- "I am confident that [program] will provide..."
- "I look forward to contributing to..."`,
        type: "article",
        topic: "Motivation Letter",
        readTime: "10 min",
        difficulty: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400"
    },
    {
        title: "IELTS Speaking Part 2: Cue Card Strategies",
        description: "Video guide on how to excel in IELTS Speaking Part 2 with effective note-taking and speaking techniques.",
        type: "video",
        topic: "IELTS",
        videoUrl: "https://www.youtube.com/watch?v=example2",
        duration: "25 min",
        difficulty: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400",
        content: `This video covers:
- Understanding cue card structure
- Effective note-taking in 1 minute
- Organizing your 2-minute talk
- Extending your answer naturally
- Common cue card topics
- Practice examples with band 7+ responses`
    },
    {
        title: "Scholarship Essay Practice Test",
        description: "Practice writing scholarship essays with realistic prompts and evaluation criteria used by actual scholarship committees.",
        type: "test",
        topic: "General",
        duration: "90 min",
        difficulty: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
        questions: [
            {
                questionText: "Write a 500-word essay on: 'Describe a challenge you have overcome and how it has shaped your academic or career goals.'",
                options: [],
                explanation: "Evaluation criteria: (1) Clear narrative structure, (2) Specific examples, (3) Reflection on growth, (4) Connection to future goals, (5) Grammar and clarity"
            },
            {
                questionText: "In 300 words, explain: 'How will this scholarship help you achieve your educational objectives?'",
                options: [],
                explanation: "Evaluation criteria: (1) Specific program details, (2) Financial need context, (3) Short and long-term goals, (4) Gratitude and commitment, (5) Conciseness"
            },
            {
                questionText: "Describe in 400 words: 'How do you plan to use your education to make a positive impact in your community or field?'",
                options: [],
                explanation: "Evaluation criteria: (1) Community awareness, (2) Feasible plan, (3) Passion for service, (4) Realistic timeframe, (5) Measurable impact"
            }
        ]
    },
    {
        title: "Understanding University Application Deadlines",
        description: "Comprehensive guide to managing application timelines for various universities and countries.",
        content: `# University Application Deadlines Guide

## Timeline Overview

### 18-12 Months Before
- Research programs and universities
- Understand requirements
- Start preparing for standardized tests
- Build your CV/resume

### 12-8 Months Before
- Take language tests (IELTS/TOEFL)
- Take subject tests (GRE/GMAT if required)
- Request recommendation letters
- Start drafting SOP/motivation letters

### 8-6 Months Before
- Finalize university list
- Complete applications
- Gather all documents
- Apply for scholarships

### 6-3 Months Before
- Submit applications
- Follow up on recommendations
- Prepare for interviews
- Track application status

### 3-1 Months Before
- Receive decisions
- Accept offers
- Apply for visa
- Arrange accommodation

## Country-Specific Deadlines

### United States
- **Fall Intake (August/September)**
  - Early Decision: November 1-15
  - Regular Decision: December 1 - February 1
  - Rolling Admissions: Varies

### United Kingdom
- **UCAS Deadline**: January 15
- **Oxbridge Deadline**: October 15
- **Medicine Deadline**: October 15

### Germany
- **Winter Semester (October)**
  - Deadline: July 15
- **Summer Semester (April)**
  - Deadline: January 15

### Canada
- **Fall Intake (September)**
  - Deadline: January - March
- **Winter Intake (January)**
  - Deadline: September - October

### Australia
- **Semester 1 (February)**
  - Deadline: October - November
- **Semester 2 (July)**
  - Deadline: April - May

## Important Tips

1. **Apply Early**: Some programs are rolling admissions
2. **Set Reminders**: Use calendar alerts
3. **Check Multiple Sources**: Verify deadlines on official websites
4. **Time Zones Matter**: Clarify if deadline is local or destination time
5. **Complete Applications**: Don't wait until last minute

## Document Checklist
- [ ] Transcripts (certified)
- [ ] Test scores (official)
- [ ] Recommendation letters
- [ ] SOP/Essays
- [ ] CV/Resume
- [ ] Portfolio (if required)
- [ ] Financial documents
- [ ] Copy of passport
- [ ] Application fee payment`,
        type: "article",
        topic: "General",
        readTime: "12 min",
        difficulty: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400"
    },
    {
        title: "IELTS Writing Task 2 Sample Essays",
        description: "Collection of band 8+ sample essays for common IELTS Writing Task 2 topics with detailed analysis.",
        content: `# IELTS Writing Task 2 Sample Essays

## Essay Type 1: Opinion Essay

**Topic**: "Some people believe that university students should pay the full cost of their education. Others believe that university education should be free. Discuss both views and give your opinion."

**Band 8 Sample Answer** (280 words):

The question of who should bear the cost of higher education has been a contentious issue in many countries. While some argue that students should pay their own tuition fees, others contend that university education should be publicly funded. This essay will examine both perspectives before presenting my own viewpoint.

Those who advocate for students paying full tuition fees argue that higher education is a personal investment that leads to better career prospects and higher earning potential. They believe that when students pay for their education, they are more motivated to complete their degrees successfully. Furthermore, this approach reduces the burden on taxpayers who may not have benefited from university education themselves.

On the other hand, proponents of free university education argue that making higher education accessible to all, regardless of financial background, creates a more equitable society. They point out that many talented students from disadvantaged backgrounds are prevented from reaching their potential due to financial constraints. Additionally, a well-educated population benefits society as a whole through innovation, economic growth, and social development.

In my opinion, a balanced approach would be most effective. While I believe that basic university education should be subsidized by the government to ensure accessibility, students could contribute partially through reasonable fees or through service to their communities after graduation. This system would maintain accessibility while ensuring that students value their education.

In conclusion, although both free and fully paid university education have their merits, a mixed model that combines public funding with student contribution appears to offer the most advantages for both individuals and society.

---

## Essay Type 2: Problem-Solution

**Topic**: "Many people are now spending more time using smartphones. What problems does this cause, and what solutions can you suggest?"

**Band 8.5 Sample Answer** (295 words):

[Essay content continues...]

## Key Features of High-Band Essays

1. **Clear Position**: Thesis statement in introduction
2. **Coherent Structure**: Logical paragraph organization
3. **Topic Sentences**: Clear main idea in each paragraph
4. **Supporting Details**: Examples and explanations
5. **Cohesive Devices**: Linking words used naturally
6. **Lexical Resource**: Wide vocabulary range
7. **Grammar**: Complex structures with accuracy
8. **Conclusion**: Summarizes without repetition`,
        type: "article",
        topic: "IELTS",
        readTime: "20 min",
        difficulty: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
    }
];

const seedData = async () => {
    try {
        // Connect to MongoDB
        try {
            await mongoose.connect(MONGO_URI);
            logger.info('Connected to MongoDB');
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                logger.info('Real MongoDB unavailable, using in-memory database...');
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                await mongoose.connect(mongoServer.getUri());
                logger.info('Connected to in-memory MongoDB');
            } else {
                throw error;
            }
        }

        // Find admin user for createdBy field
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            logger.error('No admin user found. Please run seed-admin.js first.');
            process.exit(1);
        }

        // Clear existing data
        await Scholarship.deleteMany({});
        await Guidance.deleteMany({});
        logger.info('Cleared existing scholarships and guidance data');

        // Insert scholarships
        const createdScholarships = await Scholarship.insertMany(
            scholarships.map(s => ({ ...s, createdBy: admin._id }))
        );
        logger.info(`✅ Successfully seeded ${createdScholarships.length} scholarships`);

        // Insert guidance
        const createdGuidances = await Guidance.insertMany(
            guidances.map(g => ({ ...g, createdBy: admin._id }))
        );
        logger.info(`✅ Successfully seeded ${createdGuidances.length} guidance items`);

        // Summary
        logger.info('\n📊 Seeding Summary:');
        logger.info(`   Scholarships: ${createdScholarships.length}`);
        logger.info(`   - DAAD: ${createdScholarships.filter(s => s.country === 'Germany').length}`);
        logger.info(`   - UK Scholarships: ${createdScholarships.filter(s => s.country === 'United Kingdom').length}`);
        logger.info(`   - Other Countries: ${createdScholarships.filter(s => !['Germany', 'United Kingdom'].includes(s.country)).length}`);
        logger.info(`\n   Guidance Items: ${createdGuidances.length}`);
        logger.info(`   - Articles: ${createdGuidances.filter(g => g.type === 'article').length}`);
        logger.info(`   - Videos: ${createdGuidances.filter(g => g.type === 'video').length}`);
        logger.info(`   - Tests: ${createdGuidances.filter(g => g.type === 'test').length}`);
        logger.info(`   - FAQs: ${createdGuidances.filter(g => g.type === 'faq').length}`);

        // Close connection
        await mongoose.connection.close();
        logger.info('\n✅ Database seeding completed successfully!');
        logger.info('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();

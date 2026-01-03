
import mongoose from 'mongoose';
import NepalCollege from '../src/models/nepalCollege.model.js';
import ForeignUniversity from '../src/models/foreignUniversity.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applybro';

// All 59 Nepal Colleges with their affiliated universities and programs
const collegesData = [
    {
        name: 'Ace International Business School',
        location: 'Sinamangal, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'Glasgow Caledonian University, Scotland',
        website: 'https://ace.edu.np',
        logo: 'https://ace.edu.np/images/logo.png',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) Fashion Design with Business', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Asian Institute of Technology and Management',
        location: 'Khumlatar, Lalitpur',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Highland and Island, UK',
        website: 'https://aitm.edu.np',
        logo: 'https://aitm.edu.np/assets/images/logo.png',
        programs: [
            { name: 'BA (Hons) Hospitality Management', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) Business and Management', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Balmiki Lincoln College',
        location: 'Birtamod, Jhapa',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://blc.edu.np',
        logo: 'https://via.placeholder.com/200x100/0066cc/ffffff?text=BLC',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BIT', duration: '4 years', totalCredits: 360 },
            { name: 'BHM', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Biratnagar International College',
        location: 'Biratnagar',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Wolverhampton, UK',
        website: 'https://bic.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc0000/ffffff?text=BIC',
        programs: [
            { name: 'BSc (Hons) International Business Management', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) in International Hospitality Management', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'British International College',
        location: 'Chakupat, Lalitpur',
        affiliation: 'UK',
        affiliatedUniversity: 'Keele University, UK',
        website: 'https://bic.edu.np',
        logo: 'https://via.placeholder.com/200x100/003366/ffffff?text=British+IC',
        programs: [
            { name: 'BSc (Hons) Data Science', duration: '4 years', totalCredits: 360 },
            { name: 'MSc Advanced Computer Science', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'CG Institute of Management',
        location: 'Min Bhawan, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Limkokwing University of Creative Technology, Malaysia',
        website: 'https://cgim.edu.np',
        logo: 'https://via.placeholder.com/200x100/ff6600/ffffff?text=CGIM',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) IT', duration: '3 years', totalCredits: 360 },
            { name: 'BIT Technopreneurship', duration: '3 years', totalCredits: 360 },
            { name: 'Bachelor of Computer Science (Hons) in Software Engineering with Multimedia', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Science (Hons) in Information Communication and Technology', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Center for Leadership and Entrepreneurship',
        location: 'Lagankhel, Lalitpur',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://cle.edu.np',
        logo: 'https://via.placeholder.com/200x100/009933/ffffff?text=CLE',
        programs: [
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Science (Hons) in Hospitality Management', duration: '4 years', totalCredits: 360 },
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'Diploma in Culinary Arts', duration: '800 hours', totalCredits: 60 },
            { name: 'Diploma in Bakery and Patisserie', duration: '800 hours', totalCredits: 60 }
        ]
    },
    {
        name: 'Fishtail Mountain School of Hospitality, Tourism and Management',
        location: 'Pokhara',
        affiliation: 'Other',
        affiliatedUniversity: 'Taylor\'s University, Malaysia',
        website: 'https://fishtail.edu.np',
        logo: 'https://via.placeholder.com/200x100/0099cc/ffffff?text=Fishtail',
        programs: [
            { name: 'Bachelor of International Hospitality Management (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Computer Science (Hons)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Forbes College',
        location: 'Chitwan',
        affiliation: 'Other',
        affiliatedUniversity: 'University of Computer Science and Skills, Lodz, Poland',
        website: 'https://forbes.edu.np',
        logo: 'https://via.placeholder.com/200x100/660099/ffffff?text=Forbes',
        programs: [
            { name: 'Bachelor of Management (Hospitality)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Computer Science (Network Technology and Cyber Security)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Global Academy of Tourism and Hospitality Education (GATE)',
        location: 'Mandikhatar, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Hotelleriesuisse, Swiss Hotel Association, Switzerland',
        website: 'https://gate.edu.np',
        logo: 'https://gate.edu.np/images/logo.png',
        programs: [
            { name: 'Bachelor\'s in International Hospitality Management (BIHM)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Global College International',
        location: 'New Baneshwor, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Shinawatra University, Thailand',
        website: 'https://gci.edu.np',
        logo: 'https://gci.edu.np/assets/logo.png',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Green Peace Lincoln College',
        location: 'Itahari, Sunsari',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://gplc.edu.np',
        logo: 'https://via.placeholder.com/200x100/339933/ffffff?text=GPLC',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Information Technology (BIT)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Herald College Kathmandu',
        location: 'Naxal, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Wolverhampton, UK',
        website: 'https://heraldcollege.edu.np',
        logo: 'https://heraldcollege.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) International Business Management', duration: '4 years', totalCredits: 360 },
            { name: 'International MBA (IMBA)', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) in Cyber Security', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Himalayan College of Management',
        location: 'Kamalpokhari, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Infrastructure University, Malaysia',
        website: 'https://hcm.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc3300/ffffff?text=HCM',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'MIT', duration: '2 years', totalCredits: 180 },
            { name: 'BCS IT', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'IEC College of Art & Fashion',
        location: 'Mandikatar, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Limkokwing University of Creative Technology, Malaysia',
        website: 'https://iec.edu.np',
        logo: 'https://via.placeholder.com/200x100/ff0099/ffffff?text=IEC',
        programs: [
            { name: 'BA in Interior Architecture', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) Fashion & Retailing', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Informatics College Pokhara',
        location: 'Pokhara',
        affiliation: 'UK',
        affiliatedUniversity: 'London Metropolitan University, UK',
        website: 'https://informatics.edu.np',
        logo: 'https://via.placeholder.com/200x100/0066ff/ffffff?text=Informatics',
        programs: [
            { name: 'BA (Hons) Business Administration', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Information Technology', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Infomax College of Information Technology and Management',
        location: 'Pokhara',
        affiliation: 'Other',
        affiliatedUniversity: 'Asia Pacific University of Technology and Innovation, Malaysia',
        website: 'https://infomax.edu.np',
        logo: 'https://via.placeholder.com/200x100/3366cc/ffffff?text=Infomax',
        programs: [
            { name: 'BSc Information Technology', duration: '3 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Institute of International Management Science (IIMS)',
        location: 'Putalisadak, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Taylor\'s University, Malaysia',
        website: 'https://iims.edu.np',
        logo: 'https://via.placeholder.com/200x100/990000/ffffff?text=IIMS',
        programs: [
            { name: 'Bachelor of Computer Science (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Business (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of International Hospitality Management (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'International School of Management and Technology (ISMT) Pokhara',
        location: 'Pokhara',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Sunderland, UK',
        website: 'https://ismt.edu.np',
        logo: 'https://ismt.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer System Engineering', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) Business Management', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) International Tourism & Hospitality Management (BHM)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'International School of Management and Technology (ISMT) Butwal',
        location: 'Butwal',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Sunderland, UK',
        website: 'https://ismt.edu.np',
        logo: 'https://ismt.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer System Engineering', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) International Tourism and Hospitality Management', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'International School of Management and Technology (ISMT) Biratnagar',
        location: 'Biratnagar',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Sunderland, UK',
        website: 'https://ismt.edu.np',
        logo: 'https://ismt.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer System Engineering', duration: '3 years', totalCredits: 360 },
            { name: 'International Tourism and Hospitality Management (BIHM)', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) Business Management (BBA)', duration: '3 years', totalCredits: 360 },
            { name: 'Master of Business Administration (MBA)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'International School of Management and Technology (ISMT) Kathmandu',
        location: 'Tinkune, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Sunderland, UK',
        website: 'https://ismt.edu.np',
        logo: 'https://ismt.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer System Engineering', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) Business Management (BBA)', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) International Tourism and Hospitality Management (BHM)', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Cyber Security & Digital Forensics', duration: '4 years', totalCredits: 360 },
            { name: 'HND in Computing and System Development', duration: '2 years', totalCredits: 240 },
            { name: 'HND in Hospitality Management', duration: '2 years', totalCredits: 240 }
        ]
    },
    {
        name: 'International School of Management and Technology (ISMT) Chitwan',
        location: 'Chitwan',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Sunderland, UK',
        website: 'https://ismt.edu.np',
        logo: 'https://ismt.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer System Engineering', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) International Tourism and Hospitality Management (BHM)', duration: '4 years', totalCredits: 360 },
            { name: 'Master of Business Administration (MBA)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'International School of Tourism and Hotel Management (IST)',
        location: 'Gyaneshwor, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Salzburg University of Applied Science and Technology, Austria',
        website: 'https://ist.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc6600/ffffff?text=IST',
        programs: [
            { name: 'Hotel Management - Diploma and Higher Diploma', duration: '3 years', totalCredits: 240 },
            { name: 'Tourism Management - Diploma and Higher Diploma', duration: '3 years', totalCredits: 240 },
            { name: 'Bachelor of Science (Hons) in Hospitality Management', duration: '1 year', totalCredits: 120 },
            { name: 'Bachelor of Science (Hons) in Culinary Art Management', duration: '1 year', totalCredits: 120 },
            { name: 'MIT (Master of Innovation and Management in Tourism)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Islington College',
        location: 'Kamal Pokhari, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'London Metropolitan University, UK',
        website: 'https://islington.edu.np',
        logo: 'https://islington.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) in Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Computer Networking and IT Security', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Multimedia Technologies', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) Business Administration', duration: '4 years', totalCredits: 360 },
            { name: 'Master of Science in Information Technology and Applied Security', duration: '2 years', totalCredits: 180 },
            { name: 'MSc Network Engineering', duration: '2 years', totalCredits: 180 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) Mobile Application Development', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) Accounting and Finance', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Computing with Artificial Intelligence', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Itahari International College',
        location: 'Sundarharaicha, Morang',
        affiliation: 'UK',
        affiliatedUniversity: 'London Metropolitan University, UK',
        website: 'https://iic.edu.np',
        logo: 'https://via.placeholder.com/200x100/006633/ffffff?text=IIC',
        programs: [
            { name: 'BA (Hons) Business Administration', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Information Technology', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Kathmandu College of Management',
        location: 'Gwarko, Lalitpur',
        affiliation: 'Other',
        affiliatedUniversity: 'SIAM University, Bangkok, Thailand',
        website: 'https://kcm.edu.np',
        logo: 'https://via.placeholder.com/200x100/990033/ffffff?text=KCM',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'KFA Business School',
        location: 'Mid-Baneshwor, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://kfa.edu.np',
        logo: 'https://via.placeholder.com/200x100/003399/ffffff?text=KFA',
        programs: [
            { name: 'BHM', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Computer Science (Hons) (Network Technology and Cyber Security)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Business Administration (BBA)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'King\'s College',
        location: 'Babarmahal, Kathmandu',
        affiliation: 'American',
        affiliatedUniversity: 'Westcliff University, California, USA',
        website: 'https://kingscollege.edu.np',
        logo: 'https://kingscollege.edu.np/images/logo.png',
        programs: [
            { name: 'Bachelor of Business Administration (BBA)', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BS IT', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Science in Computer Science (BSCS)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Lincoln International College of Management and IT',
        location: 'Putalisadak, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://lic.edu.np',
        logo: 'https://via.placeholder.com/200x100/660000/ffffff?text=LIC',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Information Technology (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Master of Computer Science', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Computer Science (Hons) Network Security & CIS', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Lord Buddha Education Foundation',
        location: 'Maitidevi, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Asia Pacific University of Technology and Innovation, Malaysia',
        website: 'https://lbef.edu.np',
        logo: 'https://lbef.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) in Information Technology', duration: '3 years', totalCredits: 360 },
            { name: 'BA (Hons) in Business Management', duration: '3 years', totalCredits: 360 },
            { name: 'Master of Science in Information Technology Management (MSc ITM)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Mid-Valley International College',
        location: 'Gyaneshwor, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'HELP University, Malaysia',
        website: 'https://midvalley.edu.np',
        logo: 'https://via.placeholder.com/200x100/009966/ffffff?text=Mid-Valley',
        programs: [
            { name: 'Bachelor of Business (Hospitality Management) (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Business (Finance)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Business (Marketing) (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Information Technology (Hons)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Model Institute of Technology (MIT)',
        location: 'Bagbazaar, Kathmandu',
        affiliation: 'American',
        affiliatedUniversity: 'International American University, Los Angeles, USA',
        website: 'https://mit.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc0066/ffffff?text=MIT',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Information Technology (BIT)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Naaya Aayam Multi-Disciplinary Institute (NAMI)',
        location: 'Gokarneshwor, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Northampton, UK',
        website: 'https://nami.edu.np',
        logo: 'https://nami.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Environment Science', duration: '3 years', totalCredits: 360 },
            { name: 'BBA', duration: '3 years', totalCredits: 360 },
            { name: 'Master in Computing', duration: '2 years', totalCredits: 180 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'National College of Management and Technical Science (NCMT)',
        location: 'Samakhushi, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://ncmt.edu.np',
        logo: 'https://via.placeholder.com/200x100/336699/ffffff?text=NCMT',
        programs: [
            { name: 'BHM', duration: '4 years', totalCredits: 360 },
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Information Technology (Hons)', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Computer Science (Hons) (Network Technology & Cyber Security)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Nepal Business College',
        location: 'Janapath Tole, Biratnagar',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://nbc.edu.np',
        logo: 'https://via.placeholder.com/200x100/993300/ffffff?text=NBC',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) in Hospitality Management', duration: '4 years', totalCredits: 360 },
            { name: 'BIT (Hons)', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Padmashree College',
        location: 'Tinkune, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Nilai University, Malaysia',
        website: 'https://padmashree.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc3366/ffffff?text=Padmashree',
        programs: [
            { name: 'Bachelor of Information Technology', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Business Administration (Hons) (BBA)', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) in Business and Hospitality Management', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Patan College for Professional Studies',
        location: 'Kupondole, Lalitpur',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Bedfordshire, UK',
        website: 'https://pcps.edu.np',
        logo: 'https://via.placeholder.com/200x100/006699/ffffff?text=PCPS',
        programs: [
            { name: 'BSc (Hons) Software Engineering', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Business Management', duration: '3 years', totalCredits: 360 },
            { name: 'MSc in Applied Computing and Information Technology', duration: '2 years', totalCredits: 180 },
            { name: 'MBA with Various Specialization', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Phoenix College of Management',
        location: 'Maitidevi, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://phoenix.edu.np',
        logo: 'https://via.placeholder.com/200x100/ff3300/ffffff?text=Phoenix',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor in Information Technology', duration: '3 years', totalCredits: 360 },
            { name: 'Master in Computer Science', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor of Science (Hons) in Hospitality Management', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Pokhara Lincoln International College',
        location: 'Pokhara',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://plic.edu.np',
        logo: 'https://via.placeholder.com/200x100/669900/ffffff?text=PLIC',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) in Hospitality Management', duration: '4 years', totalCredits: 360 },
            { name: 'Bachelor of Computer Science (Hons) Network Technology & Cyber Security', duration: '4 years', totalCredits: 360 },
            { name: 'Masters of Business Administration (MBA)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Presidential Graduate School',
        location: 'Thapagaun, Kathmandu',
        affiliation: 'American',
        affiliatedUniversity: 'Westcliff University, California, USA',
        website: 'https://pgs.edu.np',
        logo: 'https://via.placeholder.com/200x100/000099/ffffff?text=PGS',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'BA', duration: '4 years', totalCredits: 360 },
            { name: 'BSc IT', duration: '4 years', totalCredits: 360 },
            { name: 'MSc IT', duration: '2 years', totalCredits: 180 },
            { name: 'MBA in Data Analysis', duration: '2 years', totalCredits: 180 },
            { name: 'MBA in Information Technology', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Silver Mountain School of Hotel Management',
        location: 'Lainchaur, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'Queen Margaret University, UK',
        website: 'https://silvermountain.edu.np',
        logo: 'https://silvermountain.edu.np/images/logo.png',
        programs: [
            { name: 'BA in International Hospitality and Tourism Management', duration: '4 years', totalCredits: 360 },
            { name: 'BA International Culinary Arts', duration: '4 years', totalCredits: 360 },
            { name: 'MBA in Hospitality', duration: '2 years', totalCredits: 180 },
            { name: 'Bachelor in Arts (Hons) in International Hospitality and Tourism Management', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Softwarica College of IT and E-Commerce',
        location: 'Dillibazaar, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'Coventry University, UK',
        website: 'https://softwarica.edu.np',
        logo: 'https://softwarica.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computing', duration: '3 years', totalCredits: 360 },
            { name: 'BSc (Hons) Ethical Hacking and Cyber Security', duration: '3 years', totalCredits: 360 },
            { name: 'MSc Data Science and Computational Intelligence', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) Computer Science with Artificial Intelligence', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Stamford College',
        location: 'Shantinagar, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'University of East London, UK',
        website: 'https://stamford.edu.np',
        logo: 'https://via.placeholder.com/200x100/003366/ffffff?text=Stamford',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Data Science and Artificial Intelligence', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Sunway College',
        location: 'Maitidevi, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'Birmingham University College, UK',
        website: 'https://sunway.edu.np',
        logo: 'https://via.placeholder.com/200x100/ff9900/ffffff?text=Sunway',
        programs: [
            { name: 'BSc (Hons) Computer Science with Artificial Intelligence', duration: '4 years', totalCredits: 360 },
            { name: 'BA (Hons) Marketing with Digital Communication', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Techspire College',
        location: 'New Baneshwor, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Asia Pacific University of Technology and Innovation, Malaysia',
        website: 'https://techspire.edu.np',
        logo: 'https://via.placeholder.com/200x100/0099ff/ffffff?text=Techspire',
        programs: [
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BSc (Hons) in Information Technology', duration: '3 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Texas College of Management and IT',
        location: 'Chabahil, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://texas.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc0000/ffffff?text=Texas',
        programs: [
            { name: 'BBA', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'BIT', duration: '4 years', totalCredits: 360 },
            { name: 'BCS', duration: '4 years', totalCredits: 360 },
            { name: 'BHM', duration: '4 years', totalCredits: 360 },
            { name: 'MCS', duration: '2 years', totalCredits: 180 },
            { name: 'MBA in Human Resource Management', duration: '2 years', totalCredits: 180 },
            { name: 'MBA in Hospitality Management', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'The British College',
        location: 'Thapathali, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'Leeds Beckett University, UK',
        website: 'https://thebritishcollege.edu.np',
        logo: 'https://thebritishcollege.edu.np/images/logo.png',
        programs: [
            { name: 'BSc (Hons) Computing', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Hospitality Business Management', duration: '4 years', totalCredits: 360 },
            { name: 'MSc Information & Technology', duration: '2 years', totalCredits: 180 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 },
            { name: 'EMBA (Executive MBA)', duration: '2 years', totalCredits: 180 },
            { name: 'BBA (Hons) Business and Management', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Cyber Security & Digital Forensic', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computer Science (Artificial Intelligence)', duration: '4 years', totalCredits: 360 },
            { name: 'MSc International Business Management (MIBM)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'The London College',
        location: 'Tinkune, Kathmandu',
        affiliation: 'UK',
        affiliatedUniversity: 'University of East London, UK',
        website: 'https://londoncollege.edu.np',
        logo: 'https://via.placeholder.com/200x100/990000/ffffff?text=London+College',
        programs: [
            { name: 'BSc (Hons) Computer Science', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Cyber Security & Networks', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'The Westminster College',
        location: 'Kupondole, Lalitpur',
        affiliation: 'UK',
        affiliatedUniversity: 'University of Westminster, UK',
        website: 'https://westminster.edu.np',
        logo: 'https://via.placeholder.com/200x100/003399/ffffff?text=Westminster',
        programs: [
            { name: 'BSc (Hons) Cyber Security and Forensic', duration: '4 years', totalCredits: 360 },
            { name: 'BSc (Hons) Computer Science', duration: '4 years', totalCredits: 360 }
        ]
    },
    {
        name: 'Virinchi College',
        location: 'Kumaripati, Lalitpur',
        affiliation: 'Other',
        affiliatedUniversity: 'Asia eUniversity, Malaysia',
        website: 'https://virinchi.edu.np',
        logo: 'https://via.placeholder.com/200x100/660099/ffffff?text=Virinchi',
        programs: [
            { name: 'Bachelor of Information and Communication Technology (Hons) (BICT)', duration: '4 years', totalCredits: 360 },
            { name: 'Master of Business Administration (MBA)', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Western Mega College',
        location: 'Butwal',
        affiliation: 'Other',
        affiliatedUniversity: 'Lincoln University College, Malaysia',
        website: 'https://wmc.edu.np',
        logo: 'https://via.placeholder.com/200x100/009933/ffffff?text=WMC',
        programs: [
            { name: 'BHM', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    },
    {
        name: 'Yeti International College',
        location: 'Buddhanagar, Kathmandu',
        affiliation: 'Other',
        affiliatedUniversity: 'Sripatum University, Thailand',
        website: 'https://yetic.edu.np',
        logo: 'https://via.placeholder.com/200x100/cc6600/ffffff?text=Yeti',
        programs: [
            { name: 'Bachelor of Art (Tourism / Hotel and MICE Management, Airlines Business)', duration: '4 years', totalCredits: 360 },
            { name: 'MBA', duration: '2 years', totalCredits: 180 }
        ]
    }
];

async function seedAllColleges() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing colleges
        console.log('🗑️  Clearing existing Nepal colleges...');
        await NepalCollege.deleteMany({});
        console.log('✅ Existing colleges cleared\n');

        // Insert all colleges
        console.log('📚 Inserting 59 Nepal colleges...');
        const insertedColleges = await NepalCollege.insertMany(collegesData);
        console.log(`✅ Successfully inserted ${insertedColleges.length} colleges\n`);

        // Display summary
        console.log('📊 Summary by Affiliation:');
        const affiliationCounts = {};
        insertedColleges.forEach(college => {
            affiliationCounts[college.affiliation] = (affiliationCounts[college.affiliation] || 0) + 1;
        });

        Object.entries(affiliationCounts).forEach(([affiliation, count]) => {
            console.log(`   - ${affiliation}: ${count} colleges`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`\n✨ Total Colleges: ${insertedColleges.length}`);
        console.log(`✨ Total Programs: ${insertedColleges.reduce((sum, c) => sum + c.programs.length, 0)}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the seed function
seedAllColleges();

import mongoose from 'mongoose';

const foreignUniversitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        enum: ['UK', 'Australia', 'USA', 'Canada', 'Europe', 'Other']
    },
    city: {
        type: String,
        trim: true
    },
    programName: {
        type: String,
        required: true,
        trim: true
    },
    programLevel: {
        type: String,
        enum: ['Bachelor', 'Master', 'PhD'],
        default: 'Bachelor'
    },
    totalCredits: {
        type: Number,
        required: true
    },
    duration: {
        years: Number,
        semesters: Number
    },
    tuitionRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    entryRequirements: {
        minGPA: Number,
        englishTest: {
            type: String,
            enum: ['IELTS', 'TOEFL', 'PTE', 'None']
        },
        minScore: Number,
        otherRequirements: [String]
    },
    acceptsCreditTransfer: {
        type: Boolean,
        default: true
    },
    creditTransferPolicy: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    ranking: {
        type: Number
    },
    imageUrl: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'foreignuniversities',
    timestamps: true
});

foreignUniversitySchema.index({ country: 1, programName: 1 });
foreignUniversitySchema.index({ name: 'text', programName: 'text' });

export default mongoose.model('ForeignUniversity', foreignUniversitySchema);

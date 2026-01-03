import mongoose from 'mongoose';

const nepalCollegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    affiliation: {
        type: String,
        enum: ['UK', 'USA', 'Local', 'Australian', 'American', 'Malaysia', 'Other'],
        required: true
    },
    affiliatedUniversity: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    programs: [{
        name: String,
        duration: String,
        totalCredits: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'nepalcolleges',
    timestamps: true
});

export default mongoose.model('NepalCollege', nepalCollegeSchema);

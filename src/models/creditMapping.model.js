import mongoose from 'mongoose';

const creditMappingSchema = new mongoose.Schema({
    localCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    foreignUniversityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForeignUniversity',
        required: true
    },
    acceptanceStatus: {
        type: String,
        enum: ['full', 'partial', 'none', 'pending'],
        required: true,
        default: 'pending'
    },
    creditsTransferred: {
        type: Number,
        default: 0
    },
    equivalentCourseName: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    verificationStatus: {
        type: String,
        enum: ['verified', 'under_review', 'unverified'],
        default: 'unverified'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

creditMappingSchema.index({ localCourseId: 1, foreignUniversityId: 1 });
creditMappingSchema.index({ verificationStatus: 1 });

creditMappingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('CreditMapping', creditMappingSchema);

import mongoose from 'mongoose';

const creditTransferRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentCollege: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NepalCollege',
        required: true
    },
    currentProgram: {
        type: String,
        required: true,
        trim: true
    },
    currentYear: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    currentSemester: {
        type: Number,
        min: 1,
        max: 8
    },
    creditsCompleted: {
        type: Number,
        required: true
    },
    preferredCountries: [{
        type: String,
        enum: ['UK', 'Australia', 'USA', 'Canada', 'Europe', 'Other']
    }],
    transcriptUrl: {
        type: String,
        trim: true
    },
    syllabusUrl: {
        type: String,
        trim: true
    },
    savedUniversities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForeignUniversity'
    }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'completed'],
        default: 'draft'
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

creditTransferRequestSchema.index({ userId: 1 });
creditTransferRequestSchema.index({ status: 1 });

creditTransferRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('CreditTransferRequest', creditTransferRequestSchema);

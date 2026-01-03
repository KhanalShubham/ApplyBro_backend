import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NepalCollege',
        required: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseCode: {
        type: String,
        trim: true
    },
    creditValue: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    year: {
        type: Number,
        min: 1,
        max: 4
    },
    syllabus: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        trim: true
    }],
    programName: {
        type: String,
        required: true
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

courseSchema.index({ collegeId: 1, programName: 1 });
courseSchema.index({ courseName: 'text', keywords: 'text' });

courseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Course', courseSchema);

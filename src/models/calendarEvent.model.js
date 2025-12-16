import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.isGlobal; } // Required only if not global
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['deadline', 'reminder', 'event'],
        default: 'event'
    },
    scholarshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        default: null
    },
    reminderPreferences: {
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        reminderDate: { type: Date }
    },
    note: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying by user and date range
CalendarEventSchema.index({ userId: 1, date: 1 });
CalendarEventSchema.index({ isGlobal: 1, date: 1 });

export default mongoose.model('CalendarEvent', CalendarEventSchema);

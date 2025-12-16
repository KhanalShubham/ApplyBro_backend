import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  resourceType: {
    type: String,
    enum: ['post', 'comment'],
    required: [true, 'Resource type is required']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Resource ID is required'],
    refPath: 'resourceType'
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'reviewed', 'resolved'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  actionTaken: {
    type: String,
    enum: ['deleted', 'warning', 'none', 'hidden'],
    default: null
  }
});

// Indexes
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ resourceType: 1, resourceId: 1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ reviewedBy: 1 });

export default mongoose.model('Report', ReportSchema);




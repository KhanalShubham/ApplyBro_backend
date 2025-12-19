import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'approve_post',
      'decline_post',
      'delete_post',
      'remove_comment',
      'delete_comment',
      'resolve_report',
      'ban_user',
      'unban_user',
      'edit_post',
      'edit_comment'
    ]
  },
  targetType: {
    type: String,
    enum: ['post', 'comment', 'user', 'report'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);





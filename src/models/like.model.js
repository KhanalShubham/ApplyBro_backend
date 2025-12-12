import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate likes
LikeSchema.index({ resourceType: 1, resourceId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ userId: 1 });
LikeSchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.model('Like', LikeSchema);


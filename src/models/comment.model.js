import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['visible', 'reported', 'removed'],
    default: 'visible'
  },
  reportedCount: {
    type: Number,
    default: 0
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

// Indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ status: 1 });

// Update timestamp
CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Comment', CommentSchema);


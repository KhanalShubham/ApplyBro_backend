import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: 5000
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  country: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['Success Story', 'Tips', 'Guidance', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'removed'],
    default: 'pending'
  },
  declineReason: {
    type: String,
    default: null
  },
  adminNote: {
    type: String,
    default: ''
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  // Keep for backward compatibility but prefer separate Like collection
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
PostSchema.index({ author: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ country: 1 });
PostSchema.index({ 'status': 1, 'createdAt': -1 }); // For admin queue

// Update timestamp
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Post', PostSchema);








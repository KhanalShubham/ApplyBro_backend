import mongoose from 'mongoose';

const ScholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Scholarship title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    default: null
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  countryFlag: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  university: {
    name: {
      type: String,
      required: [true, 'University name is required']
    },
    location: {
      country: { type: String, required: [true, 'University country is required'] },
      city: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    website: {
      type: String,
      default: ''
    }
  },
  requirements: [{
    type: String,
    trim: true
  }],
  level: [{
    type: String,
    enum: ['+2', 'Bachelor', 'Master', 'PhD', 'Undergraduate', 'Graduate', 'Short Course'],
    required: [true, 'Education level is required']
  }],
  fields: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  eligibility: {
    minGPA: {
      type: Number,
      min: 0,
      max: 4.0
    },
    requiredDocs: [{
      type: String
    }],
    ageLimit: Number,
    nationality: [String]
  },
  benefits: {
    type: String,
    trim: true
  },
  amount: {
    type: String,
    default: 'Full Tuition'
  },
  externalLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'upcoming', 'closed'],
    default: 'open'
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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

// Text search indexes
ScholarshipSchema.index({
  title: 'text',
  description: 'text',
  country: 'text',
  fields: 'text'
});

// Other indexes for filtering
ScholarshipSchema.index({ country: 1 });
ScholarshipSchema.index({ level: 1 });
ScholarshipSchema.index({ status: 1 });
ScholarshipSchema.index({ deadline: 1 });
ScholarshipSchema.index({ verified: 1 });

// Update timestamp
ScholarshipSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Auto-update status based on deadline
  if (this.deadline) {
    const now = new Date();
    if (this.deadline < now) {
      this.status = 'closed';
    } else if (this.deadline.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      // Within 7 days
      if (this.status === 'upcoming') {
        this.status = 'open';
      }
    }
  }

  next();
});

export default mongoose.model('Scholarship', ScholarshipSchema);








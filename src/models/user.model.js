import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  profile: {
    educationLevel: {
      type: String,
      enum: ['+2', 'Bachelor', 'Master', 'PhD'],
      default: null
    },
    avatar: {
      type: String,
      trim: true
    },
    major: {
      type: String,
      trim: true
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    },
    preferredCountries: [{
      type: String,
      trim: true
    }],
    country: {
      type: String,
      trim: true
    }
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: {
    language: {
      type: String,
      default: 'english'
    },
    notifications: {
      scholarshipUpdates: { type: Boolean, default: true },
      postStatus: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false }
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['transcript', 'certificate', 'passport', 'ielts', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    adminNote: String
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  }],
  refreshToken: {
    type: String,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
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
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.preferredCountries': 1 });

// Update timestamp on save
UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  return obj;
};

export default mongoose.model('User', UserSchema);








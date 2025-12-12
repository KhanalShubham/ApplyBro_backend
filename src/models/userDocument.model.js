import mongoose from 'mongoose';

const UserDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['+2', 'bachelor', 'ielts', 'master', 'phd', 'other'],
    required: true
  },
  documentType: {
    type: String,
    enum: ['transcript', 'certificate', 'passport', 'ielts', 'other'],
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  parsedData: {
    level: {
      type: String,
      enum: ['+2', 'Bachelor', 'Master', 'PhD'],
      default: null
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
      default: null
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    stream: {
      type: String,
      trim: true,
      default: null
    },
    passingYear: {
      type: Number,
      default: null
    },
    degreeName: {
      type: String,
      trim: true,
      default: null
    },
    englishScore: {
      listening: {
        type: Number,
        min: 0,
        max: 9,
        default: null
      },
      reading: {
        type: Number,
        min: 0,
        max: 9,
        default: null
      },
      writing: {
        type: Number,
        min: 0,
        max: 9,
        default: null
      },
      speaking: {
        type: Number,
        min: 0,
        max: 9,
        default: null
      },
      overall: {
        type: Number,
        min: 0,
        max: 9,
        default: null
      }
    },
    rawText: {
      type: String,
      default: null
    },
    extractionConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  parsingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  parsingError: {
    type: String,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  parsedAt: {
    type: Date,
    default: null
  },
  // Verification fields
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminNote: {
    type: String,
    default: null
  }
});

// Indexes for efficient queries
UserDocumentSchema.index({ userId: 1, type: 1 });
UserDocumentSchema.index({ userId: 1, parsingStatus: 1 });
UserDocumentSchema.index({ userId: 1, status: 1 });
UserDocumentSchema.index({ status: 1, uploadedAt: -1 });
UserDocumentSchema.index({ 'parsedData.level': 1 });

export default mongoose.model('UserDocument', UserDocumentSchema);


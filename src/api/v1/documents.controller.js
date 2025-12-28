import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import UserDocument from '../../models/userDocument.model.js';
import User from '../../models/user.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { parseDocument } from '../../services/documentParser.service.js';
import { saveFileLocally, validateFileType } from '../../services/s3.service.js';
import { logger } from '../../utils/logger.js';

// Configure multer for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
    }
  }
});

/**
 * POST /api/v1/documents/upload
 * Upload document with automatic parsing
 */
export const uploadDocument = [
  authenticate,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file provided'
        });
      }

      const { type, documentType } = req.body;

      if (!type || !documentType) {
        return res.status(400).json({
          status: 'error',
          message: 'Type and documentType are required. Type: +2, bachelor, ielts, etc. DocumentType: transcript, certificate, ielts, etc.'
        });
      }

      // Validate file type
      try {
        validateFileType(req.file.originalname, 'document');
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      // Save file locally
      const fileResult = await saveFileLocally(
        req.file.buffer,
        req.file.originalname,
        'document',
        req.userId
      );

      // Create document record with explicit pending status for admin verification
      const userDocument = await UserDocument.create({
        userId: req.userId,
        type,
        documentType,
        originalFilename: req.file.originalname,
        filePath: fileResult.key,
        fileUrl: fileResult.publicUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        parsingStatus: 'processing',
        status: 'pending' // Explicitly set to pending for admin verification
      });

      // Also add to user's documents array for backward compatibility
      const user = await User.findById(req.userId);
      user.documents.push({
        type: documentType,
        name: req.file.originalname,
        url: fileResult.publicUrl,
        status: 'pending',
        uploadedAt: new Date()
      });
      await user.save();

      // Parse document asynchronously
      parseDocument(fileResult.key, req.file.mimetype, documentType)
        .then(async (parsedData) => {
          userDocument.parsedData = parsedData;
          userDocument.parsingStatus = 'completed';
          userDocument.parsedAt = new Date();
          await userDocument.save();

          logger.info(`Document parsed successfully: ${userDocument._id}`, {
            userId: req.userId,
            level: parsedData.level,
            gpa: parsedData.gpa
          });
        })
        .catch(async (error) => {
          logger.error('Document parsing failed:', error);
          userDocument.parsingStatus = 'failed';
          userDocument.parsingError = error.message;
          await userDocument.save();
        });

      logger.info(`Document uploaded: ${req.file.originalname} by user ${req.user.email}`);

      res.status(201).json({
        status: 'success',
        message: 'Document uploaded successfully. Parsing in progress. Document is pending admin verification.',
        data: {
          document: {
            id: userDocument._id,
            type: userDocument.type,
            documentType: userDocument.documentType,
            originalFilename: userDocument.originalFilename,
            fileUrl: userDocument.fileUrl,
            parsingStatus: userDocument.parsingStatus,
            verificationStatus: userDocument.status, // Include verification status
            uploadedAt: userDocument.uploadedAt
          }
        }
      });
    } catch (error) {
      logger.error('Document upload error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to upload document'
      });
    }
  }
];

/**
 * GET /api/v1/documents/my-documents
 * Get all user's uploaded documents
 */
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await UserDocument.find({
      userId: req.userId
    }).sort({ uploadedAt: -1 }).lean();

    // Transform documents to match frontend expectations
    const transformedDocuments = documents.map(doc => {
      // Map backend type values to frontend DocumentType format
      // Handles both legacy lowercase and new uppercase values
      const typeMap = {
        '+2': '+2',
        'Bachelor': 'Bachelor',
        'bachelor': 'Bachelor',
        'IELTS': 'IELTS',
        'ielts': 'IELTS',
        'SOP': 'SOP',
        'sop': 'SOP',
        'Master': 'Master',
        'master': 'Master',
        'PhD': 'PhD',
        'phd': 'PhD',
        'Other': 'Other',
        'other': 'Other'
      };

      return {
        _id: doc._id,
        userId: doc.userId,
        type: typeMap[doc.type] || doc.type, // Map to frontend DocumentType format
        fileName: doc.originalFilename,
        originalName: doc.originalFilename,
        filePath: doc.filePath,
        url: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.parsingStatus || 'pending', // Parsing status
        verificationStatus: doc.status, // Verification status: 'pending', 'verified', 'rejected'
        parsedData: doc.parsedData,
        parsingError: doc.parsingError,
        note: doc.adminNote, // Admin note if any
        uploadedAt: doc.uploadedAt,
        updatedAt: doc.parsedAt || doc.uploadedAt,
        rejectionReason: doc.status === 'rejected' ? doc.adminNote : undefined,
        adminNote: doc.adminNote
      };
    });

    res.json({
      status: 'success',
      data: {
        documents: transformedDocuments,
        count: transformedDocuments.length
      }
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents'
    });
  }
};

/**
 * GET /api/v1/documents/:id
 * Get single document details
 */
export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await UserDocument.findOne({
      _id: id,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    res.json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch document'
    });
  }
};

/**
 * DELETE /api/v1/documents/:id
 * Delete a document
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await UserDocument.findOne({
      _id: id,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      logger.warn('File deletion failed (may not exist):', fileError);
    }

    // Delete document record
    await UserDocument.findByIdAndDelete(id);

    // Also remove from user's documents array
    const user = await User.findById(req.userId);
    if (user) {
      user.documents = user.documents.filter(
        doc => doc.url !== document.fileUrl
      );
      await user.save();
    }

    logger.info(`Document deleted: ${document.originalFilename} by user ${req.user.email}`);

    res.json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document'
    });
  }
};


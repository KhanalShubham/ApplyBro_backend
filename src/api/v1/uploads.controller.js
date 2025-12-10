import { getPresignedUploadUrl, validateFileType, saveFileLocally } from '../../services/s3.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { logger } from '../../utils/logger.js';
import multer from 'multer';

// Configure multer for local uploads (development)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * GET /api/v1/uploads/presign
 * Get presigned URL for file upload
 */
export const getPresignedUrl = async (req, res) => {
  try {
    const { filename, type } = req.query;
    
    if (!filename || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Filename and type are required'
      });
    }
    
    // Validate file type
    try {
      validateFileType(filename, type);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    const userId = req.userId;
    const result = await getPresignedUploadUrl(filename, type, userId);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Get presigned URL error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate upload URL'
    });
  }
};

/**
 * POST /api/v1/uploads/local
 * Local file upload endpoint (development fallback)
 */
export const uploadLocal = [
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
      
      const { type } = req.body;
      
      if (!type) {
        return res.status(400).json({
          status: 'error',
          message: 'File type is required'
        });
      }
      
      // Validate file type
      try {
        validateFileType(req.file.originalname, type);
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      const result = await saveFileLocally(
        req.file.buffer,
        req.file.originalname,
        type,
        req.userId
      );
      
      res.json({
        status: 'success',
        message: 'File uploaded successfully',
        data: {
          url: result.publicUrl,
          key: result.key
        }
      });
    } catch (error) {
      logger.error('Local upload error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to upload file'
      });
    }
  }
];







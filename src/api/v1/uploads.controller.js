import { getPresignedUploadUrl, validateFileType, saveFileLocally } from '../../services/s3.service.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { logger } from '../../utils/logger.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * GET /api/v1/uploads/file/:path(*)
 * Serve uploaded files with proper CORS headers
 * OPTIONS /api/v1/uploads/file/:path(*) - Handle preflight requests
 */
export const serveFile = async (req, res) => {
  try {
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.setHeader('Access-Control-Allow-Origin', frontendUrl);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(204).end();
    }

    // Get the file path from the request
    // The route is /api/v1/uploads/file/*, so req.params[0] contains everything after /file/
    const filePath = req.params[0] || req.path.replace('/api/v1/uploads/file/', '');
    
    if (!filePath) {
      return res.status(400).json({
        status: 'error',
        message: 'File path is required'
      });
    }

    // Construct full file path - filePath should be like "image/userId/filename.jpg"
    const fullPath = path.join(__dirname, '../../../uploads', filePath);
    
    // Security: Ensure the path is within uploads directory (prevent directory traversal)
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Check if file exists
    try {
      await fs.access(resolvedPath);
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Set comprehensive CORS headers explicitly
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    
    // Send file
    res.sendFile(resolvedPath);
  } catch (error) {
    logger.error('Serve file error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to serve file'
    });
  }
};







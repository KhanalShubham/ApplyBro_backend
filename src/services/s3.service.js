import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger.js';

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize S3 client (only if credentials are provided)
let s3Client = null;
if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
  s3Client = new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    },
    ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT })
  });
}

// Allowed file types and extensions
const ALLOWED_TYPES = {
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxSize: 20 * 1024 * 1024 // 20MB
  },
  video: {
    extensions: ['.mp4', '.webm', '.mkv', '.mov'],
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  profile: {
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};

/**
 * Validate file extension and type
 */
export const validateFileType = (filename, type) => {
  const ext = path.extname(filename).toLowerCase();
  const config = ALLOWED_TYPES[type];

  if (!config) {
    throw new Error(`Invalid file type: ${type}`);
  }

  if (!config.extensions.includes(ext)) {
    throw new Error(`File extension ${ext} not allowed for type ${type}`);
  }

  return { ext, config };
};

/**
 * Generate presigned URL for S3 upload (production)
 */
export const generatePresignedUploadUrl = async (filename, type, userId) => {
  validateFileType(filename, type);

  if (!s3Client) {
    throw new Error('S3 client not configured. Check your AWS credentials.');
  }

  const ext = path.extname(filename).toLowerCase();
  const key = `${type}/${userId}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: getContentType(ext)
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key
    };
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Get public URL for S3 object
 */
export const getPublicUrl = (key) => {
  if (!key) return null;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
};

/**
 * Delete file from S3
 */
export const deleteFileFromS3 = async (key) => {
  if (!s3Client || !key) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    });

    await s3Client.send(command);
    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Local file storage (development fallback)
 */
export const saveFileLocally = async (file, filename, type, userId) => {
  const { ext, config } = validateFileType(filename, type);

  // Create directories if they don't exist
  const uploadDir = `uploads/${type}/${userId}`;
  await fs.mkdir(uploadDir, { recursive: true });

  const uniqueFilename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // Save file
  await fs.writeFile(filePath, file);

  // The filePath is "uploads/type/userId/filename"
  // The serve endpoint expects path after "uploads/"
  // So we strip "uploads/" from the start
  const relativePath = filePath.replace(/^uploads[\\/]/, '').replace(/\\/g, '/');

  // Construct the API URL that matches the route in uploads.controller.js
  const publicUrl = `/api/v1/uploads/file/${relativePath}`;

  return {
    uploadUrl: null, // Not needed for local
    publicUrl,
    key: filePath
  };
};

/**
 * Get presigned upload URL (with local fallback)
 */
export const getPresignedUploadUrl = async (filename, type, userId) => {
  if (NODE_ENV === 'development' && !s3Client) {
    // Return local upload endpoint info
    const { ext } = validateFileType(filename, type);
    const key = `${type}/${userId}/${crypto.randomUUID()}${ext}`;

    return {
      uploadUrl: `/api/v1/uploads/local`,
      publicUrl: null,
      key,
      local: true
    };
  }

  return await generatePresignedUploadUrl(filename, type, userId);
};

/**
 * Get content type from extension
 */
const getContentType = (ext) => {
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime'
  };

  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
};


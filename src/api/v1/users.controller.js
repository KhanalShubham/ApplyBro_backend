import User from '../../models/user.model.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('bookmarks', 'title country level deadline status');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * PUT /api/v1/users/me
 * Update current user profile
 */
export const updateCurrentUser = async (req, res) => {
  try {
    const updateData = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.profile) {
      updateData.profile = {
        ...req.user.profile?.toObject(),
        ...req.body.profile
      };
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    logger.info(`User profile updated: ${user.email}`);
    
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * POST /api/v1/users/me/documents
 * Add document to user profile
 */
export const addDocument = async (req, res) => {
  try {
    const { type, name, url } = req.body;
    
    if (!type || !name || !url) {
      return res.status(400).json({
        status: 'error',
        message: 'Type, name, and URL are required'
      });
    }
    
    const user = await User.findById(req.userId);
    
    user.documents.push({
      type,
      name,
      url,
      status: 'pending',
      uploadedAt: new Date()
    });
    
    await user.save();
    
    logger.info(`Document added for user: ${user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        document: user.documents[user.documents.length - 1]
      }
    });
  } catch (error) {
    logger.error('Add document error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add document'
    });
  }
};

/**
 * DELETE /api/v1/users/me/documents/:docId
 * Delete a document
 */
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    
    const user = await User.findById(req.userId);
    
    const docIndex = user.documents.findIndex(
      doc => doc._id.toString() === docId
    );
    
    if (docIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    user.documents.splice(docIndex, 1);
    await user.save();
    
    logger.info(`Document deleted for user: ${user.email}`);
    
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







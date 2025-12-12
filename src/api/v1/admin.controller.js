import User from '../../models/user.model.js';
import UserDocument from '../../models/userDocument.model.js';
import Post from '../../models/post.model.js';
import Scholarship from '../../models/scholarship.model.js';
import College from '../../models/college.model.js';
import AdminAction from '../../models/adminAction.model.js';
import { sendPostModerationEmail } from '../../services/email.service.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';
import { logger } from '../../utils/logger.js';

/**
 * Log admin action for audit trail
 */
const logAdminAction = async (adminId, actionType, targetId, targetType, details = {}, metadata = {}) => {
  try {
    await AdminAction.create({
      admin: adminId,
      actionType,
      targetId,
      targetType,
      details,
      metadata
    });
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
};

// ========== USER MANAGEMENT ==========

/**
 * GET /api/v1/admin/users
 * Get all users with filters
 */
export const getUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      page = 1,
      pageSize = 20
    } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

/**
 * PUT /api/v1/admin/users/:id/role
 * Update user role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await logAdminAction(
      req.userId,
      'user_updated',
      id,
      'User',
      { action: 'role_change', newRole: role }
    );
    
    logger.info(`User role updated: ${user.email} to ${role} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user (admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await logAdminAction(
      req.userId,
    'user_deleted',
      id,
      'User',
      { email: user.email }
    );
    
    logger.info(`User deleted: ${user.email} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

// ========== DOCUMENT VERIFICATION ==========

/**
 * GET /api/v1/admin/documents/all
 * Get all documents (pending, verified, rejected) for admin overview
 */
export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Build query for UserDocument collection (primary source)
    const userDocQuery = status ? { status } : {};
    
    // Add search functionality if provided
    let userDocuments;
    if (search) {
      // Search by filename or user name/email
      userDocuments = await UserDocument.find(userDocQuery)
        .populate({
          path: 'userId',
          select: 'name email',
          match: {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        })
        .sort({ uploadedAt: -1 })
        .lean();
      
      // Filter by search term in filename
      userDocuments = userDocuments.filter(doc => 
        doc.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
        (doc.userId && (doc.userId.name || doc.userId.email))
      );
      
      // Apply pagination after filtering
      const total = userDocuments.length;
      userDocuments = userDocuments.slice(skip, skip + limit);
      
      res.json({
        status: 'success',
        data: {
          documents: userDocuments.map(doc => ({
            docId: doc._id,
            userId: doc.userId?._id || doc.userId || null,
            userName: doc.userId?.name || 'Unknown',
            userEmail: doc.userId?.email || 'Unknown',
            type: doc.documentType,
            name: doc.originalFilename,
            url: doc.fileUrl,
            status: doc.status,
            uploadedAt: doc.uploadedAt,
            verifiedAt: doc.verifiedAt,
            verifiedBy: doc.verifiedBy,
            adminNote: doc.adminNote,
            source: 'UserDocument',
            documentType: doc.documentType,
            educationType: doc.type,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            parsingStatus: doc.parsingStatus
          })),
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: total,
            totalPages: Math.ceil(total / parseInt(pageSize))
          }
        }
      });
      return;
    }
    
    // Normal query without search
    userDocuments = await UserDocument.find(userDocQuery)
      .populate('userId', 'name email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalUserDocs = await UserDocument.countDocuments(userDocQuery);
    
    // Only return documents from UserDocument collection (primary source)
    // This avoids duplicates from User.documents array
    const allDocs = userDocuments.map(doc => ({
      docId: doc._id,
      userId: doc.userId?._id || doc.userId || null,
      userName: doc.userId?.name || 'Unknown',
      userEmail: doc.userId?.email || 'Unknown',
      type: doc.documentType,
      name: doc.originalFilename,
      url: doc.fileUrl,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
      verifiedAt: doc.verifiedAt,
      verifiedBy: doc.verifiedBy,
      adminNote: doc.adminNote,
      source: 'UserDocument',
      documentType: doc.documentType,
      educationType: doc.type,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      parsingStatus: doc.parsingStatus
    }));
    
    res.json({
      status: 'success',
      data: {
        documents: allDocs,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: totalUserDocs,
          totalPages: Math.ceil(totalUserDocs / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get all documents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents'
    });
  }
};

/**
 * GET /api/v1/admin/documents/pending
 * Get pending documents from both UserDocument collection and User.documents array
 */
export const getPendingDocuments = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Get pending documents from UserDocument collection
    const userDocuments = await UserDocument.find({
      status: 'pending'
    })
    .populate('userId', 'name email')
    .sort({ uploadedAt: -1 })
    .lean();
    
    // Get pending documents from User.documents array
    const users = await User.find({
      'documents.status': 'pending'
    }).select('name email documents');
    
    // Flatten documents with user info
    const pendingDocs = [];
    
    // Add UserDocument collection documents
    userDocuments.forEach(doc => {
      if (doc.userId) {
        pendingDocs.push({
          docId: doc._id,
          userId: doc.userId._id || doc.userId,
          userName: doc.userId.name || 'Unknown',
          userEmail: doc.userId.email || 'Unknown',
          type: doc.documentType,
          name: doc.originalFilename,
          url: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          source: 'UserDocument', // Flag to identify source
          documentType: doc.documentType,
          educationType: doc.type, // Education level type (+2, bachelor, etc.)
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          parsingStatus: doc.parsingStatus
        });
      }
    });
    
    // Add User.documents array documents
    users.forEach(user => {
      user.documents.forEach(doc => {
        if (doc.status === 'pending') {
          pendingDocs.push({
            docId: doc._id,
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            type: doc.type,
            name: doc.name,
            url: doc.url,
            uploadedAt: doc.uploadedAt,
            source: 'User.documents' // Flag to identify source
          });
        }
      });
    });
    
    // Sort by upload date
    pendingDocs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    const paginated = pendingDocs.slice(skip, skip + limit);
    
    res.json({
      status: 'success',
      data: {
        documents: paginated,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: pendingDocs.length,
          totalPages: Math.ceil(pendingDocs.length / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get pending documents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending documents'
    });
  }
};

/**
 * PUT /api/v1/admin/documents/:userId/:docId/verify
 * Verify or reject a document (handles both UserDocument and User.documents)
 * Also supports PUT /api/v1/admin/documents/:docId/verify for UserDocument collection
 */
export const verifyDocument = async (req, res) => {
  try {
    // Support both routes: /:userId/:docId/verify and /:docId/verify
    const { userId: userIdParam, docId } = req.params;
    const { status, adminNote, userId: userIdBody } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be verified or rejected'
      });
    }
    
    let userId = userIdParam || userIdBody;
    let verifiedDoc = null;
    let docType = null;
    let user = null;
    
    // Try to find in UserDocument collection first (works with or without userId)
    const userDocumentQuery = userId 
      ? { _id: docId, userId: userId }
      : { _id: docId };
    
    const userDocument = await UserDocument.findOne(userDocumentQuery)
      .populate('userId', 'name email');
    
    if (userDocument) {
      userId = userDocument.userId._id || userDocument.userId;
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      // Update UserDocument
      userDocument.status = status;
      userDocument.verifiedAt = new Date();
      userDocument.verifiedBy = req.userId;
      if (adminNote) userDocument.adminNote = adminNote;
      await userDocument.save();
      
      verifiedDoc = userDocument;
      docType = userDocument.documentType;
      
      // Also sync to User.documents array if it exists
      const userDocInArray = user.documents.find(
        doc => doc.url === userDocument.fileUrl
      );
      if (userDocInArray) {
        userDocInArray.status = status;
        userDocInArray.verifiedAt = new Date();
        if (adminNote) userDocInArray.adminNote = adminNote;
        await user.save();
      }
    } else if (userId) {
      // Try to find in User.documents array
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      const doc = user.documents.id(docId);
      
      if (!doc) {
        return res.status(404).json({
          status: 'error',
          message: 'Document not found'
        });
      }
      
      doc.status = status;
      doc.verifiedAt = new Date();
      if (adminNote) doc.adminNote = adminNote;
      await user.save();
      
      verifiedDoc = doc;
      docType = doc.type;
      
      // Also sync to UserDocument if it exists
      const userDocumentByUrl = await UserDocument.findOne({
        userId: userId,
        fileUrl: doc.url
      });
      if (userDocumentByUrl) {
        userDocumentByUrl.status = status;
        userDocumentByUrl.verifiedAt = new Date();
        userDocumentByUrl.verifiedBy = req.userId;
        if (adminNote) userDocumentByUrl.adminNote = adminNote;
        await userDocumentByUrl.save();
      }
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    await logAdminAction(
      req.userId,
      status === 'verified' ? 'document_verified' : 'document_rejected',
      docId,
      'Document',
      { userId, type: docType }
    );
    
    logger.info(`Document ${status}: ${verifiedDoc.name || verifiedDoc.originalFilename} for user ${user.email} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: `Document ${status} successfully`,
      data: { document: verifiedDoc }
    });
  } catch (error) {
    logger.error('Verify document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify document'
    });
  }
};

// ========== POST MODERATION ==========

/**
 * GET /api/v1/admin/posts/pending
 * Get pending posts for moderation
 */
export const getPendingPosts = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [posts, total] = await Promise.all([
      Post.find({ status: 'pending' })
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ status: 'pending' })
    ]);
    
    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get pending posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending posts'
    });
  }
};

/**
 * PUT /api/v1/admin/posts/:id/moderate
 * Approve or decline a post
 */
export const moderatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be approved or declined'
      });
    }
    
    const post = await Post.findById(id).populate('author');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    post.status = status;
    post.moderatedBy = req.userId;
    post.moderatedAt = new Date();
    if (adminNote) post.adminNote = adminNote;
    
    await post.save();
    
    // Send email notification to author
    if (post.author && post.author.email) {
      try {
        await sendPostModerationEmail(post.author, post, status, adminNote);
      } catch (emailError) {
        logger.error('Failed to send moderation email:', emailError);
      }
    }
    
    await logAdminAction(
      req.userId,
    status === 'approved' ? 'post_approved' : 'post_declined',
      id,
      'Post',
      { title: post.title }
    );
    
    logger.info(`Post ${status}: ${post.title} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: `Post ${status} successfully`,
      data: { post }
    });
  } catch (error) {
    logger.error('Moderate post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to moderate post'
    });
  }
};

// ========== ANALYTICS ==========

/**
 * GET /api/v1/admin/analytics
 * Get platform analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      activeUsers,
      totalScholarships,
      openScholarships,
      pendingPosts,
      verifiedDocuments,
      pendingDocuments
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ emailVerified: true }),
      Scholarship.countDocuments(),
      Scholarship.countDocuments({ status: 'open', verified: true }),
      Post.countDocuments({ status: 'pending' }),
      User.countDocuments({ 'documents.status': 'verified' }),
      User.countDocuments({ 'documents.status': 'pending' })
    ]);
    
    // Get user growth over last 8 months
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 8))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalAdmins,
          activeUsers,
          totalScholarships,
          openScholarships,
          pendingPosts,
          verifiedDocuments,
          pendingDocuments
        },
        userGrowth
      }
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics'
    });
  }
};

/**
 * GET /api/v1/admin/actions
 * List admin audit actions (paginated)
 */
export const getAdminActions = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [actions, total] = await Promise.all([
      AdminAction.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('admin', 'name email')
        .lean(),
      AdminAction.countDocuments({})
    ]);
    
    res.json({
      status: 'success',
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get admin actions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin actions'
    });
  }
};







import Scholarship from '../../models/scholarship.model.js';
import User from '../../models/user.model.js';
import AdminAction from '../../models/adminAction.model.js';
import { getRecommendations, getPopularScholarships } from '../../services/recommendation.service.js';
import { authenticate, optionalAuth } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/scholarships
 * Get all scholarships with filters and pagination
 */
export const getScholarships = async (req, res) => {
  try {
    const {
      q, // Search query
      country,
      level,
      fields,
      status,
      deadlineBefore,
      adminOnly,
      page = 1,
      pageSize = 20,
      sort = 'deadline',
      order = 'asc'
    } = req.query;
    
    // Build query
    const query = {};
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filters
    if (country) query.country = country;
    if (level) query.level = level;
    if (status) query.status = status;
    if (fields) {
      query.fields = { $in: Array.isArray(fields) ? fields : [fields] };
    }
    if (deadlineBefore) {
      query.deadline = { $lte: new Date(deadlineBefore) };
    }
    
    // Default: only show open/upcoming verified scholarships
    if (!status) {
      query.status = { $in: ['open', 'upcoming'] };
    }
    if (!req.query.includeUnverified) {
      query.verified = true;
    }
    // Only scholarships created by admins (optional filter for client)
    if (adminOnly === 'true') {
      const adminIds = await User.find({ role: 'admin' }).distinct('_id');
      query.createdBy = { $in: adminIds };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Sort options
    const sortOptions = {};
    if (sort === 'deadline') {
      sortOptions.deadline = order === 'asc' ? 1 : -1;
    } else if (sort === 'title') {
      sortOptions.title = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }
    
    // If text search, add text score to sort
    if (q) {
      sortOptions.score = { $meta: 'textScore' };
    }
    
    // Execute query
    const [scholarships, total] = await Promise.all([
      Scholarship.find(query)
        .populate('college', 'name country logo')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Scholarship.countDocuments(query)
    ]);
    
    res.json({
      status: 'success',
      data: {
        scholarships,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get scholarships error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scholarships'
    });
  }
};

/**
 * GET /api/v1/scholarships/:id
 * Get single scholarship
 */
export const getScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findById(id)
      .populate('college', 'name country city description website logo')
      .populate('createdBy', 'name email');
    
    if (!scholarship) {
      return res.status(404).json({
        status: 'error',
        message: 'Scholarship not found'
      });
    }
    
    // Check if user has bookmarked this scholarship
    let isBookmarked = false;
    if (req.userId) {
      const user = await User.findById(req.userId);
      isBookmarked = user?.bookmarks?.some(
        bookmark => bookmark.toString() === id
      ) || false;
    }
    
    res.json({
      status: 'success',
      data: {
        scholarship: {
          ...scholarship.toObject(),
          isBookmarked
        }
      }
    });
  } catch (error) {
    logger.error('Get scholarship error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scholarship'
    });
  }
};

/**
 * POST /api/v1/scholarships
 * Create new scholarship (admin only)
 */
export const createScholarship = async (req, res) => {
  try {
    const scholarshipData = {
      ...req.body,
      createdBy: req.userId,
      verified: req.user.role === 'admin' // Auto-verify if created by admin
    };
    
    const scholarship = await Scholarship.create(scholarshipData);
    
    await scholarship.populate('college', 'name country');
    
    // Audit: admin created scholarship
    if (req.user?.role === 'admin') {
      try {
        await AdminAction.create({
          admin: req.userId,
          actionType: 'create-scholarship',
          targetType: 'scholarship',
          targetId: scholarship._id,
          targetLabel: scholarship.title,
          details: `Created scholarship ${scholarship.title}`
        });
      } catch (auditErr) {
        logger.warn('Audit log failed (create-scholarship)', { error: auditErr.message });
      }
    }
    
    logger.info(`Scholarship created: ${scholarship.title} by ${req.user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Scholarship created successfully',
      data: { scholarship }
    });
  } catch (error) {
    logger.error('Create scholarship error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create scholarship'
    });
  }
};

/**
 * PUT /api/v1/scholarships/:id
 * Update scholarship (admin only)
 */
export const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('college', 'name country');
    
    if (!scholarship) {
      return res.status(404).json({
        status: 'error',
        message: 'Scholarship not found'
      });
    }
    
    // Audit: admin updated scholarship
    if (req.user?.role === 'admin') {
      try {
        await AdminAction.create({
          admin: req.userId,
          actionType: 'update-scholarship',
          targetType: 'scholarship',
          targetId: scholarship._id,
          targetLabel: scholarship.title,
          details: 'Updated scholarship'
        });
      } catch (auditErr) {
        logger.warn('Audit log failed (update-scholarship)', { error: auditErr.message });
      }
    }
    
    logger.info(`Scholarship updated: ${scholarship.title} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Scholarship updated successfully',
      data: { scholarship }
    });
  } catch (error) {
    logger.error('Update scholarship error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update scholarship'
    });
  }
};

/**
 * DELETE /api/v1/scholarships/:id
 * Delete scholarship (admin only)
 */
export const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByIdAndDelete(id);
    
    if (!scholarship) {
      return res.status(404).json({
        status: 'error',
        message: 'Scholarship not found'
      });
    }
    
    // Remove from all users' bookmarks
    await User.updateMany(
      { bookmarks: id },
      { $pull: { bookmarks: id } }
    );
    
    // Audit: admin deleted scholarship
    if (req.user?.role === 'admin') {
      try {
        await AdminAction.create({
          admin: req.userId,
          actionType: 'delete-scholarship',
          targetType: 'scholarship',
          targetId: scholarship._id,
          targetLabel: scholarship.title,
          details: 'Deleted scholarship'
        });
      } catch (auditErr) {
        logger.warn('Audit log failed (delete-scholarship)', { error: auditErr.message });
      }
    }
    
    logger.info(`Scholarship deleted: ${scholarship.title} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    logger.error('Delete scholarship error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete scholarship'
    });
  }
};

/**
 * POST /api/v1/scholarships/:id/bookmark
 * Toggle bookmark for a scholarship
 */
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    const scholarship = await Scholarship.findById(id);
    
    if (!scholarship) {
      return res.status(404).json({
        status: 'error',
        message: 'Scholarship not found'
      });
    }
    
    const bookmarkIndex = user.bookmarks.findIndex(
      bookmark => bookmark.toString() === id
    );
    
    let isBookmarked;
    if (bookmarkIndex === -1) {
      // Add bookmark
      user.bookmarks.push(id);
      isBookmarked = true;
    } else {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
      isBookmarked = false;
    }
    
    await user.save();
    
    res.json({
      status: 'success',
      message: isBookmarked ? 'Scholarship bookmarked' : 'Bookmark removed',
      data: { isBookmarked }
    });
  } catch (error) {
    logger.error('Toggle bookmark error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle bookmark'
    });
  }
};

/**
 * GET /api/v1/scholarships/recommendations
 * Get personalized recommendations
 */
export const getRecommendationsEndpoint = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const recommendations = await getRecommendations(user, limit);
    
    res.json({
      status: 'success',
      data: { scholarships: recommendations }
    });
  } catch (error) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get recommendations'
    });
  }
};

/**
 * GET /api/v1/scholarships/popular
 * Get popular scholarships (most bookmarked)
 */
export const getPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const popular = await getPopularScholarships(limit);
    
    res.json({
      status: 'success',
      data: { scholarships: popular }
    });
  } catch (error) {
    logger.error('Get popular scholarships error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get popular scholarships'
    });
  }
};







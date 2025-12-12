import Post from '../../models/post.model.js';
import User from '../../models/user.model.js';
import Like from '../../models/like.model.js';
import Report from '../../models/report.model.js';
import { sendPostModerationEmail } from '../../services/email.service.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { logger } from '../../utils/logger.js';
import sanitizeHtml from 'sanitize-html';

/**
 * GET /api/v1/posts
 * Get all posts with filters (only approved for non-admins)
 */
export const getPosts = async (req, res) => {
  try {
    const {
      status = 'approved',
      category,
      author,
      tag,
      country,
      sort = 'latest', // latest or popular
      page = 1,
      pageSize = 20
    } = req.query;
    
    const query = {};
    
    // Only show approved posts to non-admins
    if (req.user?.role !== 'admin') {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }
    
    if (category) query.category = category;
    if (author) query.author = author;
    if (tag) query.tags = { $in: [tag] };
    if (country) query.country = country;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Sort options
    let sortOption = { createdAt: -1 }; // default: latest
    if (sort === 'popular') {
      sortOption = { likesCount: -1, commentsCount: -1, createdAt: -1 };
    }
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query)
    ]);
    
    // Check which posts user has liked (if authenticated)
    const postsWithLikes = posts;
    if (req.userId) {
      const postIds = posts.map(p => p._id);
      const userLikes = await Like.find({
        userId: req.userId,
        resourceType: 'post',
        resourceId: { $in: postIds }
      }).lean();
      
      const likedPostIds = new Set(userLikes.map(l => l.resourceId.toString()));
      postsWithLikes.forEach(post => {
        post.isLiked = likedPostIds.has(post._id.toString());
      });
    }
    
    res.json({
      status: 'success',
      data: {
        posts: postsWithLikes,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch posts'
    });
  }
};

/**
 * GET /api/v1/posts/:id
 * Get single post (must be approved or user is author/admin)
 */
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'name email avatar');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check permissions: only show approved posts unless user is author or admin
    const isAuthor = req.userId && post.author._id.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (post.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Post is not available'
      });
    }
    
    // Check if user has liked this post
    let isLiked = false;
    if (req.userId) {
      const like = await Like.findOne({
        userId: req.userId,
        resourceType: 'post',
        resourceId: post._id
      });
      isLiked = !!like;
    }
    
    res.json({
      status: 'success',
      data: {
        post: {
          ...post.toObject(),
          isLiked
        }
      }
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch post'
    });
  }
};

/**
 * GET /api/v1/posts/me
 * Get current user's posts (all statuses)
 */
export const getMyPosts = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    
    const query = { author: req.userId };
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query)
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
    logger.error('Get my posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch posts'
    });
  }
};

/**
 * POST /api/v1/posts
 * Create new post (authenticated users)
 */
export const createPost = async (req, res) => {
  try {
    const { title, body, images, tags, country, category } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }
    
    if (!body || !body.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Post body is required'
      });
    }
    
    // Sanitize HTML content
    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      allowedAttributes: {}
    });
    
    // Simple spam check: count links
    const linkCount = (sanitizedBody.match(/https?:\/\//g) || []).length;
    if (linkCount > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Too many links in post. Please reduce the number of links.'
      });
    }
    
    const post = await Post.create({
      author: req.userId,
      title: title.trim(),
      body: sanitizedBody,
      images: images || [],
      tags: tags || [],
      country: country || '',
      category: category || 'Other',
      status: 'pending' // All posts start as pending
    });
    
    await post.populate('author', 'name email avatar');
    
    logger.info(`Post created: ${post.title} by ${req.user.email}`);
    
    // TODO: Notify admins about new pending post
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully. It will be reviewed by an admin before being published.',
      data: { 
        post: {
          _id: post._id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create post'
    });
  }
};

/**
 * PUT /api/v1/posts/:id
 * Update post (author only, only if pending/declined)
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, images, tags, country, category } = req.body;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if user is author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own posts'
      });
    }
    
    // Only allow editing if pending or declined
    if (post.status === 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot edit approved posts'
      });
    }
    
    // Update fields
    if (title) post.title = title.trim();
    if (body) {
      const sanitizedBody = sanitizeHtml(body, {
        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {}
      });
      post.body = sanitizedBody;
    }
    if (images !== undefined) post.images = images;
    if (tags !== undefined) post.tags = tags;
    if (country !== undefined) post.country = country;
    if (category) post.category = category;
    
    // Reset status to pending if it was declined
    if (post.status === 'declined') {
      post.status = 'pending';
      post.declineReason = null;
    }
    
    await post.save();
    await post.populate('author', 'name email avatar');
    
    logger.info(`Post updated: ${post.title} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update post'
    });
  }
};

/**
 * DELETE /api/v1/posts/:id
 * Delete post (author or admin)
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own posts'
      });
    }
    
    // Delete associated likes and comments
    await Like.deleteMany({ resourceType: 'post', resourceId: post._id });
    // Comments will be handled separately in comments controller
    
    await Post.findByIdAndDelete(id);
    
    logger.info(`Post deleted: ${post.title} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete post'
    });
  }
};

/**
 * POST /api/v1/posts/:id/like
 * Toggle like on a post (using Like model for de-duplication)
 */
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({
      userId,
      resourceType: 'post',
      resourceId: post._id
    });
    
    let isLiked;
    if (existingLike) {
      // Unlike: remove like and decrement count
      await Like.findByIdAndDelete(existingLike._id);
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      // Like: create like and increment count
      await Like.create({
        userId,
        resourceType: 'post',
        resourceId: post._id
      });
      post.likesCount = (post.likesCount || 0) + 1;
      isLiked = true;
    }
    
    await post.save();
    
    res.json({
      status: 'success',
      message: isLiked ? 'Post liked' : 'Like removed',
      data: { 
        isLiked,
        likesCount: post.likesCount
      }
    });
  } catch (error) {
    logger.error('Toggle like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle like'
    });
  }
};

/**
 * POST /api/v1/posts/:id/report
 * Report a post
 */
export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reason is required'
      });
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if user already reported this post
    const existingReport = await Report.findOne({
      reporter: req.userId,
      resourceType: 'post',
      resourceId: post._id
    });
    
    if (existingReport) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reported this post'
      });
    }
    
    // Create report
    const report = await Report.create({
      reporter: req.userId,
      resourceType: 'post',
      resourceId: post._id,
      reason: reason.trim(),
      details: details?.trim() || '',
      status: 'open'
    });
    
    // Increment reported count on post
    post.reportedCount = (post.reportedCount || 0) + 1;
    await post.save();
    
    logger.info(`Post reported: ${post.title} by ${req.user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Report submitted successfully. Our moderators will review it.',
      data: { reportId: report._id }
    });
  } catch (error) {
    logger.error('Report post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to report post'
    });
  }
};

// Comments are now handled in comments.controller.js







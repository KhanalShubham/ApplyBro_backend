import Post from '../../models/post.model.js';
import User from '../../models/user.model.js';
import { sendPostModerationEmail } from '../../services/email.service.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/posts
 * Get all posts with filters
 */
export const getPosts = async (req, res) => {
  try {
    const {
      status = 'approved', // Default to approved only
      category,
      author,
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
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email')
        .populate('likes', 'name')
        .populate('comments.author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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
    logger.error('Get posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch posts'
    });
  }
};

/**
 * GET /api/v1/posts/:id
 * Get single post
 */
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('likes', 'name email')
      .populate('comments.author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if user has liked this post
    let isLiked = false;
    if (req.userId) {
      isLiked = post.likes.some(
        like => like._id.toString() === req.userId
      );
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
 * POST /api/v1/posts
 * Create new post (student only)
 */
export const createPost = async (req, res) => {
  try {
    const { title, body, imageUrl, category } = req.body;
    
    const post = await Post.create({
      author: req.userId,
      title,
      body,
      imageUrl: imageUrl || '',
      category: category || 'Other',
      status: 'pending' // All posts start as pending
    });
    
    await post.populate('author', 'name email');
    
    logger.info(`Post created: ${post.title} by ${req.user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully. It will be reviewed by an admin before being published.',
      data: { post }
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
 * POST /api/v1/posts/:id/like
 * Toggle like on a post
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
    
    const likeIndex = post.likes.findIndex(
      like => like.toString() === userId
    );
    
    let isLiked;
    if (likeIndex === -1) {
      post.likes.push(userId);
      isLiked = true;
    } else {
      post.likes.splice(likeIndex, 1);
      isLiked = false;
    }
    
    await post.save();
    
    res.json({
      status: 'success',
      message: isLiked ? 'Post liked' : 'Like removed',
      data: { 
        isLiked,
        likesCount: post.likes.length
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
 * POST /api/v1/posts/:id/comments
 * Add comment to a post
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required'
      });
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    post.comments.push({
      author: req.userId,
      text: text.trim(),
      createdAt: new Date()
    });
    
    await post.save();
    await post.populate('comments.author', 'name email');
    
    const newComment = post.comments[post.comments.length - 1];
    
    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: { comment: newComment }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add comment'
    });
  }
};







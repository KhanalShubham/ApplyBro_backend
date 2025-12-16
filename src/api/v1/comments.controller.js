import Comment from '../../models/comment.model.js';
import Post from '../../models/post.model.js';
import Like from '../../models/like.model.js';
import Report from '../../models/report.model.js';
import { logger } from '../../utils/logger.js';
import sanitizeHtml from 'sanitize-html';

/**
 * POST /api/v1/posts/:postId/comments
 * Add comment to a post
 */
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { body } = req.body;
    
    if (!body || !body.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment body is required'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Only allow comments on approved posts (or if user is author/admin)
    const isAuthor = post.author.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (post.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot comment on this post'
      });
    }
    
    // Sanitize HTML
    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u'],
      allowedAttributes: {}
    });
    
    // Create comment
    const comment = await Comment.create({
      postId: post._id,
      author: req.userId,
      body: sanitizedBody,
      status: 'visible'
    });
    
    // Increment comments count on post
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();
    
    await comment.populate('author', 'name email avatar');
    
    logger.info(`Comment added to post ${postId} by ${req.user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add comment'
    });
  }
};

/**
 * GET /api/v1/posts/:postId/comments
 * Get comments for a post (only visible)
 */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Only show visible comments to non-admins
    const query = { postId, status: 'visible' };
    if (req.user?.role === 'admin') {
      // Admins can see all comments except removed
      query.status = { $ne: 'removed' };
    }
    
    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 }) // Oldest first
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query)
    ]);
    
    // Check which comments user has liked (if authenticated)
    const commentsWithLikes = comments;
    if (req.userId) {
      const commentIds = comments.map(c => c._id);
      const userLikes = await Like.find({
        userId: req.userId,
        resourceType: 'comment',
        resourceId: { $in: commentIds }
      }).lean();
      
      const likedCommentIds = new Set(userLikes.map(l => l.resourceId.toString()));
      commentsWithLikes.forEach(comment => {
        comment.isLiked = likedCommentIds.has(comment._id.toString());
      });
    }
    
    res.json({
      status: 'success',
      data: {
        comments: commentsWithLikes,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comments'
    });
  }
};

/**
 * PUT /api/v1/comments/:id
 * Update comment (author only)
 */
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    
    if (!body || !body.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment body is required'
      });
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user is author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own comments'
      });
    }
    
    // Sanitize HTML
    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u'],
      allowedAttributes: {}
    });
    
    comment.body = sanitizedBody;
    await comment.save();
    await comment.populate('author', 'name email avatar');
    
    logger.info(`Comment updated: ${id} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update comment'
    });
  }
};

/**
 * DELETE /api/v1/comments/:id
 * Delete comment (author or admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user is author or admin
    const isAuthor = comment.author.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own comments'
      });
    }
    
    // Decrement comments count on post
    const post = await Post.findById(comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
      await post.save();
    }
    
    // Delete associated likes
    await Like.deleteMany({ resourceType: 'comment', resourceId: comment._id });
    
    // Delete comment
    await Comment.findByIdAndDelete(id);
    
    logger.info(`Comment deleted: ${id} by ${req.user.email}`);
    
    res.json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment'
    });
  }
};

/**
 * POST /api/v1/comments/:id/like
 * Toggle like on a comment
 */
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({
      userId,
      resourceType: 'comment',
      resourceId: comment._id
    });
    
    let isLiked;
    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      isLiked = false;
    } else {
      // Like
      await Like.create({
        userId,
        resourceType: 'comment',
        resourceId: comment._id
      });
      isLiked = true;
    }
    
    // Get updated like count
    const likesCount = await Like.countDocuments({
      resourceType: 'comment',
      resourceId: comment._id
    });
    
    res.json({
      status: 'success',
      message: isLiked ? 'Comment liked' : 'Like removed',
      data: { 
        isLiked,
        likesCount
      }
    });
  } catch (error) {
    logger.error('Toggle comment like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle like'
    });
  }
};

/**
 * POST /api/v1/comments/:id/report
 * Report a comment
 */
export const reportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reason is required'
      });
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user already reported this comment
    const existingReport = await Report.findOne({
      reporter: req.userId,
      resourceType: 'comment',
      resourceId: comment._id
    });
    
    if (existingReport) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reported this comment'
      });
    }
    
    // Create report
    const report = await Report.create({
      reporter: req.userId,
      resourceType: 'comment',
      resourceId: comment._id,
      reason: reason.trim(),
      details: details?.trim() || '',
      status: 'open'
    });
    
    // Increment reported count and update status
    comment.reportedCount = (comment.reportedCount || 0) + 1;
    if (comment.reportedCount >= 3) {
      comment.status = 'reported'; // Auto-flag if 3+ reports
    }
    await comment.save();
    
    logger.info(`Comment reported: ${id} by ${req.user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Report submitted successfully. Our moderators will review it.',
      data: { reportId: report._id }
    });
  } catch (error) {
    logger.error('Report comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to report comment'
    });
  }
};




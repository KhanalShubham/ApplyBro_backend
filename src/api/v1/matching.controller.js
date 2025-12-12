import { authenticate } from '../../middlewares/auth.middleware.js';
import { matchScholarships } from '../../services/matchEngine.service.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/scholarships/match
 * Match user's documents against available scholarships
 */
export const matchUserScholarships = async (req, res) => {
  try {
    const result = await matchScholarships(req.userId);
    
    res.json({
      status: 'success',
      message: result.message || 'Matching completed',
      data: result
    });
  } catch (error) {
    logger.error('Scholarship matching error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to match scholarships'
    });
  }
};


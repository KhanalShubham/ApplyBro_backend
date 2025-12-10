import Scholarship from '../models/scholarship.model.js';
import { logger } from '../utils/logger.js';

/**
 * Rule-based recommendation service
 * Matches scholarships based on user profile
 */
export const getRecommendations = async (user, limit = 10) => {
  try {
    const { profile } = user;
    const query = {
      status: 'open',
      verified: true,
      deadline: { $gt: new Date() }
    };
    
    // Base query filters
    const filters = [];
    
    // Match education level
    if (profile.educationLevel) {
      filters.push({
        $or: [
          { level: profile.educationLevel },
          { level: { $exists: false } } // Include scholarships without level requirement
        ]
      });
    }
    
    // Match GPA requirement
    if (profile.gpa) {
      filters.push({
        $or: [
          { 'eligibility.minGPA': { $lte: profile.gpa } },
          { 'eligibility.minGPA': { $exists: false } }
        ]
      });
    }
    
    // Match preferred countries (boost these)
    if (profile.preferredCountries && profile.preferredCountries.length > 0) {
      filters.push({
        country: { $in: profile.preferredCountries }
      });
    }
    
    // Match field of study
    if (profile.major) {
      filters.push({
        $or: [
          { fields: { $regex: profile.major, $options: 'i' } },
          { fields: { $size: 0 } } // Include scholarships with no field requirement
        ]
      });
    }
    
    // Apply filters
    if (filters.length > 0) {
      query.$and = filters;
    }
    
    // Fetch scholarships
    let scholarships = await Scholarship.find(query)
      .populate('college', 'name country')
      .sort({ deadline: 1 })
      .limit(limit * 2); // Get more for scoring
    
    // Score and rank scholarships
    scholarships = scholarships.map(scholarship => {
      let score = 0;
      const matchedBy = [];
      
      // Education level match (40 points)
      if (profile.educationLevel && scholarship.level === profile.educationLevel) {
        score += 40;
        matchedBy.push('level');
      }
      
      // Preferred country match (30 points)
      if (profile.preferredCountries && 
          profile.preferredCountries.includes(scholarship.country)) {
        score += 30;
        matchedBy.push('country');
      }
      
      // Field of study match (20 points)
      if (profile.major && 
          scholarship.fields.some(field => 
            field.toLowerCase().includes(profile.major.toLowerCase())
          )) {
        score += 20;
        matchedBy.push('field');
      }
      
      // GPA requirement match (10 points)
      if (profile.gpa && 
          (!scholarship.eligibility?.minGPA || 
           profile.gpa >= scholarship.eligibility.minGPA)) {
        score += 10;
        matchedBy.push('gpa');
      }
      
      // Time proximity bonus (deadline soon = higher priority)
      const daysUntilDeadline = Math.floor(
        (scholarship.deadline - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDeadline <= 30) {
        score += 5;
        matchedBy.push('deadline');
      }
      
      return {
        ...scholarship.toObject(),
        score,
        matchedBy: matchedBy.length > 0 ? matchedBy : ['general'],
        daysUntilDeadline
      };
    });
    
    // Sort by score (descending) and deadline (ascending)
    scholarships.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.deadline - b.deadline;
    });
    
    // Return top N
    return scholarships.slice(0, limit);
    
  } catch (error) {
    logger.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
};

/**
 * Get popular scholarships (most bookmarked)
 */
export const getPopularScholarships = async (limit = 10) => {
  try {
    const User = (await import('../models/user.model.js')).default;
    
    const scholarships = await Scholarship.aggregate([
      {
        $match: {
          status: 'open',
          verified: true,
          deadline: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'bookmarks',
          as: 'bookmarkedBy'
        }
      },
      {
        $addFields: {
          bookmarkCount: { $size: '$bookmarkedBy' }
        }
      },
      {
        $sort: { bookmarkCount: -1, deadline: 1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'colleges',
          localField: 'college',
          foreignField: '_id',
          as: 'college'
        }
      },
      {
        $unwind: { path: '$college', preserveNullAndEmptyArrays: true }
      }
    ]);
    
    return scholarships;
  } catch (error) {
    logger.error('Error fetching popular scholarships:', error);
    throw new Error('Failed to fetch popular scholarships');
  }
};







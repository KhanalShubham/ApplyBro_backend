import Scholarship from '../models/scholarship.model.js';
import UserDocument from '../models/userDocument.model.js';
import { logger } from '../utils/logger.js';

/**
 * APPLYBRO ENHANCED RECOMMENDATION SERVICE
 * 
 * Implements transparent, rule-based scholarship matching with:
 * - Weighted 100-point scoring system
 * - Three-tier categorization (Highly/Partially/Explore)
 * - Detailed explanations (whyRecommended/whyNot)
 * - Integration with user documents
 */

/**
 * Calculate match score using weighted criteria (100-point scale)
 * 
 * Weights:
 * - Degree Level: 30%
 * - GPA: 25%
 * - Field of Study: 20%
 * - English Score: 15%
 * - Country Preference: 10%
 */
const calculateWeightedScore = (scholarship, userData, profile) => {
  let score = 0;
  const matchedCriteria = [];
  const failedCriteria = [];
  const whyRecommended = [];
  const whyNot = [];
  const preparationSteps = [];

  // 1. Degree Level Match (30 points)
  if (scholarship.level) {
    const userLevel = userData.level || profile.educationLevel;
    if (userLevel === scholarship.level) {
      score += 30;
      matchedCriteria.push('Degree Level');
      whyRecommended.push(`✓ Your ${userLevel} level matches the scholarship requirement`);
    } else {
      failedCriteria.push('Degree Level');
      whyNot.push(`✗ Required: ${scholarship.level}, You have: ${userLevel || 'Not specified'}`);
      if (!userLevel) {
        preparationSteps.push('Complete your education level in your profile');
      }
    }
  } else {
    score += 30; // No requirement = full points
    matchedCriteria.push('Degree Level');
    whyRecommended.push('✓ No specific degree level required');
  }

  // 2. GPA Match (25 points)
  if (scholarship.eligibility?.minGPA) {
    const userGPA = userData.gpa || profile.gpa;
    if (userGPA) {
      if (userGPA >= scholarship.eligibility.minGPA) {
        const gpaMargin = userGPA - scholarship.eligibility.minGPA;
        score += 25;
        matchedCriteria.push('GPA');
        whyRecommended.push(`✓ Your GPA (${userGPA.toFixed(2)}) exceeds the minimum requirement (${scholarship.eligibility.minGPA})`);

        // Bonus for significant GPA margin
        if (gpaMargin >= 0.5) {
          whyRecommended.push(`  Strong candidate - GPA is ${gpaMargin.toFixed(2)} points above minimum`);
        }
      } else {
        const gpaGap = scholarship.eligibility.minGPA - userGPA;
        failedCriteria.push('GPA');
        whyNot.push(`✗ Your GPA (${userGPA.toFixed(2)}) is below the minimum (${scholarship.eligibility.minGPA})`);
        preparationSteps.push(`Work on improving your GPA by ${gpaGap.toFixed(2)} points`);
        preparationSteps.push('Consider scholarships with lower GPA requirements');
      }
    } else {
      failedCriteria.push('GPA');
      whyNot.push('✗ GPA not found in your profile or documents');
      preparationSteps.push('Upload your transcript or add GPA to your profile');
    }
  } else {
    score += 25;
    matchedCriteria.push('GPA');
    whyRecommended.push('✓ No minimum GPA requirement');
  }

  // 3. Field of Study Match (20 points)
  if (scholarship.fields && scholarship.fields.length > 0) {
    const userField = userData.stream || profile.major;
    if (userField) {
      const matchedField = scholarship.fields.some(field => {
        const fieldLower = field.toLowerCase();
        const userFieldLower = userField.toLowerCase();
        return fieldLower.includes(userFieldLower) || userFieldLower.includes(fieldLower);
      });

      if (matchedField) {
        score += 20;
        matchedCriteria.push('Field of Study');
        whyRecommended.push(`✓ Your field (${userField}) matches the scholarship requirements`);
      } else {
        failedCriteria.push('Field of Study');
        whyNot.push(`✗ Required fields: ${scholarship.fields.join(', ')}`);
        whyNot.push(`  Your field: ${userField}`);
        preparationSteps.push(`Consider scholarships in ${userField}`);
      }
    } else {
      failedCriteria.push('Field of Study');
      whyNot.push('✗ Field of study not specified in your profile');
      preparationSteps.push('Add your major/field of study to your profile');
    }
  } else {
    score += 20;
    matchedCriteria.push('Field of Study');
    whyRecommended.push('✓ Open to all fields of study');
  }

  // 4. English Score Match (15 points)
  const englishReq = scholarship.eligibility?.requiredEnglishScore;
  if (englishReq || scholarship.eligibility?.requiredDocs?.includes('ielts')) {
    const requiredScore = englishReq || 6.0;
    const userIELTS = userData.englishScore?.overall;

    if (userIELTS) {
      if (userIELTS >= requiredScore) {
        score += 15;
        matchedCriteria.push('English Score');
        whyRecommended.push(`✓ Your IELTS (${userIELTS}) meets the requirement (${requiredScore})`);
      } else {
        failedCriteria.push('English Score');
        whyNot.push(`✗ Your IELTS (${userIELTS}) is below the requirement (${requiredScore})`);
        preparationSteps.push(`Improve your IELTS score by ${(requiredScore - userIELTS).toFixed(1)} points`);
        preparationSteps.push('Consider taking IELTS preparation courses');
      }
    } else {
      failedCriteria.push('English Score');
      whyNot.push('✗ IELTS score not found in your documents');
      preparationSteps.push('Upload your IELTS scorecard or take the IELTS exam');
    }
  } else {
    score += 15;
    matchedCriteria.push('English Score');
    whyRecommended.push('✓ No English proficiency test required');
  }

  // 5. Country Preference (10 points)
  if (scholarship.country) {
    const preferredCountries = profile.preferredCountries || [];
    if (preferredCountries.includes(scholarship.country)) {
      score += 10;
      matchedCriteria.push('Country Preference');
      whyRecommended.push(`✓ ${scholarship.country} is one of your preferred countries`);
    } else if (preferredCountries.length === 0) {
      score += 10; // Give benefit of doubt if no preference set
      whyRecommended.push(`✓ Scholarship is in ${scholarship.country}`);
    } else {
      score += 5; // Partial points
      whyNot.push(`⚠ ${scholarship.country} is not in your preferred countries`);
    }
  } else {
    score += 10;
  }

  // Calculate deadline urgency bonus (max 5 additional points)
  const daysUntilDeadline = Math.floor(
    (new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  let deadlineBonus = 0;
  if (daysUntilDeadline <= 7) {
    deadlineBonus = 5;
    whyRecommended.push(`⚡ URGENT: Deadline in ${daysUntilDeadline} days!`);
  } else if (daysUntilDeadline <= 30) {
    deadlineBonus = 3;
    whyRecommended.push(`⏰ Deadline approaching in ${daysUntilDeadline} days`);
  }

  // Determine eligibility and category
  const finalScore = Math.min(score + deadlineBonus, 100);
  const eligible = failedCriteria.length === 0;

  let category;
  if (finalScore >= 80) {
    category = 'highly_recommended';
  } else if (finalScore >= 60) {
    category = 'partially_suitable';
  } else {
    category = 'explore_and_prepare';
  }

  return {
    score: finalScore,
    eligible,
    category,
    matchedCriteria,
    failedCriteria,
    whyRecommended: whyRecommended.length > 0 ? whyRecommended : ['General scholarship match'],
    whyNot: whyNot.length > 0 ? whyNot : [],
    preparationSteps: preparationSteps.length > 0 ? preparationSteps : [],
    daysUntilDeadline,
    details: {
      userGPA: userData.gpa || profile.gpa,
      userIELTS: userData.englishScore?.overall,
      userLevel: userData.level || profile.educationLevel,
      userField: userData.stream || profile.major
    }
  };
};

/**
 * Extract best user data from documents
 */
const getUserBestData = (documents) => {
  const data = {
    level: null,
    gpa: null,
    percentage: null,
    stream: null,
    passingYear: null,
    englishScore: null
  };

  // Find best transcript (highest GPA)
  let bestScore = 0;
  for (const doc of documents) {
    if (doc.parsedData) {
      const score = doc.parsedData.gpa || (doc.parsedData.percentage ? doc.parsedData.percentage / 25 : 0);
      if (score > bestScore) {
        bestScore = score;
        data.level = doc.parsedData.level || doc.type;
        data.gpa = doc.parsedData.gpa;
        data.percentage = doc.parsedData.percentage;
        data.stream = doc.parsedData.stream;
        data.passingYear = doc.parsedData.passingYear;
      }
    }
  }

  // Find IELTS document
  const ieltsDoc = documents.find(doc =>
    doc.type === 'ielts' || doc.documentType === 'ielts'
  );
  if (ieltsDoc?.parsedData?.englishScore) {
    data.englishScore = ieltsDoc.parsedData.englishScore;
  }

  return data;
};

/**
 * Enhanced recommendation endpoint
 * Returns scholarships in three categories with detailed explanations
 */
export const getEnhancedRecommendations = async (user, options = {}) => {
  try {
    const { limit = 30 } = options;
    const { profile } = user;

    // Fetch user documents
    const userDocuments = await UserDocument.find({
      userId: user._id,
      parsingStatus: 'completed'
    }).sort({ uploadedAt: -1 });

    const userData = getUserBestData(userDocuments);

    // Check for missing profile data
    const missingData = [];
    if (!profile.educationLevel && !userData.level) missingData.push('Education Level');
    if (!profile.gpa && !userData.gpa) missingData.push('GPA');
    if (!profile.major && !userData.stream) missingData.push('Field of Study');
    if (!userData.englishScore) missingData.push('IELTS Score');
    if (!profile.preferredCountries || profile.preferredCountries.length === 0) {
      missingData.push('Preferred Countries');
    }

    // Fetch all open and verified scholarships
    const scholarships = await Scholarship.find({
      status: 'open',
      verified: true,
      deadline: { $gt: new Date() }
    })
      .populate('college', 'name country')
      .limit(limit * 2); // Get extra for filtering

    // Score each scholarship
    const scoredScholarships = scholarships.map(scholarship => {
      const matchResult = calculateWeightedScore(scholarship, userData, profile);

      return {
        scholarship: scholarship.toObject(),
        ...matchResult
      };
    });

    // Sort by score (descending)
    scoredScholarships.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.daysUntilDeadline - b.daysUntilDeadline; // Closer deadlines first
    });

    // Categorize scholarships
    const highlyRecommended = scoredScholarships
      .filter(s => s.category === 'highly_recommended')
      .slice(0, 10);

    const partiallyRecommended = scoredScholarships
      .filter(s => s.category === 'partially_suitable')
      .slice(0, 10);

    const exploreAndPrepare = scoredScholarships
      .filter(s => s.category === 'explore_and_prepare')
      .slice(0, 10);

    logger.info(`Generated recommendations for user ${user._id}`, {
      highly: highlyRecommended.length,
      partially: partiallyRecommended.length,
      explore: exploreAndPrepare.length,
      missingData
    });

    return {
      highlyRecommended,
      partiallyRecommended,
      exploreAndPrepare,
      stats: {
        totalAnalyzed: scholarships.length,
        eligibleCount: scoredScholarships.filter(s => s.eligible).length,
        missingData,
        hasDocuments: userDocuments.length > 0,
        documentCount: userDocuments.length
      }
    };
  } catch (error) {
    logger.error('Enhanced recommendations error:', error);
    throw error;
  }
};

/**
 * Legacy recommendation function (for backward compatibility)
 */
export const getRecommendations = async (user, limit = 10) => {
  try {
    const enhanced = await getEnhancedRecommendations(user, { limit });

    // Combine all categories for legacy response
    const combined = [
      ...enhanced.highlyRecommended,
      ...enhanced.partiallyRecommended,
      ...enhanced.exploreAndPrepare
    ].slice(0, limit);

    return combined.map(item => ({
      ...item.scholarship,
      score: item.score,
      matchedBy: item.matchedCriteria,
      daysUntilDeadline: item.daysUntilDeadline
    }));
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

/**
 * Get detailed match explanation for a specific scholarship
 */
export const getMatchExplanation = async (userId, scholarshipId) => {
  try {
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }

    const userDocuments = await UserDocument.find({
      userId,
      parsingStatus: 'completed'
    });

    const userData = getUserBestData(userDocuments);
    const matchResult = calculateWeightedScore(scholarship, userData, user.profile);

    return {
      scholarship: {
        id: scholarship._id,
        title: scholarship.title,
        country: scholarship.country,
        deadline: scholarship.deadline
      },
      ...matchResult
    };
  } catch (error) {
    logger.error('Get match explanation error:', error);
    throw error;
  }
};







import Scholarship from '../models/scholarship.model.js';
import UserDocument from '../models/userDocument.model.js';
import { logger } from '../utils/logger.js';

/**
 * Calculate match score for a scholarship based on user documents
 */
export const calculateMatchScore = (scholarship, userDocuments) => {
  let score = 0;
  let maxScore = 0;
  const criteriaMatched = [];
  const criteriaFailed = [];
  const reasons = [];
  
  // Get user's best document data
  const userData = getUserBestData(userDocuments);
  
  // 1. Degree Level Match (25 points)
  maxScore += 25;
  if (scholarship.level && userData.level) {
    if (scholarship.level === userData.level) {
      score += 25;
      criteriaMatched.push('Degree Level');
    } else {
      criteriaFailed.push('Degree Level');
      reasons.push(`Required: ${scholarship.level}, You have: ${userData.level}`);
    }
  } else if (!scholarship.level) {
    score += 25; // No requirement, full points
    criteriaMatched.push('Degree Level (No requirement)');
  }
  
  // 2. GPA Match (25 points)
  maxScore += 25;
  if (scholarship.eligibility?.minGPA) {
    const userGPA = userData.gpa || (userData.percentage ? userData.percentage / 25 : null);
    if (userGPA !== null) {
      if (userGPA >= scholarship.eligibility.minGPA) {
        score += 25;
        criteriaMatched.push('GPA');
      } else {
        criteriaFailed.push('GPA');
        reasons.push(`Required GPA: ${scholarship.eligibility.minGPA}, Your GPA: ${userGPA.toFixed(2)}`);
      }
    } else {
      criteriaFailed.push('GPA');
      reasons.push('GPA not found in your documents');
    }
  } else {
    score += 25; // No requirement, full points
    criteriaMatched.push('GPA (No requirement)');
  }
  
  // 3. English Score Match (20 points)
  maxScore += 20;
  if (scholarship.eligibility?.requiredEnglishScore || scholarship.eligibility?.requiredDocs?.includes('ielts')) {
    const requiredScore = scholarship.eligibility.requiredEnglishScore || 6.0; // Default IELTS requirement
    const userIELTS = userData.englishScore?.overall;
    
    if (userIELTS !== null && userIELTS !== undefined) {
      if (userIELTS >= requiredScore) {
        score += 20;
        criteriaMatched.push('English Score');
      } else {
        criteriaFailed.push('English Score');
        reasons.push(`Required IELTS: ${requiredScore}, Your IELTS: ${userIELTS}`);
      }
    } else {
      criteriaFailed.push('English Score');
      reasons.push('IELTS score not found in your documents');
    }
  } else {
    score += 20; // No requirement, full points
    criteriaMatched.push('English Score (No requirement)');
  }
  
  // 4. Field of Study Match (15 points)
  maxScore += 15;
  if (scholarship.fields && scholarship.fields.length > 0) {
    const userStream = userData.stream?.toLowerCase();
    const matchedField = scholarship.fields.some(field => 
      field.toLowerCase().includes(userStream) || 
      userStream?.includes(field.toLowerCase())
    );
    
    if (matchedField || !userStream) {
      score += 15;
      criteriaMatched.push('Field of Study');
    } else {
      criteriaFailed.push('Field of Study');
      reasons.push(`Required fields: ${scholarship.fields.join(', ')}, Your stream: ${userData.stream || 'Not specified'}`);
    }
  } else {
    score += 15; // No requirement, full points
    criteriaMatched.push('Field of Study (No requirement)');
  }
  
  // 5. Country Preference (10 points)
  maxScore += 10;
  if (scholarship.country && userData.preferredCountries) {
    if (userData.preferredCountries.includes(scholarship.country)) {
      score += 10;
      criteriaMatched.push('Country Preference');
    } else {
      // Still give some points if country matches user's profile
      score += 5;
    }
  } else {
    score += 10; // No preference, full points
  }
  
  // 6. Status and Verification (5 points)
  maxScore += 5;
  if (scholarship.status === 'open' && scholarship.verified) {
    score += 5;
    criteriaMatched.push('Scholarship Status');
  } else {
    criteriaFailed.push('Scholarship Status');
    reasons.push('Scholarship is not currently open or verified');
  }
  
  // Calculate final percentage
  const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const eligible = finalScore >= 70 && criteriaFailed.length === 0; // At least 70% match and no critical failures
  
  return {
    score: finalScore,
    eligible,
    criteriaMatched,
    criteriaFailed,
    reasons,
    details: {
      userGPA: userData.gpa,
      userIELTS: userData.englishScore?.overall,
      userLevel: userData.level,
      userStream: userData.stream
    }
  };
};

/**
 * Get best/most complete data from user documents
 */
const getUserBestData = (documents) => {
  const data = {
    level: null,
    gpa: null,
    percentage: null,
    stream: null,
    passingYear: null,
    englishScore: null,
    preferredCountries: []
  };
  
  // Find best transcript (highest GPA/percentage)
  let bestTranscript = null;
  let bestScore = 0;
  
  for (const doc of documents) {
    if (doc.parsedData) {
      // Get GPA or percentage
      const score = doc.parsedData.gpa || (doc.parsedData.percentage ? doc.parsedData.percentage / 25 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestTranscript = doc;
      }
    }
  }
  
  // Extract data from best transcript
  if (bestTranscript?.parsedData) {
    data.level = bestTranscript.parsedData.level || bestTranscript.type;
    data.gpa = bestTranscript.parsedData.gpa;
    data.percentage = bestTranscript.parsedData.percentage;
    data.stream = bestTranscript.parsedData.stream;
    data.passingYear = bestTranscript.parsedData.passingYear;
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
 * Match user documents against all scholarships
 */
export const matchScholarships = async (userId) => {
  try {
    // Get all user documents
    const userDocuments = await UserDocument.find({
      userId,
      parsingStatus: 'completed'
    }).sort({ uploadedAt: -1 });
    
    if (userDocuments.length === 0) {
      return {
        matches: [],
        message: 'No documents found. Please upload your documents first.'
      };
    }
    
    // Get all open and verified scholarships
    const scholarships = await Scholarship.find({
      status: { $in: ['open', 'upcoming'] },
      verified: true
    }).populate('college', 'name country');
    
    if (scholarships.length === 0) {
      return {
        matches: [],
        message: 'No scholarships available for matching.'
      };
    }
    
    // Calculate match scores for each scholarship
    const matches = scholarships.map(scholarship => {
      const matchResult = calculateMatchScore(scholarship, userDocuments);
      
      return {
        scholarshipId: scholarship._id,
        scholarship: {
          title: scholarship.title,
          country: scholarship.country,
          level: scholarship.level,
          deadline: scholarship.deadline,
          amount: scholarship.amount,
          university: scholarship.university,
          college: scholarship.college
        },
        ...matchResult
      };
    });
    
    // Sort by score (highest first) and eligibility
    matches.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      return b.score - a.score;
    });
    
    logger.info(`Matched ${matches.length} scholarships for user ${userId}`, {
      eligibleCount: matches.filter(m => m.eligible).length
    });
    
    return {
      matches,
      totalScholarships: matches.length,
      eligibleCount: matches.filter(m => m.eligible).length,
      userDocumentsCount: userDocuments.length
    };
  } catch (error) {
    logger.error('Scholarship matching error:', error);
    throw error;
  }
};



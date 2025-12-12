import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Resolve absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    const dataBuffer = await fs.readFile(absolutePath);
    const data = await pdfParse(dataBuffer);
    return {
      text: data.text,
      pages: data.numpages,
      confidence: 85 // PDF parsing is generally reliable
    };
  } catch (error) {
    logger.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from image using OCR
 */
const extractTextFromImage = async (filePath) => {
  let worker;
  try {
    // Resolve absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    worker = await createWorker('eng');
    const { data } = await worker.recognize(absolutePath);
    
    await worker.terminate();
    
    return {
      text: data.text,
      confidence: Math.round(data.confidence || 70)
    };
  } catch (error) {
    if (worker) {
      await worker.terminate();
    }
    logger.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Extract GPA from text
 */
const extractGPA = (text) => {
  // Common GPA patterns: 3.5/4.0, 3.5 GPA, GPA: 3.5, etc.
  const gpaPatterns = [
    /(?:GPA|CGPA|Grade Point Average)[\s:]*([0-9]+\.[0-9]+)\s*(?:\/|\s*out\s*of)?\s*4\.?0?/i,
    /([0-9]+\.[0-9]+)\s*(?:\/|\s*out\s*of)?\s*4\.?0?\s*(?:GPA|CGPA)/i,
    /(?:GPA|CGPA)[\s:]*([0-9]+\.[0-9]+)/i
  ];
  
  for (const pattern of gpaPatterns) {
    const match = text.match(pattern);
    if (match) {
      const gpa = parseFloat(match[1]);
      if (gpa >= 0 && gpa <= 4.0) {
        return gpa;
      }
    }
  }
  
  return null;
};

/**
 * Extract percentage from text
 */
const extractPercentage = (text) => {
  // Common percentage patterns: 85%, 85 percent, etc.
  const percentagePatterns = [
    /([0-9]+\.?[0-9]*)\s*%/,
    /([0-9]+\.?[0-9]*)\s*percent/i,
    /Percentage[:\s]+([0-9]+\.?[0-9]*)/
  ];
  
  for (const pattern of percentagePatterns) {
    const match = text.match(pattern);
    if (match) {
      const percentage = parseFloat(match[1]);
      if (percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
  }
  
  return null;
};

/**
 * Extract degree level from text
 */
const extractLevel = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('+2') || lowerText.includes('12th') || lowerText.includes('higher secondary')) {
    return '+2';
  }
  if (lowerText.includes('bachelor') || lowerText.includes('bsc') || lowerText.includes('ba ') || lowerText.includes('b.tech')) {
    return 'Bachelor';
  }
  if (lowerText.includes('master') || lowerText.includes('msc') || lowerText.includes('ma ') || lowerText.includes('m.tech')) {
    return 'Master';
  }
  if (lowerText.includes('phd') || lowerText.includes('ph.d') || lowerText.includes('doctorate')) {
    return 'PhD';
  }
  
  return null;
};

/**
 * Extract stream/field from text
 */
const extractStream = (text) => {
  const lowerText = text.toLowerCase();
  
  const streams = {
    'science': ['science', 'physics', 'chemistry', 'biology', 'mathematics', 'math'],
    'management': ['management', 'business', 'commerce', 'accounting', 'finance'],
    'arts': ['arts', 'humanities', 'english', 'sociology', 'psychology'],
    'engineering': ['engineering', 'computer', 'electrical', 'mechanical', 'civil'],
    'medical': ['medical', 'medicine', 'mbbs', 'nursing'],
    'law': ['law', 'legal', 'llb']
  };
  
  for (const [stream, keywords] of Object.entries(streams)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return stream.charAt(0).toUpperCase() + stream.slice(1);
    }
  }
  
  return null;
};

/**
 * Extract passing year from text
 */
const extractPassingYear = (text) => {
  // Look for years like 2020, 2021, 2022, etc.
  const yearPattern = /(?:year|passed|completed|graduated)[:\s]*([0-9]{4})/i;
  const match = text.match(yearPattern);
  
  if (match) {
    const year = parseInt(match[1]);
    const currentYear = new Date().getFullYear();
    if (year >= 2000 && year <= currentYear + 1) {
      return year;
    }
  }
  
  // Also check for standalone 4-digit years
  const standaloneYearPattern = /\b(20[0-9]{2})\b/;
  const standaloneMatch = text.match(standaloneYearPattern);
  if (standaloneMatch) {
    const year = parseInt(standaloneMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year >= 2000 && year <= currentYear + 1) {
      return year;
    }
  }
  
  return null;
};

/**
 * Extract IELTS scores from text
 */
const extractIELTSScores = (text) => {
  const lowerText = text.toLowerCase();
  
  // IELTS score patterns
  const patterns = {
    listening: /(?:listening|l)[\s:]*([0-9]\.?[0-9]*)/i,
    reading: /(?:reading|r)[\s:]*([0-9]\.?[0-9]*)/i,
    writing: /(?:writing|w)[\s:]*([0-9]\.?[0-9]*)/i,
    speaking: /(?:speaking|s)[\s:]*([0-9]\.?[0-9]*)/i,
    overall: /(?:overall|total|band|score)[\s:]*([0-9]\.?[0-9]*)/i
  };
  
  const scores = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = lowerText.match(pattern);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 0 && score <= 9) {
        scores[key] = score;
      }
    }
  }
  
  // If overall not found, calculate average
  if (!scores.overall && (scores.listening || scores.reading || scores.writing || scores.speaking)) {
    const validScores = [scores.listening, scores.reading, scores.writing, scores.speaking].filter(s => s !== undefined);
    if (validScores.length > 0) {
      scores.overall = parseFloat((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1));
    }
  }
  
  return Object.keys(scores).length > 0 ? scores : null;
};

/**
 * Parse document based on type
 */
export const parseDocument = async (filePath, mimeType, documentType) => {
  try {
    let extractionResult;
    
    // Extract text based on file type
    if (mimeType === 'application/pdf') {
      extractionResult = await extractTextFromPDF(filePath);
    } else if (mimeType.startsWith('image/')) {
      extractionResult = await extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file type for parsing');
    }
    
    const text = extractionResult.text;
    
    // Parse based on document type
    const parsedData = {
      rawText: text.substring(0, 5000), // Store first 5000 chars
      extractionConfidence: extractionResult.confidence
    };
    
    // Extract common fields
    parsedData.level = extractLevel(text);
    parsedData.gpa = extractGPA(text);
    parsedData.percentage = extractPercentage(text);
    parsedData.stream = extractStream(text);
    parsedData.passingYear = extractPassingYear(text);
    
    // Extract IELTS scores if it's an IELTS document
    if (documentType === 'ielts' || text.toLowerCase().includes('ielts')) {
      const ieltsScores = extractIELTSScores(text);
      if (ieltsScores) {
        parsedData.englishScore = ieltsScores;
      }
    }
    
    // Try to extract degree name
    const degreeMatch = text.match(/(?:degree|program|course)[:\s]+([A-Z][a-zA-Z\s]+)/i);
    if (degreeMatch) {
      parsedData.degreeName = degreeMatch[1].trim();
    }
    
    logger.info('Document parsed successfully', {
      level: parsedData.level,
      gpa: parsedData.gpa,
      hasIELTS: !!parsedData.englishScore
    });
    
    return parsedData;
  } catch (error) {
    logger.error('Document parsing error:', error);
    throw error;
  }
};


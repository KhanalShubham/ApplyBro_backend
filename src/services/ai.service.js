import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger.js';

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

/**
 * Forward a document to the AI engine for indexing
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original filename
 * @returns {Promise<Object>} - The AI API response
 */
export const indexDocumentWithAI = async (fileBuffer, fileName) => {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/pdf', // Assuming PDF for indexing
    });

    const response = await axios.post(`${AI_API_URL}/upload_scholarship`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 seconds timeout for processing
    });

    logger.info(`Document indexed with AI successfully: ${fileName}`);
    return response.data;
  } catch (error) {
    logger.error('AI document indexing failed:', error.message);
    // Don't throw, just log. We don't want to break the main upload flow if AI is down.
    return { error: error.message };
  }
};

/**
 * Ask a question to the AI engine
 * @param {string} question - The user's question
 * @returns {Promise<string>} - The AI generated answer
 */
export const askAI = async (question) => {
  try {
    const formData = new FormData();
    formData.append('question', question);

    const response = await axios.post(`${AI_API_URL}/ask`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data.answer;
  } catch (error) {
    logger.error('AI question failed:', error.message);
    return "I'm sorry, I'm having trouble connecting to my AI engine right now. Please try again later.";
  }
};

/**
 * Moderate text using the AI engine
 * @param {string} text - The text to moderate
 * @returns {Promise<Object>} - Moderation results { is_toxic, score }
 */
export const moderateTextWithAI = async (text) => {
  try {
    const formData = new FormData();
    formData.append('post_text', text);

    const response = await axios.post(`${AI_API_URL}/moderate`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    logger.error('AI moderation failed:', error.message);
    return { is_toxic: false, score: 0, error: error.message };
  }
};

/**
 * Use AI to extract structured metadata from document text
 * @param {string} text - The extracted text from the document
 * @returns {Promise<Object>} - The extracted metadata
 */
export const extractMetadataWithAI = async (text) => {
  try {
    const formData = new FormData();
    formData.append('text', text);

    const response = await axios.post(`${AI_API_URL}/parse_metadata`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    if (response.data.status === 'success') {
      return response.data.data;
    }
    return null;
  } catch (error) {
    logger.error('AI metadata extraction failed:', error.message);
    return null;
  }
};

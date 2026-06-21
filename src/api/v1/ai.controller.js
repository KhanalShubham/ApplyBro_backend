import { askAI, moderateTextWithAI } from '../../services/ai.service.js';
import { logger } from '../../utils/logger.js';

/**
 * POST /api/v1/ai/ask
 * Ask a question to the AI engine
 */
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        status: 'error',
        message: 'Question is required'
      });
    }

    const answer = await askAI(question);

    res.json({
      status: 'success',
      data: { answer }
    });
  } catch (error) {
    logger.error('AI ask endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get answer from AI'
    });
  }
};

/**
 * POST /api/v1/ai/moderate
 * Moderate text using AI
 */
export const moderateText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text is required'
      });
    }

    const result = await moderateTextWithAI(text);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('AI moderation endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to moderate text'
    });
  }
};

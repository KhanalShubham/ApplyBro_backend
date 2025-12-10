import User from '../../models/user.model.js';
import AdminAction from '../../models/adminAction.model.js';
import { 
  hashPassword, 
  comparePassword, 
  signAccessToken, 
  signRefreshToken,
  verifyRefreshToken,
  generateEmailVerificationToken
} from '../../services/auth.service.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { logger } from '../../utils/logger.js';

/**
 * POST /api/v1/auth/signup
 * Register a new user
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, country } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();
    
    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      profile: {
        country
      },
      emailVerificationToken
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(user, emailVerificationToken);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Continue anyway - user can resend later
    }
    
    // Generate tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Save refresh token to user
    await User.findByIdAndUpdate(user._id, { refreshToken });
    
    logger.info(`New user registered: ${user.email}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create account'
    });
  }
};

/**
 * POST /api/v1/auth/login
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with password hash
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Generate tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Save refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken });
    
    logger.info(`User logged in: ${user.email}`);
    
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Login failed'
    });
  }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user and verify refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    
    // Update refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
    
    res.json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      status: 'error',
      message: error.message || 'Invalid or expired refresh token'
    });
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout user (clear refresh token)
 */
export const logout = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      logger.info(`User logged out: ${userId}`);
    }
    
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('bookmarks', 'title country level deadline');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile'
    });
  }
};







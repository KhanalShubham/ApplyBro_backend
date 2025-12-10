import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger.js';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@applybro.com';
const APP_NAME = process.env.APP_NAME || 'ApplyBro';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Initialize SendGrid (only if API key is provided)
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Send email using SendGrid (production) or log (development)
 */
const sendEmail = async (to, subject, html, text) => {
  if (!SENDGRID_API_KEY) {
    // Development mode - just log
    logger.info('Email (dev mode):', { to, subject });
    logger.debug('Email content:', { html, text });
    return { success: true, dev: true };
  }
  
  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html
    };
    
    await sgMail.send(msg);
    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  
  const subject = `Verify your ${APP_NAME} account`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to ${APP_NAME}!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007BFF; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `Welcome to ${APP_NAME}! Please verify your email by visiting: ${verificationUrl}`;
  
  return await sendEmail(user.email, subject, html, text);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  
  const subject = `Reset your ${APP_NAME} password`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #007BFF; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `Reset your password by visiting: ${resetUrl}`;
  
  return await sendEmail(user.email, subject, html, text);
};

/**
 * Send deadline reminder email
 */
export const sendDeadlineReminderEmail = async (user, scholarship, daysLeft) => {
  const subject = `⏰ Reminder: ${scholarship.title} deadline in ${daysLeft} days`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>⏰ Scholarship Deadline Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>The scholarship you bookmarked is approaching its deadline:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>${scholarship.title}</h3>
        <p><strong>Country:</strong> ${scholarship.country}</p>
        <p><strong>Level:</strong> ${scholarship.level}</p>
        <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toLocaleDateString()}</p>
        <p><strong>Days remaining:</strong> ${daysLeft} days</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/scholarships/${scholarship._id}" 
           style="background-color: #007BFF; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Scholarship
        </a>
      </div>
      <p>Don't miss out on this opportunity!</p>
      <br>
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `Reminder: ${scholarship.title} deadline is in ${daysLeft} days. Visit ${APP_URL}/scholarships/${scholarship._id}`;
  
  return await sendEmail(user.email, subject, html, text);
};

/**
 * Send post moderation notification
 */
export const sendPostModerationEmail = async (user, post, status, adminNote = '') => {
  const subject = status === 'approved' 
    ? `✅ Your post "${post.title}" has been approved`
    : `❌ Your post "${post.title}" has been declined`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${status === 'approved' ? '✅ Post Approved' : '❌ Post Declined'}</h2>
      <p>Hi ${user.name},</p>
      <p>Your post <strong>"${post.title}"</strong> has been ${status}.</p>
      ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ''}
      ${status === 'approved' 
        ? `<div style="text-align: center; margin: 30px 0;">
             <a href="${APP_URL}/community/posts/${post._id}" 
                style="background-color: #007BFF; color: white; padding: 12px 30px; 
                       text-decoration: none; border-radius: 5px; display: inline-block;">
               View Post
             </a>
           </div>`
        : ''
      }
      <br>
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `Your post "${post.title}" has been ${status}. ${adminNote ? `Note: ${adminNote}` : ''}`;
  
  return await sendEmail(user.email, subject, html, text);
};







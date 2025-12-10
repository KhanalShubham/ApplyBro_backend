import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import User from '../models/user.model.js';
import Scholarship from '../models/scholarship.model.js';
import { sendDeadlineReminderEmail } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

// Only attempt to connect to Redis if a REDIS_URL is provided or we're in production.
const REDIS_URL = process.env.REDIS_URL || (process.env.NODE_ENV === 'production' ? 'redis://localhost:6379' : undefined);

// Initialize Redis connection (only if Redis URL is provided)
let connection = null;
let reminderQueue = null;
let dailyDigestQueue = null;

try {
  if (REDIS_URL) {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });

    // Create queues
    reminderQueue = new Queue('deadline-reminders', { connection });
    dailyDigestQueue = new Queue('daily-digest', { connection });
  }
} catch (error) {
  logger.warn('Redis not available. Background jobs will be disabled:', error.message);
}

/**
 * Create a reminder job for a scholarship deadline
 */
export const scheduleReminder = async (userId, scholarshipId, daysBefore = 7) => {
  if (!reminderQueue) {
    logger.warn('Reminder queue not available. Skipping reminder scheduling.');
    return;
  }
  
  try {
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship) {
      logger.error(`Scholarship not found: ${scholarshipId}`);
      return;
    }
    
    // Calculate when to send reminder (daysBefore days before deadline)
    const reminderDate = new Date(scholarship.deadline);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    
    // Don't schedule if reminder date is in the past
    if (reminderDate < new Date()) {
      return;
    }
    
    await reminderQueue.add(
      'send-reminder',
      {
        userId,
        scholarshipId,
        daysBefore
      },
      {
        delay: reminderDate.getTime() - Date.now(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
    
    logger.info(`Reminder scheduled for user ${userId}, scholarship ${scholarshipId}, days: ${daysBefore}`);
  } catch (error) {
    logger.error('Error scheduling reminder:', error);
  }
};

/**
 * Worker to process reminder jobs
 */
export const startWorker = () => {
  if (!connection || !reminderQueue) {
    logger.warn('Redis not available. Background worker disabled.');
    return null;
  }
  
  const worker = new Worker(
    'deadline-reminders',
    async (job) => {
      const { userId, scholarshipId, daysBefore } = job.data;
      
      try {
        const user = await User.findById(userId);
        const scholarship = await Scholarship.findById(scholarshipId);
        
        if (!user || !scholarship) {
          logger.error(`User or scholarship not found: userId=${userId}, scholarshipId=${scholarshipId}`);
          return;
        }
        
        // Check if user still has this bookmarked
        const isBookmarked = user.bookmarks.some(
          bookmark => bookmark.toString() === scholarshipId
        );
        
        if (!isBookmarked) {
          logger.info(`User ${userId} no longer has scholarship ${scholarshipId} bookmarked. Skipping reminder.`);
          return;
        }
        
        // Send reminder email
        await sendDeadlineReminderEmail(user, scholarship, daysBefore);
        
        logger.info(`Reminder sent to ${user.email} for scholarship ${scholarship.title}`);
      } catch (error) {
        logger.error('Error processing reminder job:', error);
        throw error; // Retry
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: {
        count: 100,
        age: 24 * 3600 // 24 hours
      },
      removeOnFail: {
        count: 1000
      }
    }
  );
  
  // Worker event handlers
  worker.on('completed', (job) => {
    logger.info(`Reminder job ${job.id} completed`);
  });
  
  worker.on('failed', (job, err) => {
    logger.error(`Reminder job ${job?.id} failed:`, err);
  });
  
  logger.info('✅ Reminder worker started');
  
  // Daily job to scan and schedule reminders
  const scheduleDailyReminderScan = async () => {
    try {
      // Scan all users with bookmarked scholarships
      const users = await User.find({
        bookmarks: { $exists: true, $ne: [] }
      }).populate('bookmarks');
      
      for (const user of users) {
        for (const scholarshipId of user.bookmarks) {
          const scholarship = await Scholarship.findById(scholarshipId);
          
          if (!scholarship) continue;
          
          // Calculate days until deadline
          const daysUntilDeadline = Math.floor(
            (scholarship.deadline - new Date()) / (1000 * 60 * 60 * 24)
          );
          
          // Schedule reminders at 30, 14, 7, 3, and 1 days before
          const reminderDays = [30, 14, 7, 3, 1];
          
          for (const days of reminderDays) {
            if (daysUntilDeadline === days) {
              await scheduleReminder(user._id, scholarshipId, days);
            }
          }
        }
      }
      
      logger.info('Daily reminder scan completed');
    } catch (error) {
      logger.error('Error in daily reminder scan:', error);
    }
  };
  
  // Run daily scan every day at 9 AM
  const scheduleDailyJob = () => {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const msUntilNextRun = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      scheduleDailyReminderScan();
      // Schedule next run for 24 hours later
      setInterval(scheduleDailyReminderScan, 24 * 60 * 60 * 1000);
    }, msUntilNextRun);
    
    logger.info(`Daily reminder scan scheduled for ${nextRun.toISOString()}`);
  };
  
  scheduleDailyJob();
  
  return worker;
};

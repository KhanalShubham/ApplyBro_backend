import express from 'express';
import { calendarController } from './calendar.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', calendarController.getCalendarEvents);
router.post('/', calendarController.createEvent);
router.delete('/:id', calendarController.deleteEvent);

export default router;

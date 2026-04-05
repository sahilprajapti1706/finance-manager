import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get('/', NotificationController.getMyNotifications);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all user notifications as read
 * @access  Private
 */
router.patch('/read-all', NotificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark specific notification as read
 * @access  Private
 */
router.patch('/:id/read', NotificationController.markAsRead);

export default router;

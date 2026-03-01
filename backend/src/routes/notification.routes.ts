import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get(
  '/',
  [
    query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
    query('type')
      .optional()
      .isIn(['mention', 'assigned', 'status_change', 'comment', 'issue_closed', 'issue_reopened', 'reminder', 'system'])
      .withMessage('Invalid notification type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate,
  ],
  NotificationController.getNotifications
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', NotificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', NotificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read', NotificationController.deleteAllRead);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get a single notification
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').isString().notEmpty().withMessage('Notification ID is required'), validate],
  NotificationController.getNotificationById
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  [param('id').isString().notEmpty().withMessage('Notification ID is required'), validate],
  NotificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').isString().notEmpty().withMessage('Notification ID is required'), validate],
  NotificationController.deleteNotification
);

export default router;

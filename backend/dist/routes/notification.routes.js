"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get('/', [
    (0, express_validator_1.query)('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['mention', 'assigned', 'status_change', 'comment', 'issue_closed', 'issue_reopened', 'reminder', 'system'])
        .withMessage('Invalid notification type'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validation_middleware_1.validate,
], notification_controller_1.NotificationController.getNotifications);
/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', notification_controller_1.NotificationController.getUnreadCount);
/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', notification_controller_1.NotificationController.markAllAsRead);
/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read', notification_controller_1.NotificationController.deleteAllRead);
/**
 * @route   GET /api/notifications/:id
 * @desc    Get a single notification
 * @access  Private
 */
router.get('/:id', [(0, express_validator_1.param)('id').isString().notEmpty().withMessage('Notification ID is required'), validation_middleware_1.validate], notification_controller_1.NotificationController.getNotificationById);
/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/:id/read', [(0, express_validator_1.param)('id').isString().notEmpty().withMessage('Notification ID is required'), validation_middleware_1.validate], notification_controller_1.NotificationController.markAsRead);
/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', [(0, express_validator_1.param)('id').isString().notEmpty().withMessage('Notification ID is required'), validation_middleware_1.validate], notification_controller_1.NotificationController.deleteNotification);
exports.default = router;

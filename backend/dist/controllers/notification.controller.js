"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         userId:
 *           type: string
 *           example: clx987xyz654
 *         type:
 *           type: string
 *           enum: [mention, assigned, status_change, comment, issue_closed, issue_reopened, reminder, system]
 *           example: assigned
 *         title:
 *           type: string
 *           example: You were assigned to an issue
 *         message:
 *           type: string
 *           example: You were assigned to "Fix login bug" in owner/repo
 *         link:
 *           type: string
 *           nullable: true
 *           example: /issues/clx123abc456
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 */
class NotificationController {
    /**
     * @swagger
     * /api/notifications:
     *   get:
     *     summary: Get notifications for the authenticated user
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: isRead
     *         schema:
     *           type: boolean
     *         description: Filter by read status
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [mention, assigned, status_change, comment, issue_closed, issue_reopened, reminder, system]
     *         description: Filter by notification type
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *     responses:
     *       200:
     *         description: Notifications fetched successfully
     *       401:
     *         description: Unauthorized
     */
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 20,
                type: req.query.type,
            };
            // Parse isRead boolean from query string
            if (req.query.isRead !== undefined) {
                filters.isRead = req.query.isRead === 'true';
            }
            const result = await notification_service_1.NotificationService.getNotifications(userId, filters);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
        }
    }
    /**
     * @swagger
     * /api/notifications/unread-count:
     *   get:
     *     summary: Get unread notification count
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Returns unread notification count
     */
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await notification_service_1.NotificationService.getUnreadCount(userId);
            res.status(200).json({
                success: true,
                data: { unreadCount: count },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
        }
    }
    /**
     * @swagger
     * /api/notifications/{id}:
     *   get:
     *     summary: Get a single notification by ID
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Notification found
     *       404:
     *         description: Notification not found
     */
    static async getNotificationById(req, res) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const notification = await notification_service_1.NotificationService.getNotificationById(userId, id);
            if (!notification) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }
            res.status(200).json({ success: true, data: notification });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch notification' });
        }
    }
    /**
     * @swagger
     * /api/notifications/{id}/read:
     *   patch:
     *     summary: Mark a notification as read
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Notification marked as read
     *       404:
     *         description: Notification not found
     */
    static async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const notification = await notification_service_1.NotificationService.markAsRead(userId, id);
            if (!notification) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }
            res.status(200).json({ success: true, data: notification });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
        }
    }
    /**
     * @swagger
     * /api/notifications/read-all:
     *   patch:
     *     summary: Mark all notifications as read
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: All notifications marked as read
     */
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await notification_service_1.NotificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: `${result.count} notifications marked as read`,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
        }
    }
    /**
     * @swagger
     * /api/notifications/{id}:
     *   delete:
     *     summary: Delete a notification
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Notification deleted
     *       404:
     *         description: Notification not found
     */
    static async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const deleted = await notification_service_1.NotificationService.deleteNotification(userId, id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Notification deleted' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to delete notification' });
        }
    }
    /**
     * @swagger
     * /api/notifications/read:
     *   delete:
     *     summary: Delete all read notifications
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: All read notifications deleted
     */
    static async deleteAllRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await notification_service_1.NotificationService.deleteAllRead(userId);
            res.status(200).json({
                success: true,
                message: `${result.count} read notifications deleted`,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to delete read notifications' });
        }
    }
}
exports.NotificationController = NotificationController;

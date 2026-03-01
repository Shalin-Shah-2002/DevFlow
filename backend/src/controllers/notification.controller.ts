import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { NotificationFilters } from '../models/notification.model';

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

export class NotificationController {
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
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const filters: NotificationFilters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        type: req.query.type as any,
      };

      // Parse isRead boolean from query string
      if (req.query.isRead !== undefined) {
        filters.isRead = req.query.isRead === 'true';
      }

      const result = await NotificationService.getNotifications(userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
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
  static async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const notification = await NotificationService.getNotificationById(userId, id);

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
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
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const notification = await NotificationService.markAsRead(userId, id);

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
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
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read`,
        data: result,
      });
    } catch (error) {
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
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const deleted = await NotificationService.deleteNotification(userId, id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
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
  static async deleteAllRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await NotificationService.deleteAllRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} read notifications deleted`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete read notifications' });
    }
  }
}

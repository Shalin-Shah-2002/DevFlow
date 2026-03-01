import prisma from '../config/prisma';
import {
  CreateNotificationRequest,
  NotificationFilters,
  NotificationListResponse,
  NotificationResponse,
  toNotificationResponse,
} from '../models/notification.model';

export class NotificationService {
  /**
   * Get notifications for a user with optional filters
   */
  static async getNotifications(
    userId: string,
    filters: NotificationFilters
  ): Promise<NotificationListResponse> {
    const { isRead, type, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: notifications.map(toNotificationResponse),
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single notification by ID (must belong to user)
   */
  static async getNotificationById(
    userId: string,
    notificationId: string
  ): Promise<NotificationResponse | null> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    return notification ? toNotificationResponse(notification) : null;
  }

  /**
   * Create a new notification (called internally by other services)
   */
  static async createNotification(
    data: CreateNotificationRequest
  ): Promise<NotificationResponse> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link ?? null,
        isRead: false,
      },
    });

    return toNotificationResponse(notification);
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<NotificationResponse | null> {
    // Ensure it belongs to the user
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) return null;

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return toNotificationResponse(updated);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  /**
   * Delete a single notification
   */
  static async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) return false;

    await prisma.notification.delete({ where: { id: notificationId } });
    return true;
  }

  /**
   * Delete all read notifications for a user
   */
  static async deleteAllRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    return { count: result.count };
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}

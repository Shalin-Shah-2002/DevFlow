"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const notification_model_1 = require("../models/notification.model");
class NotificationService {
    /**
     * Get notifications for a user with optional filters
     */
    static async getNotifications(userId, filters) {
        const { isRead, type, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (typeof isRead === 'boolean') {
            where.isRead = isRead;
        }
        if (type) {
            where.type = type;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            prisma_1.default.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.notification.count({ where }),
            prisma_1.default.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            notifications: notifications.map(notification_model_1.toNotificationResponse),
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
    static async getNotificationById(userId, notificationId) {
        const notification = await prisma_1.default.notification.findFirst({
            where: { id: notificationId, userId },
        });
        return notification ? (0, notification_model_1.toNotificationResponse)(notification) : null;
    }
    /**
     * Create a new notification (called internally by other services)
     */
    static async createNotification(data) {
        const notification = await prisma_1.default.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link ?? null,
                isRead: false,
            },
        });
        return (0, notification_model_1.toNotificationResponse)(notification);
    }
    /**
     * Mark a single notification as read
     */
    static async markAsRead(userId, notificationId) {
        // Ensure it belongs to the user
        const existing = await prisma_1.default.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!existing)
            return null;
        const updated = await prisma_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        return (0, notification_model_1.toNotificationResponse)(updated);
    }
    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        const result = await prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { count: result.count };
    }
    /**
     * Delete a single notification
     */
    static async deleteNotification(userId, notificationId) {
        const existing = await prisma_1.default.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!existing)
            return false;
        await prisma_1.default.notification.delete({ where: { id: notificationId } });
        return true;
    }
    /**
     * Delete all read notifications for a user
     */
    static async deleteAllRead(userId) {
        const result = await prisma_1.default.notification.deleteMany({
            where: { userId, isRead: true },
        });
        return { count: result.count };
    }
    /**
     * Get unread notification count
     */
    static async getUnreadCount(userId) {
        return prisma_1.default.notification.count({ where: { userId, isRead: false } });
    }
}
exports.NotificationService = NotificationService;

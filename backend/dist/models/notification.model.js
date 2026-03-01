"use strict";
// ─── Notification Model Types ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNotificationResponse = toNotificationResponse;
function toNotificationResponse(n) {
    return {
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link ?? null,
        isRead: n.isRead,
        createdAt: n.createdAt,
    };
}

// ─── Notification Model Types ─────────────────────────────────────────────

export type NotificationType =
  | 'mention'
  | 'assigned'
  | 'status_change'
  | 'comment'
  | 'issue_closed'
  | 'issue_reopened'
  | 'reminder'
  | 'system';

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function toNotificationResponse(n: any): NotificationResponse {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    link: n.link ?? null,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
};

type NotificationsResponse = {
  success: boolean;
  data: {
    notifications: NotificationItem[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

const request = async <T>(
  token: string,
  path: string,
  method: 'GET' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; message?: string; error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Request failed (${response.status})`);
  }

  if (!payload) {
    throw new Error('Empty API response');
  }

  return payload;
};

const toDate = (value?: string) => (value ? new Date(value).toLocaleString() : '');

export const getNotifications = async (token: string, page = 1, limit = 20): Promise<NotificationsResponse['data']> => {
  const response = await request<NotificationsResponse>(
    token,
    `/notifications?page=${page}&limit=${limit}`,
    'GET'
  );

  return {
    ...response.data,
    notifications: (response.data.notifications || []).map((item) => ({
      ...item,
      createdAt: toDate(item.createdAt)
    }))
  };
};

export const getUnreadCount = async (token: string): Promise<number> => {
  const response = await request<{ success: boolean; data: { unreadCount: number } }>(
    token,
    '/notifications/unread-count',
    'GET'
  );
  return response.data.unreadCount || 0;
};

export const markNotificationAsRead = async (token: string, id: string): Promise<void> => {
  await request<{ success: boolean }>(token, `/notifications/${id}/read`, 'PATCH');
};

export const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  await request<{ success: boolean }>(token, '/notifications/read-all', 'PATCH');
};

export const deleteNotification = async (token: string, id: string): Promise<void> => {
  await request<{ success: boolean }>(token, `/notifications/${id}`, 'DELETE');
};

export const deleteReadNotifications = async (token: string): Promise<void> => {
  await request<{ success: boolean }>(token, '/notifications/read', 'DELETE');
};

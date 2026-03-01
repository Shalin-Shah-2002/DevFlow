import { useCallback, useEffect, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  deleteNotification,
  deleteReadNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../../controllers/notifications.controller';

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationsPage = () => {
  const { state } = useAuth();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    try {
      const result = await getNotifications(state.token, 1, 50);
      setRows(result.notifications as NotificationRow[]);
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [state.token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onMarkRead = async (id: string) => {
    if (!state.token) {
      return;
    }

    setBusy(`read-${id}`);
    try {
      await markNotificationAsRead(state.token, id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to mark notification as read.');
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!state.token) {
      return;
    }

    setBusy(`delete-${id}`);
    try {
      await deleteNotification(state.token, id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete notification.');
    } finally {
      setBusy(null);
    }
  };

  const onMarkAll = async () => {
    if (!state.token) {
      return;
    }

    setBusy('mark-all');
    try {
      await markAllNotificationsAsRead(state.token);
      await load();
      setMessage('All notifications marked as read.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to mark all as read.');
    } finally {
      setBusy(null);
    }
  };

  const onDeleteRead = async () => {
    if (!state.token) {
      return;
    }

    setBusy('delete-read');
    try {
      await deleteReadNotifications(state.token);
      await load();
      setMessage('Read notifications removed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete read notifications.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="dv3-page notifications-page">
      <DashboardSidebar authState={state} unreadCount={unreadCount} />

      <main className="notifications-main">
        <header className="notifications-head">
          <div>
            <h2>Notifications</h2>
            <p>Manage notification inbox and unread state.</p>
          </div>
          <div className="notifications-actions">
            <button type="button" onClick={() => void onMarkAll()} disabled={busy === 'mark-all'}>
              Mark All Read
            </button>
            <button type="button" className="danger" onClick={() => void onDeleteRead()} disabled={busy === 'delete-read'}>
              Delete Read
            </button>
          </div>
        </header>

        {message && <div className="notifications-message">{message}</div>}

        {loading && <div className="notifications-info">Loading notifications...</div>}
        {!loading && rows.length === 0 && <div className="notifications-info">No notifications found.</div>}

        {!loading && rows.length > 0 && (
          <section className="notifications-list">
            {rows.map((item) => (
              <article key={item.id} className={`notification-item ${item.isRead ? 'read' : 'unread'}`}>
                <div>
                  <h3>{item.title || item.type}</h3>
                  <p>{item.message}</p>
                  <small>{item.createdAt}</small>
                </div>
                <div className="notification-actions">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => void onMarkRead(item.id)}
                      disabled={busy === `read-${item.id}`}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void onDelete(item.id)}
                    disabled={busy === `delete-${item.id}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

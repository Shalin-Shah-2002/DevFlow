import { useEffect, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import { getActivityLog } from '../../controllers/ops.controller';

type ActivityItem = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
};

export const ActivityLogPage = () => {
  const { state } = useAuth();
  const [rows, setRows] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getActivityLog(state.token)
      .then((response) => {
        setRows((response.data || []) as ActivityItem[]);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load activity log.');
      })
      .finally(() => setLoading(false));
  }, [state.token]);

  return (
    <div className="dv3-page activity-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="activity-main">
        <header className="activity-head">
          <div>
            <h2>Activity Log</h2>
            <p>Review your recent actions across issues, comments, and milestones.</p>
          </div>
        </header>

        {loading && <div className="activity-info">Loading activity...</div>}
        {message && <div className="activity-message">{message}</div>}

        {!loading && rows.length === 0 && <div className="activity-info">No activity found.</div>}

        {!loading && rows.length > 0 && (
          <section className="activity-list">
            {rows.map((item) => (
              <article key={item.id}>
                <h4>{item.type.replace(/_/g, ' ')}</h4>
                <p>{item.description}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

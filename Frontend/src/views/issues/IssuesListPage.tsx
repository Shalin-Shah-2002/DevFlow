import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIssuesList } from '../../controllers/issues.controller';
import type { IssueListItem } from '../../models/issues.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';

export const IssuesListPage = () => {
  const { state } = useAuth();
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getIssuesList(state.token, {
      limit: 20,
      page: 1,
      state: filterState,
      search,
      sort: 'updated',
      order: 'desc'
    })
      .then((response) => {
        setError(null);
        setIssues(response.data || []);
      })
      .catch(() => {
        setError('Failed to load issues.');
      })
      .finally(() => setLoading(false));
  }, [state.token, filterState, search]);

  const stats = useMemo(() => {
    const open = issues.filter((item) => item.state === 'open').length;
    const closed = issues.filter((item) => item.state === 'closed').length;

    return {
      total: issues.length,
      open,
      closed
    };
  }, [issues]);

  return (
    <div className="dv3-page issues-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="issues-main">
        <header className="issues-head">
          <div>
            <h2>Issues Management List</h2>
            <p>Browse, filter, and open issue details from your connected repositories.</p>
          </div>

          <div className="issues-head-actions">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, number, or label..."
            />
            <select
              value={filterState}
              onChange={(event) => setFilterState(event.target.value as 'all' | 'open' | 'closed')}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </header>

        <section className="issues-summary">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </article>
          <article>
            <span>Closed</span>
            <strong>{stats.closed}</strong>
          </article>
        </section>

        <section className="issues-table-wrap">
          {loading && <div className="issues-info">Loading issues...</div>}
          {error && <div className="issues-info issues-error">{error}</div>}
          {!loading && !error && issues.length === 0 && <div className="issues-info">No issues found.</div>}

          {!loading && !error && issues.length > 0 && (
            <motion.div className="issues-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="issues-row issues-row-head">
                <span>Issue</span>
                <span>Repository</span>
                <span>State</span>
                <span>Priority</span>
                <span>Comments</span>
                <span>Action</span>
              </div>

              {issues.map((issue) => (
                <div key={issue.id} className="issues-row">
                  <div>
                    <strong>
                      #{issue.number} {issue.title}
                    </strong>
                    <small>
                      {issue.labels.slice(0, 2).map((label) => label.name).join(' · ') || 'No labels'}
                    </small>
                  </div>
                  <span>{issue.repository.fullName}</span>
                  <span className={issue.state === 'open' ? 'badge-open' : 'badge-closed'}>{issue.state}</span>
                  <span>{issue.priority || '—'}</span>
                  <span>{issue.commentsCount}</span>
                  <Link to={`/app/issues/${issue.id}`}>View</Link>
                </div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};

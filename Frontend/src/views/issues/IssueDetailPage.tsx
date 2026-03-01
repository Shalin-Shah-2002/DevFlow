import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getIssueDetail } from '../../controllers/issues.controller';
import type { IssueDetailItem } from '../../models/issues.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';

export const IssueDetailPage = () => {
  const { state } = useAuth();
  const { issueId = '' } = useParams();
  const [issue, setIssue] = useState<IssueDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.token || !issueId) {
      return;
    }

    getIssueDetail(state.token, issueId)
      .then((payload) => {
        setError(null);
        setIssue(payload);
      })
      .catch(() => setError('Failed to load issue detail.'))
      .finally(() => setLoading(false));
  }, [state.token, issueId]);

  return (
    <div className="dv3-page issues-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="issue-detail-main">
        <header className="issue-detail-head">
          <Link to="/app/issues">← Back to Issues</Link>
          {issue && <span>#{issue.number}</span>}
        </header>

        {loading && <div className="issues-info">Loading issue details...</div>}
        {error && <div className="issues-info issues-error">{error}</div>}

        {!loading && !error && issue && (
          <section className="issue-detail-card">
            <div className="issue-detail-title">
              <h2>{issue.title}</h2>
              <span className={issue.state === 'open' ? 'badge-open' : 'badge-closed'}>{issue.state}</span>
            </div>

            <p className="issue-detail-body">{issue.body || 'No description provided for this issue.'}</p>

            <div className="issue-detail-meta-grid">
              <article>
                <h4>Repository</h4>
                <p>{issue.repository.fullName}</p>
              </article>
              <article>
                <h4>Priority</h4>
                <p>{issue.priority || 'Not set'}</p>
              </article>
              <article>
                <h4>Custom Status</h4>
                <p>{issue.customStatus || 'None'}</p>
              </article>
              <article>
                <h4>Updated</h4>
                <p>{issue.githubUpdatedAt || '—'}</p>
              </article>
            </div>

            <div className="issue-detail-labels">
              <h4>Labels</h4>
              <div>
                {issue.labels.length > 0 ? issue.labels.map((label) => <span key={label.id}>{label.name}</span>) : <span>No labels</span>}
              </div>
            </div>

            <div className="issue-detail-comments">
              <h4>Comments ({issue.comments?.length || 0})</h4>
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <article key={comment.id}>
                    <header>
                      <strong>{comment.user?.name || comment.user?.githubLogin || 'Contributor'}</strong>
                      <span>{comment.createdAt}</span>
                    </header>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <p className="issues-info">No comments available.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createIssue, getIssuesList } from '../../controllers/issues.controller';
import type { IssueListItem } from '../../models/issues.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { getRepositoriesOverview } from '../../controllers/repositories.controller';
import type { RepositoryItem } from '../../models/repositories.model';

export const IssuesListPage = () => {
  const { state } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(searchParams.get('new') === '1');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');
  const [createRepositoryId, setCreateRepositoryId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createBody, setCreateBody] = useState('');
  const [createPriority, setCreatePriority] = useState<'P0' | 'P1' | 'P2' | 'P3' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getRepositoriesOverview(state.token, { page: 1, limit: 100 })
      .then((response) => {
        setRepositories(response.data || []);
        setCreateRepositoryId((value) => value || response.data?.[0]?.id || '');
      })
      .catch(() => {
        setCreateMessage('Unable to load repositories for issue creation.');
      });
  }, [state.token]);

  useEffect(() => {
    const shouldOpen = searchParams.get('new') === '1';
    setShowCreateForm(shouldOpen);
  }, [searchParams]);

  const clearCreateQuery = () => {
    if (searchParams.get('new') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm((value) => {
      const nextValue = !value;
      if (!nextValue) {
        clearCreateQuery();
      }
      return nextValue;
    });
  };

  const handleCreateIssue = async () => {
    if (!state.token || !createRepositoryId || !createTitle.trim()) {
      setCreateMessage('Repository and title are required.');
      return;
    }

    setCreating(true);
    setCreateMessage(null);

    try {
      await createIssue(state.token, {
        repositoryId: createRepositoryId,
        title: createTitle.trim(),
        body: createBody.trim() || undefined,
        ...(createPriority ? { priority: createPriority } : {})
      });

      setCreateTitle('');
      setCreateBody('');
      setCreatePriority('');
      setCreateMessage('Issue created successfully.');
      const refreshed = await getIssuesList(state.token, {
        limit: 20,
        page: 1,
        state: filterState,
        search,
        sort: 'updated',
        order: 'desc'
      });
      setIssues(refreshed.data || []);
      clearCreateQuery();
      setShowCreateForm(false);
    } catch (createError) {
      setCreateMessage(createError instanceof Error ? createError.message : 'Failed to create issue.');
    } finally {
      setCreating(false);
    }
  };

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
            <button type="button" className="issues-new-btn" onClick={toggleCreateForm}>
              {showCreateForm ? 'Close New Issue' : '+ New Issue'}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <section className="issue-create-card">
            <div className="issue-create-head">
              <h3>Create New Issue</h3>
              <p>Create a GitHub issue in one of your connected repositories.</p>
            </div>

            <div className="issue-create-grid">
              <label>
                <span>Repository</span>
                <select
                  value={createRepositoryId}
                  onChange={(event) => setCreateRepositoryId(event.target.value)}
                >
                  {repositories.map((repository) => (
                    <option key={repository.id} value={repository.id}>
                      {repository.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Priority (optional)</span>
                <select
                  value={createPriority}
                  onChange={(event) => setCreatePriority(event.target.value as 'P0' | 'P1' | 'P2' | 'P3' | '')}
                >
                  <option value="">No Priority</option>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              </label>

              <label className="wide">
                <span>Title</span>
                <input
                  value={createTitle}
                  onChange={(event) => setCreateTitle(event.target.value)}
                  placeholder="Summarize the issue"
                />
              </label>

              <label className="wide">
                <span>Description (optional)</span>
                <textarea
                  value={createBody}
                  onChange={(event) => setCreateBody(event.target.value)}
                  placeholder="Describe the problem, expected behavior, and context"
                />
              </label>
            </div>

            <div className="issue-create-actions">
              <button type="button" onClick={() => void handleCreateIssue()} disabled={creating}>
                {creating ? 'Creating...' : 'Create Issue'}
              </button>
            </div>

            {createMessage && <div className="issue-create-message">{createMessage}</div>}
          </section>
        )}

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

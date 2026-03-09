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

const PAGE_SIZE = 6;

export const IssuesListPage = () => {
  const { state } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('new') === '1');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');
  const [filterRepository, setFilterRepository] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'comments'>('updated');
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

    setLoading(true);
    getIssuesList(state.token, {
      limit: PAGE_SIZE,
      page: currentPage,
      state: filterState,
      search,
      sort: sortBy,
      order: 'desc',
      repositoryId: filterRepository
    })
      .then((response) => {
        setError(null);
        setIssues(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalIssues(response.pagination?.total || 0);
      })
      .catch(() => {
        setError('Failed to load issues.');
      })
      .finally(() => setLoading(false));
  }, [state.token, filterState, search, sortBy, currentPage, filterRepository]);

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
    setShowCreateModal(shouldOpen);
  }, [searchParams]);

  const clearCreateQuery = () => {
    if (searchParams.get('new') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  };

  const toggleCreateModal = () => {
    setShowCreateModal((value) => {
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
        limit: PAGE_SIZE,
        page: 1,
        state: filterState,
        search,
        sort: sortBy,
        order: 'desc',
        repositoryId: filterRepository
      });
      setCurrentPage(1);
      setIssues(refreshed.data || []);
      setTotalPages(refreshed.pagination?.totalPages || 1);
      setTotalIssues(refreshed.pagination?.total || 0);
      clearCreateQuery();
      setShowCreateModal(false);
    } catch (createError) {
      setCreateMessage(createError instanceof Error ? createError.message : 'Failed to create issue.');
    } finally {
      setCreating(false);
    }
  };

  const clearFilters = () => {
    setFilterState('all');
    setFilterRepository('all');
    setSortBy('updated');
    setSearch('');
    setCurrentPage(1);
  };

  const rangeStart = totalIssues === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalIssues);

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
            <button type="button" className="issues-new-btn" onClick={toggleCreateModal}>
              + Add Issue
            </button>
          </div>
        </header>

        <section className="issues-filter-card">
          <div className="issues-filter-top">
            <label className="issues-search-input">
              <span>🔎</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search issues, labels, authors..."
              />
            </label>

            <div className="issues-sort-wrap">
              <span>Repository</span>
              <select
                value={filterRepository}
                onChange={(event) => {
                  setFilterRepository(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Repositories</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="issues-sort-wrap">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as typeof sortBy);
                  setCurrentPage(1);
                }}
              >
                <option value="updated">Updated</option>
                <option value="created">Created</option>
                <option value="priority">Priority</option>
                <option value="comments">Comments</option>
              </select>
            </div>
          </div>

          <div className="issues-filter-bottom">
            <button
              type="button"
              className={filterState === 'all' ? 'active' : ''}
              onClick={() => {
                setFilterState('all');
                setCurrentPage(1);
              }}
            >
              All
            </button>
            <button
              type="button"
              className={filterState === 'open' ? 'active' : ''}
              onClick={() => {
                setFilterState('open');
                setCurrentPage(1);
              }}
            >
              Open
            </button>
            <button
              type="button"
              className={filterState === 'closed' ? 'active' : ''}
              onClick={() => {
                setFilterState('closed');
                setCurrentPage(1);
              }}
            >
              Closed
            </button>

            <span className="divider" />
            <button type="button" className="clear" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </section>

        <section className="issues-table-wrap">
          {loading && <div className="issues-info">Loading issues...</div>}
          {error && <div className="issues-info issues-error">{error}</div>}
          {!loading && !error && issues.length === 0 && <div className="issues-info">No issues found.</div>}

          {!loading && !error && issues.length > 0 && (
            <motion.div className="issues-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="issues-row issues-row-head">
                <span>#</span>
                <span>Issue</span>
                <span>Status</span>
                <span>Tags</span>
                <span>Assignee</span>
                <span>Action</span>
              </div>

              {issues.map((issue) => (
                <div key={issue.id} className="issues-row">
                  <span>#{issue.number}</span>
                  <div>
                    <strong>{issue.title}</strong>
                    <small>{issue.repository.fullName}</small>
                  </div>
                  <span className={issue.state === 'open' ? 'badge-open' : 'badge-closed'}>{issue.state}</span>
                  <span className="issues-tags-inline">
                    {(issue.labels || []).slice(0, 2).map((label) => (
                      <em key={label.id}>{label.name}</em>
                    ))}
                    {(issue.labels || []).length === 0 && <em>No tags</em>}
                  </span>
                  <span>
                    {issue.assignees?.[0]?.githubLogin || 'Unassigned'}
                    {issue.priority ? <small className="issues-priority-chip">{issue.priority}</small> : null}
                  </span>
                  <Link to={`/app/issues/${issue.id}`}>View</Link>
                </div>
              ))}
            </motion.div>
          )}

          <footer className="issues-pagination-note">
            <span>
              Showing <strong>{rangeStart}</strong>-<strong>{rangeEnd}</strong> of <strong>{totalIssues}</strong> issues •
              Open <strong>{stats.open}</strong> • Closed <strong>{stats.closed}</strong>
            </span>

            <div className="issues-pagination-controls">
              <button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1 || loading}>
                Previous
              </button>
              <span>
                Page <strong>{currentPage}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </button>
            </div>
          </footer>
        </section>

        {showCreateModal && (
          <div className="issue-create-modal-backdrop" role="dialog" aria-modal="true" aria-label="Add Issue">
            <div className="issue-create-modal">
              <header>
                <h3>Add New Issue</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    clearCreateQuery();
                  }}
                >
                  ✕
                </button>
              </header>

              <div className="issue-create-grid">
                <label>
                  <span>Repository</span>
                  <select value={createRepositoryId} onChange={(event) => setCreateRepositoryId(event.target.value)}>
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

              {createMessage && <div className="issue-create-message">{createMessage}</div>}

              <footer>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    clearCreateQuery();
                  }}
                >
                  Cancel
                </button>
                <button type="button" onClick={() => void handleCreateIssue()} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Issue'}
                </button>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

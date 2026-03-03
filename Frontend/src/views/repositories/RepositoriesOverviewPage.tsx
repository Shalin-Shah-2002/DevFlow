import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  addRepositoryToOverview,
  deleteRepositoryFromOverview,
  getRepositoriesOverview,
  getRepositoryOverviewDetails,
  setupRepositoryOverviewWebhook,
  syncRepositoryOverview,
  updateRepositoryOverview
} from '../../controllers/repositories.controller';
import type { RepositoryDetails, RepositoryItem } from '../../models/repositories.model';

type RepositoryTab = 'all' | 'private' | 'public' | 'webhook';

export const RepositoriesOverviewPage = () => {
  const { state } = useAuth();
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<RepositoryDetails | null>(null);
  const [activeTab, setActiveTab] = useState<RepositoryTab>('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoGroup, setNewRepoGroup] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const loadRepositories = useCallback(async () => {
    if (!state.token) {
      return;
    }

    setLoadingList(true);
    try {
      const response = await getRepositoriesOverview(state.token, {
        page: 1,
        limit: 60
      });
      setRepositories(response.data || []);
      if (!selectedRepositoryId && (response.data || []).length > 0) {
        setSelectedRepositoryId(response.data[0].id);
      }
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Failed to load repositories.');
    } finally {
      setLoadingList(false);
    }
  }, [state.token, selectedRepositoryId]);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  useEffect(() => {
    if (!state.token || !selectedRepositoryId) {
      return;
    }

    setLoadingDetails(true);
    getRepositoryOverviewDetails(state.token, selectedRepositoryId)
      .then((details) => {
        setSelectedDetails(details);
      })
      .catch(() => {
        setPageMessage('Failed to load selected repository details.');
      })
      .finally(() => setLoadingDetails(false));
  }, [state.token, selectedRepositoryId]);

  const summary = useMemo(() => {
    const total = repositories.length;
    const privateRepos = repositories.filter((repo) => repo.isPrivate).length;
    const stars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
    const openIssues = repositories.reduce((sum, repo) => sum + repo.openIssuesCount, 0);

    return { total, privateRepos, stars, openIssues };
  }, [repositories]);

  const visibleRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredByTab = repositories.filter((repository) => {
      if (activeTab === 'private') {
        return repository.isPrivate;
      }

      if (activeTab === 'public') {
        return !repository.isPrivate;
      }

      if (activeTab === 'webhook') {
        return repository.webhookEnabled;
      }

      return true;
    });

    if (!query) {
      return filteredByTab;
    }

    return filteredByTab.filter((repository) => {
      const haystack = [repository.name, repository.fullName, repository.owner, repository.group || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [repositories, activeTab, search]);

  const tabCounts = useMemo(
    () => ({
      all: repositories.length,
      private: repositories.filter((repository) => repository.isPrivate).length,
      public: repositories.filter((repository) => !repository.isPrivate).length,
      webhook: repositories.filter((repository) => repository.webhookEnabled).length
    }),
    [repositories]
  );

  const handleAddRepository = async () => {
    if (!state.token || !newRepoUrl.trim()) {
      return;
    }

    setActionBusyId('add');
    try {
      await addRepositoryToOverview(state.token, newRepoUrl.trim(), newRepoGroup.trim() || undefined);
      setNewRepoUrl('');
      setNewRepoGroup('');
      setIsAddModalOpen(false);
      setPageMessage('Repository added successfully.');
      await loadRepositories();
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Could not add repository.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleSync = async (repositoryId: string) => {
    if (!state.token) {
      return;
    }

    setActionBusyId(repositoryId);
    try {
      const result = await syncRepositoryOverview(state.token, repositoryId);
      setPageMessage(result.message || 'Repository synced.');
      await loadRepositories();
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Failed to sync repository.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleWebhook = async (repositoryId: string) => {
    if (!state.token) {
      return;
    }

    setActionBusyId(repositoryId);
    try {
      const result = await setupRepositoryOverviewWebhook(state.token, repositoryId);
      setPageMessage(result.message || 'Webhook configured successfully.');
      await updateRepositoryOverview(state.token, repositoryId, { webhookEnabled: true });
      await loadRepositories();
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Failed to configure webhook.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDelete = async (repositoryId: string) => {
    if (!state.token) {
      return;
    }

    setActionBusyId(repositoryId);
    try {
      await deleteRepositoryFromOverview(state.token, repositoryId);
      setPageMessage('Repository removed successfully.');
      if (selectedRepositoryId === repositoryId) {
        setSelectedRepositoryId(null);
        setSelectedDetails(null);
      }
      await loadRepositories();
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Failed to remove repository.');
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="dv3-page repositories-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="repos-main">
        <header className="repos-head">
          <div>
            <h2>Repositories Overview</h2>
            <p>Manage connected repositories, monitor health, and run sync operations in one place.</p>
          </div>
          <div className="repos-head-actions">
            <label className="repos-search-input">
              <span>🔎</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories..."
              />
            </label>
            <button type="button" className="repos-add-open-btn" onClick={() => setIsAddModalOpen(true)}>
              + Add Repository
            </button>
          </div>
        </header>

        <section className="repos-tabs-row">
          <div className="repos-tabs">
            <button type="button" className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
              All ({tabCounts.all})
            </button>
            <button
              type="button"
              className={activeTab === 'private' ? 'active' : ''}
              onClick={() => setActiveTab('private')}
            >
              Private ({tabCounts.private})
            </button>
            <button
              type="button"
              className={activeTab === 'public' ? 'active' : ''}
              onClick={() => setActiveTab('public')}
            >
              Public ({tabCounts.public})
            </button>
            <button
              type="button"
              className={activeTab === 'webhook' ? 'active' : ''}
              onClick={() => setActiveTab('webhook')}
            >
              Webhooks ({tabCounts.webhook})
            </button>
          </div>
          <span className="repos-count-text">{visibleRepositories.length} shown</span>
        </section>

        <section className="repos-cards-grid">
          {loadingList && <div className="repos-info">Loading repositories...</div>}

          {!loadingList && visibleRepositories.length === 0 && (
            <div className="repos-info">No repositories found for the current view.</div>
          )}

          {!loadingList &&
            visibleRepositories.map((repo) => (
              <article
                key={repo.id}
                className={repo.id === selectedRepositoryId ? 'repo-card selected' : 'repo-card'}
                onClick={() => setSelectedRepositoryId(repo.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedRepositoryId(repo.id);
                  }
                }}
              >
                <div className="repo-card-head">
                  <div className="repo-card-title-wrap">
                    <span className="repo-card-icon">◆</span>
                    <div>
                      <h3>{repo.name}</h3>
                      <small>{repo.fullName}</small>
                    </div>
                  </div>
                  <span className="repo-card-badge">{repo.isPrivate ? 'Private' : 'Public'}</span>
                </div>

                <div className="repo-card-tags">
                  <span>{repo.language || 'Unknown'}</span>
                  <span>★ {repo.stars}</span>
                  <span>Forks {repo.forks}</span>
                </div>

                <div className="repo-card-meta">
                  <span>Open issues {repo.openIssuesCount}</span>
                  <span>{repo.webhookEnabled ? 'Webhook enabled' : 'Webhook disabled'}</span>
                </div>

                <div className="repo-card-foot">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleSync(repo.id);
                    }}
                    disabled={actionBusyId === repo.id}
                  >
                    Sync
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleWebhook(repo.id);
                    }}
                    disabled={actionBusyId === repo.id}
                  >
                    Webhook
                  </button>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    GitHub ↗
                  </a>
                  <button
                    type="button"
                    className="danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(repo.id);
                    }}
                    disabled={actionBusyId === repo.id}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
        </section>

        <section className="repos-focus-panel">
          {loadingDetails && <div className="repos-info">Loading repository details...</div>}

          {!loadingDetails && !selectedDetails && (
            <div className="repos-empty-focus">
              <div className="repos-empty-icon">⌁</div>
              <h3>Select a repository</h3>
              <p>Choose a repository card to inspect detailed issue and label statistics.</p>
              <button type="button" onClick={() => setIsAddModalOpen(true)}>
                Add New Repository
              </button>
            </div>
          )}

          {!loadingDetails && selectedDetails && (
            <div className="repos-focus-content">
              <h3>{selectedDetails.fullName}</h3>
              <p>{selectedDetails.description || 'No description available.'}</p>

              <div className="repos-focus-stats">
                <article>
                  <span>Total Issues</span>
                  <strong>{selectedDetails.stats.totalIssues}</strong>
                </article>
                <article>
                  <span>Open</span>
                  <strong>{selectedDetails.stats.openIssues}</strong>
                </article>
                <article>
                  <span>Closed</span>
                  <strong>{selectedDetails.stats.closedIssues}</strong>
                </article>
                <article>
                  <span>Labels</span>
                  <strong>{selectedDetails.stats.labels}</strong>
                </article>
                <article>
                  <span>Contributors</span>
                  <strong>{selectedDetails.stats.contributors}</strong>
                </article>
                <article>
                  <span>Open Issues</span>
                  <strong>{selectedDetails.openIssuesCount}</strong>
                </article>
              </div>

              <div className="repos-focus-meta">
                <span>Owner: {selectedDetails.owner}</span>
                <span>Role: {selectedDetails.userRole || 'member'}</span>
                <span>Webhook: {selectedDetails.webhookEnabled ? 'Enabled' : 'Disabled'}</span>
                <span>Last Sync: {selectedDetails.lastSyncedAt || 'Never'}</span>
              </div>
            </div>
          )}
        </section>

        <section className="repos-mini-summary">
          <article>
            <span>Total</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <span>Private</span>
            <strong>{summary.privateRepos}</strong>
          </article>
          <article>
            <span>Stars</span>
            <strong>{summary.stars}</strong>
          </article>
          <article>
            <span>Open Issues</span>
            <strong>{summary.openIssues}</strong>
          </article>
        </section>

        {isAddModalOpen && (
          <div className="repos-modal-backdrop" role="dialog" aria-modal="true" aria-label="Add Repository">
            <div className="repos-modal-card">
              <header>
                <h3>Add New Repository</h3>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>
                  ✕
                </button>
              </header>

              <div className="repos-modal-body">
                <label>
                  <span>Repository URL</span>
                  <input
                    value={newRepoUrl}
                    onChange={(event) => setNewRepoUrl(event.target.value)}
                    placeholder="https://github.com/owner/repo"
                  />
                </label>

                <label>
                  <span>Group (optional)</span>
                  <input
                    value={newRepoGroup}
                    onChange={(event) => setNewRepoGroup(event.target.value)}
                    placeholder="Platform / Backend / Mobile"
                  />
                </label>
              </div>

              <footer>
                <button type="button" className="ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" disabled={actionBusyId === 'add'} onClick={() => void handleAddRepository()}>
                  {actionBusyId === 'add' ? 'Adding...' : 'Add Repository'}
                </button>
              </footer>
            </div>
          </div>
        )}

        {pageMessage && <div className="repos-message">{pageMessage}</div>}
      </main>
    </div>
  );
};

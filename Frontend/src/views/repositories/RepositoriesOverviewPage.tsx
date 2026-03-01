import { useEffect, useMemo, useState } from 'react';
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

export const RepositoriesOverviewPage = () => {
  const { state } = useAuth();
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<RepositoryDetails | null>(null);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoGroup, setNewRepoGroup] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getRepositoriesOverview(state.token, {
      page: 1,
      limit: 24,
      search,
      group
    })
      .then((response) => {
        setRepositories(response.data || []);
        if (!selectedRepositoryId && response.data.length > 0) {
          setSelectedRepositoryId(response.data[0].id);
        }
      })
      .catch((error) => {
        setPageMessage(error.message || 'Failed to load repositories.');
      })
      .finally(() => {
        setLoadingList(false);
      });
  }, [state.token, search, group]);

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

  const refreshList = async () => {
    if (!state.token) {
      return;
    }

    setLoadingList(true);
    try {
      const response = await getRepositoriesOverview(state.token, {
        page: 1,
        limit: 24,
        search,
        group
      });
      setRepositories(response.data || []);
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : 'Failed to refresh repositories.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleAddRepository = async () => {
    if (!state.token || !newRepoUrl.trim()) {
      return;
    }

    setActionBusyId('add');
    try {
      await addRepositoryToOverview(state.token, newRepoUrl.trim(), newRepoGroup.trim() || undefined);
      setNewRepoUrl('');
      setNewRepoGroup('');
      setPageMessage('Repository added successfully.');
      await refreshList();
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
      await refreshList();
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
      await refreshList();
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
      await refreshList();
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
            <p>Manage connected repositories, sync issues, and maintain webhook integrations.</p>
          </div>
          <div className="repos-head-hint">
            <strong>{repositories.length}</strong>
            <span>Repositories in current view</span>
          </div>
        </header>

        <section className="repos-summary">
          <article>
            <span>Total Repositories</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <span>Private</span>
            <strong>{summary.privateRepos}</strong>
          </article>
          <article>
            <span>Total Stars</span>
            <strong>{summary.stars}</strong>
          </article>
          <article>
            <span>Open Issues</span>
            <strong>{summary.openIssues}</strong>
          </article>
        </section>

        <section className="repos-add-card">
          <h3>Add Repository</h3>
          <p className="repos-subtext">Connect a GitHub repository URL and optionally group it.</p>
          <div className="repos-add-grid">
            <label className="repos-field">
              <span>Repository URL</span>
              <input
                value={newRepoUrl}
                onChange={(event) => setNewRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
              />
            </label>
            <label className="repos-field">
              <span>Group</span>
              <input
                value={newRepoGroup}
                onChange={(event) => setNewRepoGroup(event.target.value)}
                placeholder="Optional"
              />
            </label>
            <button type="button" disabled={actionBusyId === 'add'} onClick={() => void handleAddRepository()}>
              {actionBusyId === 'add' ? 'Adding...' : 'Add Repository'}
            </button>
          </div>
        </section>

        <section className="repos-content-grid">
          <div className="repos-list-card">
            <div className="repos-section-title">
              <h3>Repository List</h3>
              <span>Select one repository to view full details</span>
            </div>

            <div className="repos-toolbar">
              <label className="repos-field compact">
                <span>Search</span>
                <input
                  value={search}
                  onChange={(event) => {
                    setLoadingList(true);
                    setSearch(event.target.value);
                  }}
                  placeholder="Repository name"
                />
              </label>
              <label className="repos-field compact">
                <span>Group</span>
                <input
                  value={group}
                  onChange={(event) => {
                    setLoadingList(true);
                    setGroup(event.target.value);
                  }}
                  placeholder="Filter by group"
                />
              </label>
              <button type="button" onClick={() => void refreshList()}>
                Refresh
              </button>
            </div>

            {loadingList && <div className="repos-info">Loading repositories...</div>}

            {!loadingList && repositories.length === 0 && (
              <div className="repos-info">No repositories found for the current filters.</div>
            )}

            {!loadingList && repositories.length > 0 && (
              <div className="repos-list">
                {repositories.map((repo) => (
                  <article
                    key={repo.id}
                    className={repo.id === selectedRepositoryId ? 'repo-item selected' : 'repo-item'}
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
                    <div>
                      <h4>{repo.fullName}</h4>
                      <p>{repo.description || 'No description provided.'}</p>
                    </div>

                    <div className="repo-item-meta">
                      <span>{repo.language || 'Unknown'}</span>
                      <span>★ {repo.stars}</span>
                      <span>Forks {repo.forks}</span>
                      <span>Open {repo.openIssuesCount}</span>
                    </div>

                    <div className="repo-item-actions">
                      <button
                        type="button"
                        disabled={actionBusyId === repo.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSync(repo.id);
                        }}
                      >
                        Sync Now
                      </button>
                      <button
                        type="button"
                        disabled={actionBusyId === repo.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleWebhook(repo.id);
                        }}
                      >
                        Setup Webhook
                      </button>
                      <button
                        type="button"
                        disabled={actionBusyId === repo.id}
                        className="danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(repo.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="repos-detail-card">
            <div className="repos-section-title">
              <h3>Repository Details</h3>
              <span>Selected repository insights and health</span>
            </div>

            {loadingDetails && <div className="repos-info">Loading repository details...</div>}

            {!loadingDetails && !selectedDetails && (
              <div className="repos-info">Select a repository to view detailed stats.</div>
            )}

            {!loadingDetails && selectedDetails && (
              <>
                <h3>{selectedDetails.fullName}</h3>
                <p>{selectedDetails.description || 'No description available.'}</p>

                <div className="repos-detail-meta">
                  <span>Owner: {selectedDetails.owner}</span>
                  <span>Role: {selectedDetails.userRole || 'member'}</span>
                  <span>Webhook: {selectedDetails.webhookEnabled ? 'Enabled' : 'Disabled'}</span>
                  <span>Last Sync: {selectedDetails.lastSyncedAt || 'Never'}</span>
                </div>

                <div className="repos-detail-stats">
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
                </div>

                <a href={selectedDetails.url} target="_blank" rel="noreferrer">
                  Open on GitHub ↗
                </a>
              </>
            )}
          </aside>
        </section>

        {pageMessage && <div className="repos-message">{pageMessage}</div>}
      </main>
    </div>
  );
};

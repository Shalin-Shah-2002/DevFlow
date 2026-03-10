import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  addRepositoryToOverview,
  deleteRepositoryFromOverview,
  getRepositoriesOverview,
  getRepositoryGroups,
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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoGroup, setNewRepoGroup] = useState('');
  const [newGroupInput, setNewGroupInput] = useState('');
  const [groups, setGroups] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupValue, setEditingGroupValue] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
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
    if (!state.token) return;
    getRepositoryGroups(state.token)
      .then(setGroups)
      .catch(() => {});
  }, [state.token, repositories]);

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
      const resolvedGroup = newRepoGroup === '__new__' ? newGroupInput.trim() : newRepoGroup.trim();
      await addRepositoryToOverview(state.token, newRepoUrl.trim(), resolvedGroup || undefined);
      setNewRepoUrl('');
      setNewRepoGroup('');
      setNewGroupInput('');
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

  const handleRenameGroup = async (oldName: string, newName: string) => {
    if (!state.token || !newName.trim() || newName.trim() === oldName) {
      setEditingGroup(null);
      setEditingGroupValue('');
      return;
    }
    const reposInGroup = repositories.filter((r) => r.group === oldName);
    setActionBusyId('group');
    try {
      await Promise.all(
        reposInGroup.map((r) => updateRepositoryOverview(state.token!, r.id, { group: newName.trim() }))
      );
      setEditingGroup(null);
      setEditingGroupValue('');
      setPageMessage(`Group renamed to "${newName.trim()}".`);
      await loadRepositories();
    } catch {
      setPageMessage('Failed to rename group.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!state.token) return;
    setActionBusyId('group');
    try {
      await Promise.all(
        repositories
          .filter((r) => r.group === groupName)
          .map((r) => updateRepositoryOverview(state.token!, r.id, { group: '' }))
      );
      setPageMessage(`Group "${groupName}" deleted.`);
      await loadRepositories();
    } catch {
      setPageMessage('Failed to delete group.');
    } finally {
      setActionBusyId(null);
    }
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const groupedRepositories = useMemo(() => {
    const groupMap = new Map<string, RepositoryItem[]>();
    const ungrouped: RepositoryItem[] = [];
    for (const repo of visibleRepositories) {
      if (repo.group) {
        if (!groupMap.has(repo.group)) groupMap.set(repo.group, []);
        groupMap.get(repo.group)!.push(repo);
      } else {
        ungrouped.push(repo);
      }
    }
    const sections: { group: string | null; repos: RepositoryItem[] }[] = [];
    for (const [g, repos] of groupMap) {
      sections.push({ group: g, repos });
    }
    if (ungrouped.length > 0 || sections.length === 0) {
      sections.push({ group: null, repos: ungrouped });
    }
    return sections;
  }, [visibleRepositories]);

  return (
    <div className="dv3-page repositories-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="repos-main">
        <header className="repos-head">
          <div>
            <h2>Repositories</h2>
            <p>Manage connected repositories, monitor health, and run sync operations.</p>
          </div>
          <div className="repos-stats-bar">
            <div className="repos-stat"><strong>{summary.total}</strong><span>Total</span></div>
            <div className="repos-stat"><strong>{summary.privateRepos}</strong><span>Private</span></div>
            <div className="repos-stat repos-stat-accent"><strong>{summary.stars}</strong><span>Stars</span></div>
            <div className="repos-stat"><strong>{summary.openIssues}</strong><span>Open Issues</span></div>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="repos-controls-row">
          <div className="repos-tabs">
            <button type="button" className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
              All <em>{tabCounts.all}</em>
            </button>
            <button type="button" className={activeTab === 'private' ? 'active' : ''} onClick={() => setActiveTab('private')}>
              Private <em>{tabCounts.private}</em>
            </button>
            <button type="button" className={activeTab === 'public' ? 'active' : ''} onClick={() => setActiveTab('public')}>
              Public <em>{tabCounts.public}</em>
            </button>
            <button type="button" className={activeTab === 'webhook' ? 'active' : ''} onClick={() => setActiveTab('webhook')}>
              Webhooks <em>{tabCounts.webhook}</em>
            </button>
          </div>
          <div className="repos-controls-right">
            <label className="repos-search-input">
              <span>🔎</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories..."
              />
            </label>
            {groups.length > 0 && (
              <button type="button" className="repos-manage-groups-btn" onClick={() => setIsGroupModalOpen(true)}>
                ⚙ Manage Groups
              </button>
            )}
            <button type="button" className="repos-add-open-btn" onClick={() => setIsAddModalOpen(true)}>
              + Add Repository
            </button>
          </div>
        </div>

        {/* GROUPED REPO CARDS */}
        <div className="repos-cards-area">
          {loadingList && <div className="repos-info">Loading repositories...</div>}
          {!loadingList && visibleRepositories.length === 0 && (
            <div className="repos-info">No repositories found for the current view.</div>
          )}
          {!loadingList &&
            groupedRepositories.map(({ group, repos }) => (
              <section key={group ?? '__ungrouped__'} className="repos-group-section">
                {groups.length > 0 && (
                  <div className="repos-group-header">
                    <button
                      type="button"
                      className="repos-group-collapse"
                      onClick={() => toggleGroupCollapse(group ?? '__ungrouped__')}
                    >
                      <span
                        className={
                          collapsedGroups.has(group ?? '__ungrouped__')
                            ? 'repos-chevron collapsed'
                            : 'repos-chevron'
                        }
                      >
                        ▼
                      </span>
                    </button>
                    <span className="repos-group-icon">⬡</span>
                    <h4>{group ?? 'Ungrouped'}</h4>
                    <span className="repos-group-count">{repos.length}</span>
                  </div>
                )}
                {!collapsedGroups.has(group ?? '__ungrouped__') && (
                  <div className="repos-cards-grid">
                    {repos.map((repo) => (
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
                          <span className={`repo-card-badge${repo.isPrivate ? '' : ' public'}`}>
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>

                        {repo.group && <div className="repo-card-group-tag">⬡ {repo.group}</div>}

                        <div className="repo-card-tags">
                          {repo.language && <span>{repo.language}</span>}
                          <span>★ {repo.stars}</span>
                          <span>⑂ {repo.forks}</span>
                        </div>

                        <div className="repo-card-meta">
                          <span className={repo.openIssuesCount > 0 ? 'has-issues' : ''}>
                            {repo.openIssuesCount} open issues
                          </span>
                          <span className={repo.webhookEnabled ? 'webhook-on' : 'webhook-off'}>
                            {repo.webhookEnabled ? '● Webhook on' : '○ Webhook off'}
                          </span>
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
                            ↺ Sync
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
                  </div>
                )}
              </section>
            ))}
        </div>

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
                  <select
                    value={newRepoGroup}
                    onChange={(event) => {
                      setNewRepoGroup(event.target.value);
                      if (event.target.value !== '__new__') setNewGroupInput('');
                    }}
                  >
                    <option value="">No group</option>
                    {groups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="__new__">+ New group...</option>
                  </select>
                  {newRepoGroup === '__new__' && (
                    <input
                      value={newGroupInput}
                      onChange={(event) => setNewGroupInput(event.target.value)}
                      placeholder="Enter group name"
                      style={{ marginTop: '6px' }}
                    />
                  )}
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

        {/* MANAGE GROUPS MODAL */}
        {isGroupModalOpen && (
          <div className="repos-modal-backdrop" role="dialog" aria-modal="true" aria-label="Manage Groups">
            <div className="repos-modal-card">
              <header>
                <h3>Manage Groups</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupModalOpen(false);
                    setEditingGroup(null);
                    setEditingGroupValue('');
                  }}
                >
                  ✕
                </button>
              </header>
              <div className="repos-modal-body repos-groups-modal-body">
                {groups.length === 0 ? (
                  <p className="repos-groups-empty">No groups yet. Add a group when creating a repository.</p>
                ) : (
                  groups.map((g) => (
                    <div key={g} className="repos-group-modal-row">
                      {editingGroup === g ? (
                        <>
                          <input
                            className="repos-group-edit-input"
                            value={editingGroupValue}
                            onChange={(e) => setEditingGroupValue(e.target.value)}
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void handleRenameGroup(g, editingGroupValue);
                              if (e.key === 'Escape') {
                                setEditingGroup(null);
                                setEditingGroupValue('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="repos-group-modal-save"
                            onClick={() => void handleRenameGroup(g, editingGroupValue)}
                            disabled={actionBusyId === 'group'}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="repos-group-modal-cancel"
                            onClick={() => {
                              setEditingGroup(null);
                              setEditingGroupValue('');
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="repos-group-modal-icon">⬡</span>
                          <span className="repos-group-modal-name">{g}</span>
                          <span className="repos-group-modal-count">
                            {repositories.filter((r) => r.group === g).length} repos
                          </span>
                          <button
                            type="button"
                            className="repos-group-modal-edit"
                            onClick={() => {
                              setEditingGroup(g);
                              setEditingGroupValue(g);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="repos-group-modal-delete"
                            onClick={() => void handleDeleteGroup(g)}
                            disabled={actionBusyId === 'group'}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              <footer>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setIsGroupModalOpen(false);
                    setEditingGroup(null);
                    setEditingGroupValue('');
                  }}
                >
                  Close
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

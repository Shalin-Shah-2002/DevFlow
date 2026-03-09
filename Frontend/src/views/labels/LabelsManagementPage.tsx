import { useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  createLabel,
  deleteLabel,
  getLabels,
  syncLabels,
  updateLabel
} from '../../controllers/labels.controller';
import type { LabelItem } from '../../models/labels.model';
import { getRepositoriesOverview } from '../../controllers/repositories.controller';
import type { RepositoryItem } from '../../models/repositories.model';

const DEFAULT_LABEL_COLOR = '1d4fd7';

export const LabelsManagementPage = () => {
  const { state } = useAuth();
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [repositoryFilter, setRepositoryFilter] = useState('all');
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_LABEL_COLOR);
  const [description, setDescription] = useState('');
  const [createRepoId, setCreateRepoId] = useState('');
  const [syncRepoId, setSyncRepoId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_LABEL_COLOR);
  const [editDescription, setEditDescription] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadRepositories = async () => {
    if (!state.token) {
      return;
    }

    const response = await getRepositoriesOverview(state.token, {
      page: 1,
      limit: 100
    });

    setRepositories(response.data || []);

    if ((response.data || []).length > 0 && !createRepoId) {
      const first = response.data[0].id;
      setCreateRepoId(first);
      setSyncRepoId(first);
    }
  };

  const loadLabels = async () => {
    if (!state.token) {
      return;
    }

    const response = await getLabels(state.token, {
      page: 1,
      pageSize: 200,
      repositoryId: repositoryFilter === 'all' ? undefined : repositoryFilter,
      search,
      sortBy: 'name',
      sortOrder: 'asc'
    });

    setLabels(response.labels || []);
  };

  useEffect(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);

    Promise.all([loadRepositories(), loadLabels()])
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load labels data.');
      })
      .finally(() => setLoading(false));
  }, [state.token, repositoryFilter, search]);

  // When viewing all repositories, deduplicate labels by name so default
  // GitHub labels (bug, enhancement, etc.) don't appear N times — once per repo.
  const displayLabels = useMemo(() => {
    if (repositoryFilter !== 'all') return labels;

    const map = new Map<string, LabelItem & { repoCount: number; repoNames: string[] }>();
    for (const label of labels) {
      const key = label.name.toLowerCase();
      const existing = map.get(key);
      const repoName = label.repository?.fullName ?? label.repositoryId;
      if (existing) {
        existing.issueCount += label.issueCount;
        existing.repoCount += 1;
        existing.repoNames.push(repoName);
      } else {
        map.set(key, { ...label, repoCount: 1, repoNames: [repoName] });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [labels, repositoryFilter]);

  const summary = useMemo(() => {
    const total = displayLabels.length;
    const withDescription = displayLabels.filter((item) => item.description).length;
    const linkedIssues = displayLabels.reduce((sum, item) => sum + item.issueCount, 0);
    const reposUsed = new Set(labels.map((item) => item.repositoryId)).size;

    return { total, withDescription, linkedIssues, reposUsed };
  }, [labels, displayLabels]);

  const handleCreateLabel = async () => {
    if (!state.token || !name.trim() || !createRepoId) {
      return;
    }

    setBusyKey('create');
    try {
      await createLabel(state.token, {
        name: name.trim(),
        color: color.trim().replace('#', ''),
        description: description.trim() || undefined,
        repositoryId: createRepoId
      });

      setName('');
      setColor(DEFAULT_LABEL_COLOR);
      setDescription('');
      setMessage('Label created successfully.');
      await loadLabels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create label.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleSyncLabels = async () => {
    if (!state.token || !syncRepoId) {
      return;
    }

    setBusyKey('sync');
    try {
      const result = await syncLabels(state.token, syncRepoId);
      setMessage(result.message || 'Labels synced successfully.');
      await loadLabels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to sync labels.');
    } finally {
      setBusyKey(null);
    }
  };

  const startEdit = (label: LabelItem) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setEditDescription(label.description || '');
  };

  const handleSaveEdit = async (labelId: string) => {
    if (!state.token) {
      return;
    }

    setBusyKey(`edit-${labelId}`);
    try {
      await updateLabel(state.token, labelId, {
        name: editName.trim() || undefined,
        color: editColor.trim().replace('#', '') || undefined,
        description: editDescription.trim() || undefined
      });

      setEditingId(null);
      setMessage('Label updated successfully.');
      await loadLabels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update label.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!state.token) {
      return;
    }

    setBusyKey(`delete-${labelId}`);
    try {
      await deleteLabel(state.token, labelId);
      setMessage('Label deleted successfully.');
      if (editingId === labelId) {
        setEditingId(null);
      }
      await loadLabels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete label.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="dv3-page labels-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="labels-main">
        <header className="labels-head">
          <div>
            <h2>Labels Management</h2>
            <p>Create, sync, and maintain repository labels from one place.</p>
          </div>
        </header>

        <section className="labels-summary">
          <article>
            <span>Total Labels</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <span>With Description</span>
            <strong>{summary.withDescription}</strong>
          </article>
          <article>
            <span>Linked Issues</span>
            <strong>{summary.linkedIssues}</strong>
          </article>
          <article>
            <span>Repositories</span>
            <strong>{summary.reposUsed}</strong>
          </article>
        </section>

        <section className="labels-create-card">
          <h3>Create Label</h3>
          <div className="labels-create-grid">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Label name" />
            <input
              value={color}
              onChange={(event) => setColor(event.target.value.replace('#', ''))}
              placeholder="Hex color (e.g. d73a4a)"
            />
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
            />
            <select value={createRepoId} onChange={(event) => setCreateRepoId(event.target.value)}>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                </option>
              ))}
            </select>
            <button type="button" disabled={busyKey === 'create'} onClick={() => void handleCreateLabel()}>
              {busyKey === 'create' ? 'Creating...' : 'Create'}
            </button>
          </div>
        </section>

        <section className="labels-sync-card">
          <h3>Sync from GitHub</h3>
          <div className="labels-sync-grid">
            <select value={syncRepoId} onChange={(event) => setSyncRepoId(event.target.value)}>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                </option>
              ))}
            </select>
            <button type="button" disabled={busyKey === 'sync'} onClick={() => void handleSyncLabels()}>
              {busyKey === 'sync' ? 'Syncing...' : 'Sync Labels'}
            </button>
          </div>
        </section>

        <section className="labels-list-card">
          <div className="labels-toolbar">
            <input
              value={search}
              onChange={(event) => {
                setLoading(true);
                setSearch(event.target.value);
              }}
              placeholder="Search labels"
            />
            <select
              value={repositoryFilter}
              onChange={(event) => {
                setLoading(true);
                setRepositoryFilter(event.target.value);
              }}
            >
              <option value="all">All Repositories</option>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="labels-info">Loading labels...</div>}
          {!loading && labels.length === 0 && <div className="labels-info">No labels found.</div>}

          {!loading && labels.length > 0 && (
            <div className="labels-list">
              {displayLabels.map((label) => {
                const grouped = repositoryFilter === 'all' && (label as any).repoCount > 1;
                const repoNames: string[] = (label as any).repoNames ?? [label.repository?.fullName ?? label.repositoryId];

                return (
                  <article key={label.id} className="label-item">
                    <div className="label-item-head">
                      <span className="label-chip" style={{ backgroundColor: `#${label.color}` }}>
                        {label.name}
                      </span>
                      {grouped ? (
                        <span className="label-repo-badge" title={repoNames.join(', ')}>
                          {repoNames.length} repos
                        </span>
                      ) : (
                        <small>{label.repository?.fullName || 'Unknown repository'}</small>
                      )}
                    </div>

                    {editingId === label.id ? (
                      <div className="label-item-edit-grid">
                        <input value={editName} onChange={(event) => setEditName(event.target.value)} />
                        <input value={editColor} onChange={(event) => setEditColor(event.target.value.replace('#', ''))} />
                        <input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
                        <div className="label-item-actions">
                          <button
                            type="button"
                            disabled={busyKey === `edit-${label.id}`}
                            onClick={() => void handleSaveEdit(label.id)}
                          >
                            Save
                          </button>
                          <button type="button" className="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{label.description || 'No description'}</p>
                        <div className="label-item-meta">
                          <span>Issues: {label.issueCount}</span>
                          {!grouped && <span>Created: {label.createdAt}</span>}
                        </div>
                        {!grouped && (
                          <div className="label-item-actions">
                            <button type="button" onClick={() => startEdit(label)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger"
                              disabled={busyKey === `delete-${label.id}`}
                              onClick={() => void handleDeleteLabel(label.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        {grouped && (
                          <div className="label-item-actions">
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => {
                                const repo = repositories.find((r) => repoNames.includes(r.fullName));
                                if (repo) setRepositoryFilter(repo.id);
                              }}
                            >
                              Filter by repo to edit
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {message && <div className="labels-message">{message}</div>}
      </main>
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import { createMilestone, getMilestones } from '../../controllers/ops.controller';
import { getRepositoriesOverview } from '../../controllers/repositories.controller';
import type { RepositoryItem } from '../../models/repositories.model';

type MilestoneItem = {
  id: string;
  title: string;
  state: 'open' | 'closed';
  dueOn?: string | null;
  repositoryId: string;
  openIssuesCount?: number;
};

export const MilestonesPage = () => {
  const { state } = useAuth();
  const [rows, setRows] = useState<MilestoneItem[]>([]);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [title, setTitle] = useState('');
  const [repositoryId, setRepositoryId] = useState('');
  const [dueOn, setDueOn] = useState('');

  useEffect(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    Promise.all([getMilestones(state.token), getRepositoriesOverview(state.token, { page: 1, limit: 100 })])
      .then(([milestonesResponse, repositoriesResponse]) => {
        const milestones = (milestonesResponse.data || []) as MilestoneItem[];
        const repos = repositoriesResponse.data || [];
        setRows(milestones);
        setRepositories(repos);
        setRepositoryId((current) => current || repos[0]?.id || '');
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load milestones.');
      })
      .finally(() => setLoading(false));
  }, [state.token]);

  const visibleRows = useMemo(() => {
    if (stateFilter === 'all') {
      return rows;
    }
    return rows.filter((item) => item.state === stateFilter);
  }, [rows, stateFilter]);

  const onCreate = async () => {
    if (!state.token || !title.trim() || !repositoryId) {
      setMessage('Title and repository are required.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await createMilestone(state.token, {
        title: title.trim(),
        repositoryId,
        state: 'open',
        dueOn: dueOn || undefined
      });
      setTitle('');
      setDueOn('');
      const refreshed = await getMilestones(state.token);
      setRows((refreshed.data || []) as MilestoneItem[]);
      setMessage('Milestone created successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create milestone.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dv3-page milestones-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="milestones-main">
        <header className="milestones-head">
          <div>
            <h2>Milestones</h2>
            <p>Track release milestones and delivery progress by repository.</p>
          </div>
        </header>

        <section className="milestones-create-card">
          <h3>Create Milestone</h3>
          <div className="milestones-create-grid">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Milestone title" />
            <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                </option>
              ))}
            </select>
            <input type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
            <button type="button" onClick={() => void onCreate()} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </section>

        <section className="milestones-list-card">
          <div className="milestones-toolbar">
            <span>Filter:</span>
            <button type="button" className={stateFilter === 'all' ? 'active' : ''} onClick={() => setStateFilter('all')}>
              All
            </button>
            <button
              type="button"
              className={stateFilter === 'open' ? 'active' : ''}
              onClick={() => setStateFilter('open')}
            >
              Open
            </button>
            <button
              type="button"
              className={stateFilter === 'closed' ? 'active' : ''}
              onClick={() => setStateFilter('closed')}
            >
              Closed
            </button>
          </div>

          {loading && <div className="milestones-info">Loading milestones...</div>}
          {!loading && visibleRows.length === 0 && <div className="milestones-info">No milestones found.</div>}

          {!loading && visibleRows.length > 0 && (
            <div className="milestones-list">
              {visibleRows.map((item) => (
                <article key={item.id}>
                  <h4>{item.title}</h4>
                  <p>State: {item.state}</p>
                  <p>Due: {item.dueOn ? new Date(item.dueOn).toLocaleDateString() : '—'}</p>
                  <p>Open issues: {item.openIssuesCount || 0}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {message && <div className="milestones-message">{message}</div>}
      </main>
    </div>
  );
};

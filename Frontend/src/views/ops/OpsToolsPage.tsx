import { useEffect, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  bulkActions,
  createMilestone,
  createTeam,
  exportData,
  getActivityLog,
  getHealth,
  getMilestones,
  getSettings,
  getTeams,
  globalSearch,
  setupWebhook,
  updateSettings
} from '../../controllers/ops.controller';

export const OpsToolsPage = () => {
  const { state } = useAuth();
  const [output, setOutput] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('bug');
  const [teamName, setTeamName] = useState('Core Team');
  const [teamDescription, setTeamDescription] = useState('Engineering team');
  const [milestoneTitle, setMilestoneTitle] = useState('Sprint Goal');
  const [milestoneRepoId, setMilestoneRepoId] = useState('');
  const [webhookRepoId, setWebhookRepoId] = useState('');
  const [website, setWebsite] = useState('https://example.com');
  const [bulkIssueIdsText, setBulkIssueIdsText] = useState('');

  useEffect(() => {
    getHealth()
      .then((result) => {
        setOutput(`Health:\n${JSON.stringify(result, null, 2)}`);
      })
      .catch(() => {
        setOutput('Health check failed.');
      });
  }, []);

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    try {
      const result = await action();
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setBusy(null);
    }
  };

  if (!state.token) {
    return null;
  }

  const bulkIssueIds = bulkIssueIdsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="dv3-page ops-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="ops-main">
        <header className="ops-head">
          <div>
            <h2>Ops Tools</h2>
            <p>Test additional APIs: milestones, settings, activity, search, export, bulk-actions, teams, webhooks.</p>
          </div>
        </header>

        <section className="ops-grid">
          <article>
            <h3>Settings</h3>
            <button type="button" disabled={busy === 'get-settings'} onClick={() => void run('get-settings', () => getSettings(state.token!))}>
              Get Settings
            </button>
            <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="Website URL" />
            <button type="button" disabled={busy === 'put-settings'} onClick={() => void run('put-settings', () => updateSettings(state.token!, { website }))}>
              Update Settings
            </button>
          </article>

          <article>
            <h3>Milestones</h3>
            <button type="button" disabled={busy === 'get-milestones'} onClick={() => void run('get-milestones', () => getMilestones(state.token!))}>
              Get Milestones
            </button>
            <input value={milestoneTitle} onChange={(event) => setMilestoneTitle(event.target.value)} placeholder="Milestone title" />
            <input
              value={milestoneRepoId}
              onChange={(event) => setMilestoneRepoId(event.target.value)}
              placeholder="Repository ID"
            />
            <button
              type="button"
              disabled={busy === 'create-milestone' || !milestoneRepoId.trim()}
              onClick={() =>
                void run('create-milestone', () =>
                  createMilestone(state.token!, {
                    title: milestoneTitle,
                    repositoryId: milestoneRepoId,
                    state: 'open'
                  })
                )
              }
            >
              Create Milestone
            </button>
          </article>

          <article>
            <h3>Search & Activity</h3>
            <button type="button" disabled={busy === 'activity'} onClick={() => void run('activity', () => getActivityLog(state.token!))}>
              Get Activity Log
            </button>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search query" />
            <button type="button" disabled={busy === 'search'} onClick={() => void run('search', () => globalSearch(state.token!, searchQuery))}>
              Global Search
            </button>
          </article>

          <article>
            <h3>Teams</h3>
            <button type="button" disabled={busy === 'get-teams'} onClick={() => void run('get-teams', () => getTeams(state.token!))}>
              Get Teams
            </button>
            <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" />
            <input
              value={teamDescription}
              onChange={(event) => setTeamDescription(event.target.value)}
              placeholder="Description"
            />
            <button
              type="button"
              disabled={busy === 'create-team'}
              onClick={() => void run('create-team', () => createTeam(state.token!, { name: teamName, description: teamDescription }))}
            >
              Create Team
            </button>
          </article>

          <article>
            <h3>Export & Bulk</h3>
            <button
              type="button"
              disabled={busy === 'export'}
              onClick={() => void run('export', () => exportData(state.token!, { format: 'json', entity: 'issues' }))}
            >
              Export Issues
            </button>
            <input
              value={bulkIssueIdsText}
              onChange={(event) => setBulkIssueIdsText(event.target.value)}
              placeholder="Issue IDs (comma separated)"
            />
            <button
              type="button"
              disabled={busy === 'bulk' || bulkIssueIds.length === 0}
              onClick={() =>
                void run('bulk', () =>
                  bulkActions(state.token!, {
                    issueIds: bulkIssueIds,
                    action: 'close'
                  })
                )
              }
            >
              Bulk Action (Sample)
            </button>
          </article>

          <article>
            <h3>Webhooks</h3>
            <input
              value={webhookRepoId}
              onChange={(event) => setWebhookRepoId(event.target.value)}
              placeholder="Repository ID"
            />
            <button
              type="button"
              disabled={busy === 'webhook' || !webhookRepoId.trim()}
              onClick={() =>
                void run('webhook', () =>
                  setupWebhook(state.token!, {
                    repositoryId: webhookRepoId
                  })
                )
              }
            >
              Setup Webhook
            </button>
          </article>
        </section>

        <section className="ops-output">
          <h3>API Output</h3>
          <pre>{output}</pre>
        </section>
      </main>
    </div>
  );
};

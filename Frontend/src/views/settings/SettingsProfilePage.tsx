import { useEffect, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import { getSettings, updateSettings } from '../../controllers/ops.controller';

type SettingsData = {
  name?: string | null;
  email?: string;
  githubLogin?: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  website?: string | null;
};

export const SettingsProfilePage = () => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<SettingsData>({});

  useEffect(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    getSettings(state.token)
      .then((response) => {
        setData((response.data || {}) as SettingsData);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load settings.');
      })
      .finally(() => setLoading(false));
  }, [state.token]);

  const onSave = async () => {
    if (!state.token) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: data.name || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        company: data.company || undefined,
        website: data.website || undefined
      };
      const response = await updateSettings(state.token, payload);
      setData((prev) => ({ ...prev, ...((response as { data?: SettingsData }).data || payload) }));
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const onResync = async () => {
    if (!state.token) {
      return;
    }

    setResyncing(true);
    setMessage(null);
    try {
      const response = await getSettings(state.token);
      setData((response.data || {}) as SettingsData);
      setMessage('GitHub profile synced.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to sync profile.');
    } finally {
      setResyncing(false);
    }
  };

  const displayName = data.name || data.githubLogin || state.user?.name || state.user?.login || 'DevFlow User';
  const displayRole = data.company || 'Senior Engineer';
  const handle = data.githubLogin ? `@${data.githubLogin}` : '@devflow-user';
  const avatarText = (displayName || 'D')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const profileStats = [
    { value: '42', label: 'Repos' },
    { value: '128', label: 'Issues' },
    { value: '5.2k', label: 'Stars' }
  ];
  const scopes = ['repo', 'user', 'workflow', 'notifications'];

  return (
    <div className="dv3-page settings-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="settings-main">
        <header className="settings-profile-head">
          <div className="settings-profile-avatar">
            {data.avatar ? <img src={data.avatar} alt={displayName} /> : <span>{avatarText}</span>}
          </div>
          <div className="settings-profile-title">
            <h2>{displayName}</h2>
            <div className="settings-profile-meta">
              <span>{handle}</span>
              <span className="settings-profile-role">{displayRole}</span>
            </div>
          </div>
        </header>

        {loading && <div className="settings-info">Loading settings...</div>}

        {!loading && (
          <>
            <section className="settings-profile-grid">
              <article className="settings-profile-card settings-profile-personal">
                <header>
                  <h3>Personal Info</h3>
                  <button type="button" onClick={() => setEditing((prev) => !prev)}>
                    {editing ? 'Cancel' : 'Edit'}
                  </button>
                </header>

                <div className="settings-profile-rows">
                  <label>
                    <span>Full Name</span>
                    {editing ? (
                      <input
                        value={data.name || ''}
                        onChange={(event) => setData((prev) => ({ ...prev, name: event.target.value }))}
                      />
                    ) : (
                      <strong>{data.name || displayName}</strong>
                    )}
                  </label>

                  <label>
                    <span>Email Address</span>
                    <strong>{data.email || 'No email available'}</strong>
                  </label>

                  <label>
                    <span>Bio</span>
                    {editing ? (
                      <textarea
                        value={data.bio || ''}
                        onChange={(event) => setData((prev) => ({ ...prev, bio: event.target.value }))}
                      />
                    ) : (
                      <p>
                        {data.bio ||
                          'Senior Software Engineer with a passion for building high-performance developer tools and automation workflows.'}
                      </p>
                    )}
                  </label>
                </div>

                {editing && (
                  <div className="settings-actions">
                    <button type="button" onClick={() => void onSave()} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </article>

              <article className="settings-profile-card settings-profile-github">
                <header>
                  <h3>GitHub Connection</h3>
                </header>

                <div className="settings-gh-identity">
                  <div className="settings-gh-user">
                    <div className="settings-gh-avatar">
                      {data.avatar ? <img src={data.avatar} alt={displayName} /> : <span>{avatarText}</span>}
                    </div>
                    <div>
                      <strong>{data.githubLogin || 'github-user'}</strong>
                      <p>Connected since Jan 2023</p>
                    </div>
                  </div>
                  <span className="settings-gh-badge">Active</span>
                </div>

                <div className="settings-gh-scopes">
                  <span>Granted Scopes</span>
                  <div>
                    {scopes.map((scope) => (
                      <em key={scope}>{scope}</em>
                    ))}
                  </div>
                </div>

                <div className="settings-gh-actions">
                  <button type="button" onClick={() => void onResync()} disabled={resyncing}>
                    {resyncing ? 'Syncing...' : 'Re-sync GitHub'}
                  </button>
                  <p>Last synced: just now. Your data is encrypted and secure.</p>
                </div>
              </article>
            </section>

            <section className="settings-profile-footer">
              {profileStats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </section>

            {message && <div className="settings-message">{message}</div>}
          </>
        )}
      </main>
    </div>
  );
};

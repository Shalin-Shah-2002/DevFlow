import { useCallback, useEffect, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  applySavedView,
  createSavedView,
  deleteSavedView,
  getSavedViews,
  type SavedView,
  updateSavedView
} from '../../controllers/views.controller';

export const SavedViewsPage = () => {
  const { state } = useAuth();
  const [rows, setRows] = useState<SavedView[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [filtersText, setFiltersText] = useState('{"state":"open"}');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    try {
      const views = await getSavedViews(state.token);
      setRows(views.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load saved views.');
    } finally {
      setLoading(false);
    }
  }, [state.token]);

  useEffect(() => {
    void load();
  }, [load]);

  const parseFilters = (): Record<string, unknown> => {
    try {
      const parsed = JSON.parse(filtersText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  };

  const onCreate = async () => {
    if (!state.token || !name.trim()) {
      return;
    }

    try {
      JSON.parse(filtersText);
    } catch {
      setMessage('Filters must be valid JSON.');
      return;
    }

    setBusy('create');
    try {
      await createSavedView(state.token, {
        name: name.trim(),
        filters: parseFilters()
      });
      setName('');
      setFiltersText('{"state":"open"}');
      setCreateOpen(false);
      setMessage('Saved view created.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create view.');
    } finally {
      setBusy(null);
    }
  };

  const onApply = async (id: string) => {
    if (!state.token) {
      return;
    }

    setBusy(`apply-${id}`);
    try {
      const result = await applySavedView(state.token, id);
      setResultText(`Applied successfully. Matching issues: ${result.total}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to apply view.');
    } finally {
      setBusy(null);
    }
  };

  const onSetDefault = async (id: string) => {
    if (!state.token) {
      return;
    }

    setBusy(`default-${id}`);
    try {
      await updateSavedView(state.token, id, { isDefault: true });
      setMessage('Default view updated.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update view.');
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!state.token) {
      return;
    }

    setBusy(`delete-${id}`);
    try {
      await deleteSavedView(state.token, id);
      setMessage('Saved view deleted.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete view.');
    } finally {
      setBusy(null);
    }
  };

  const onEdit = async (item: SavedView) => {
    if (!state.token) {
      return;
    }

    const nextName = window.prompt('View name', item.name);
    if (!nextName) {
      return;
    }

    const currentFilters = JSON.stringify(item.filters);
    const nextFiltersText = window.prompt('Filters JSON', currentFilters);
    if (!nextFiltersText) {
      return;
    }

    let parsedFilters: Record<string, unknown>;
    try {
      const parsed = JSON.parse(nextFiltersText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setMessage('Filters must be a valid JSON object.');
        return;
      }
      parsedFilters = parsed as Record<string, unknown>;
    } catch {
      setMessage('Filters must be valid JSON.');
      return;
    }

    setBusy(`edit-${item.id}`);
    try {
      await updateSavedView(state.token, item.id, {
        name: nextName.trim(),
        filters: parsedFilters
      });
      setMessage('Saved view updated.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update view.');
    } finally {
      setBusy(null);
    }
  };

  const toFilterChips = (filters: Record<string, unknown>) => {
    return Object.entries(filters)
      .slice(0, 4)
      .map(([key, value]) => `${key}: ${String(value)}`);
  };

  return (
    <div className="dv3-page saved-views-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="saved-views-main">
        <header className="saved-views-head">
          <div>
            <h2>Saved Views Manager</h2>
            <p>Create, organize, and quickly apply reusable issue filters.</p>
          </div>
          <button type="button" className="saved-views-primary" onClick={() => setCreateOpen((current) => !current)}>
            {createOpen ? 'Close' : '+ Create New View'}
          </button>
        </header>

        {createOpen && (
          <section className="saved-views-create">
            <h3>Create View</h3>
            <div className="saved-views-create-grid">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="View name" />
              <textarea
                value={filtersText}
                onChange={(event) => setFiltersText(event.target.value)}
                placeholder='{"state":"open","priority":["P1"]}'
                rows={3}
              />
              <button type="button" onClick={() => void onCreate()} disabled={busy === 'create'}>
                {busy === 'create' ? 'Creating…' : 'Create'}
              </button>
            </div>
          </section>
        )}

        {message && <div className="saved-views-message">{message}</div>}
        {resultText && <div className="saved-views-result">{resultText}</div>}

        {loading && <div className="saved-views-info">Loading saved views...</div>}
        {!loading && rows.length === 0 && <div className="saved-views-info">No saved views found.</div>}

        {!loading && (
          <section className="saved-views-list">
            {rows.map((item) => (
              <article key={item.id} className="saved-view-item">
                <div className="saved-view-head">
                  <div className="saved-view-title-wrap">
                    <span className="saved-view-icon">▦</span>
                    <div>
                      <h3>
                        {item.name} {item.isDefault ? <span className="saved-view-default">Default</span> : null}
                      </h3>
                      <small>Last updated {item.updatedAt}</small>
                    </div>
                  </div>

                  <div className="saved-view-actions">
                    <button type="button" onClick={() => void onEdit(item)} disabled={busy === `edit-${item.id}`}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void onDelete(item.id)}
                      disabled={busy === `delete-${item.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="saved-view-tags">
                  {toFilterChips(item.filters).map((chip) => (
                    <span key={`${item.id}-${chip}`}>{chip}</span>
                  ))}
                </div>

                <div className="saved-view-foot">
                  {!item.isDefault ? (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => void onSetDefault(item.id)}
                      disabled={busy === `default-${item.id}`}
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="saved-view-default-note">Default workspace view</span>
                  )}
                  <button type="button" onClick={() => void onApply(item.id)} disabled={busy === `apply-${item.id}`}>
                    {busy === `apply-${item.id}` ? 'Applying…' : 'Apply view →'}
                  </button>
                </div>
              </article>
            ))}

            <article className="saved-view-item saved-view-item-create" onClick={() => setCreateOpen(true)}>
              <div className="saved-view-create-icon">+</div>
              <h3>Create New Custom View</h3>
            </article>
          </section>
        )}
      </main>
    </div>
  );
};

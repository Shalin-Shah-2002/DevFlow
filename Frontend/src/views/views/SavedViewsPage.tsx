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
  const [name, setName] = useState('');
  const [filtersText, setFiltersText] = useState('{"status":"OPEN"}');
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
      setRows(views);
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

    setBusy('create');
    try {
      await createSavedView(state.token, {
        name: name.trim(),
        filters: parseFilters()
      });
      setName('');
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

  return (
    <div className="dv3-page saved-views-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="saved-views-main">
        <header className="saved-views-head">
          <div>
            <h2>Saved Views</h2>
            <p>Create, apply, and manage reusable issue filters.</p>
          </div>
        </header>

        <section className="saved-views-create">
          <h3>Create View</h3>
          <div className="saved-views-create-grid">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="View name" />
            <textarea
              value={filtersText}
              onChange={(event) => setFiltersText(event.target.value)}
              placeholder='{"status":"OPEN","priority":"P1"}'
              rows={3}
            />
            <button type="button" onClick={() => void onCreate()} disabled={busy === 'create'}>
              Create
            </button>
          </div>
        </section>

        {message && <div className="saved-views-message">{message}</div>}
        {resultText && <div className="saved-views-result">{resultText}</div>}

        {loading && <div className="saved-views-info">Loading saved views...</div>}
        {!loading && rows.length === 0 && <div className="saved-views-info">No saved views found.</div>}

        {!loading && rows.length > 0 && (
          <section className="saved-views-list">
            {rows.map((item) => (
              <article key={item.id} className="saved-view-item">
                <div>
                  <h3>
                    {item.name} {item.isDefault ? <span className="saved-view-default">Default</span> : null}
                  </h3>
                  <p>{JSON.stringify(item.filters)}</p>
                  <small>Updated: {item.updatedAt}</small>
                </div>
                <div className="saved-view-actions">
                  <button type="button" onClick={() => void onApply(item.id)} disabled={busy === `apply-${item.id}`}>
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => void onSetDefault(item.id)}
                    disabled={busy === `default-${item.id}`}
                  >
                    Set Default
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
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

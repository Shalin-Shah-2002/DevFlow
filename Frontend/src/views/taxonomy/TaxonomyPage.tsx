import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import { createLabel, deleteLabel, getLabels, syncLabels, updateLabel } from '../../controllers/labels.controller';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../controllers/categories.controller';
import { getRepositoriesOverview } from '../../controllers/repositories.controller';
import type { LabelItem } from '../../models/labels.model';
import type { CategoryItem } from '../../models/categories.model';

type TaxonomyTab = 'labels' | 'categories';

const DEFAULT_LABEL_COLOR = 'ef4444';
const DEFAULT_CATEGORY_COLOR = '3b82f6';

export const TaxonomyPage = () => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState<TaxonomyTab>('labels');
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [defaultRepoId, setDefaultRepoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState(DEFAULT_LABEL_COLOR);
  const [labelDescription, setLabelDescription] = useState('');

  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(DEFAULT_CATEGORY_COLOR);

  const loadData = useCallback(async () => {
    if (!state.token) {
      return;
    }

    const [labelsResponse, categoriesResponse, repositoriesResponse] = await Promise.all([
      getLabels(state.token, {
        page: 1,
        pageSize: 200,
        sortBy: 'name',
        sortOrder: 'asc'
      }),
      getCategories(state.token),
      getRepositoriesOverview(state.token, {
        page: 1,
        limit: 100
      })
    ]);

    const repos = repositoriesResponse.data || [];
    setLabels(labelsResponse.labels || []);
    setCategories(categoriesResponse || []);

    if (repos.length > 0 && !defaultRepoId) {
      setDefaultRepoId(repos[0].id);
    }
  }, [state.token, defaultRepoId]);

  useEffect(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    loadData()
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load taxonomy data.');
      })
      .finally(() => setLoading(false));
  }, [state.token, loadData]);

  const topCategories = useMemo(
    () => [...categories].sort((first, second) => second.issueCount - first.issueCount).slice(0, 3),
    [categories]
  );

  const handleSyncLabels = async () => {
    if (!state.token || !defaultRepoId) {
      setMessage('No repository available to sync labels.');
      return;
    }

    setBusyKey('sync');
    try {
      const result = await syncLabels(state.token, defaultRepoId);
      setMessage(result.message || 'Labels synced successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to sync labels.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateLabel = async () => {
    if (!state.token || !defaultRepoId || !labelName.trim()) {
      return;
    }

    setBusyKey('create-label');
    try {
      await createLabel(state.token, {
        name: labelName.trim(),
        color: labelColor.trim().replace('#', ''),
        description: labelDescription.trim() || undefined,
        repositoryId: defaultRepoId
      });
      setLabelName('');
      setLabelColor(DEFAULT_LABEL_COLOR);
      setLabelDescription('');
      setCreateLabelOpen(false);
      setMessage('Label created successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create label.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleEditLabel = async (label: LabelItem) => {
    if (!state.token) {
      return;
    }

    const nextName = window.prompt('Label name', label.name);
    if (!nextName) {
      return;
    }

    const nextColor = window.prompt('Label color (hex without #)', label.color) || label.color;
    const nextDescription = window.prompt('Description', label.description || '') || '';

    setBusyKey(`edit-label-${label.id}`);
    try {
      await updateLabel(state.token, label.id, {
        name: nextName.trim(),
        color: nextColor.trim().replace('#', ''),
        description: nextDescription.trim() || undefined
      });
      setMessage('Label updated successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update label.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!state.token || !window.confirm('Delete this label?')) {
      return;
    }

    setBusyKey(`delete-label-${labelId}`);
    try {
      await deleteLabel(state.token, labelId);
      setMessage('Label deleted successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete label.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!state.token || !categoryName.trim()) {
      return;
    }

    setBusyKey('create-category');
    try {
      await createCategory(state.token, {
        name: categoryName.trim(),
        color: categoryColor.trim().replace('#', '')
      });
      setCategoryName('');
      setCategoryColor(DEFAULT_CATEGORY_COLOR);
      setCreateCategoryOpen(false);
      setMessage('Category created successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create category.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleEditCategory = async (category: CategoryItem) => {
    if (!state.token) {
      return;
    }

    const nextName = window.prompt('Category name', category.name);
    if (!nextName) {
      return;
    }

    const nextColor = window.prompt('Category color (hex without #)', category.color) || category.color;

    setBusyKey(`edit-category-${category.id}`);
    try {
      await updateCategory(state.token, category.id, {
        name: nextName.trim(),
        color: nextColor.trim().replace('#', '')
      });
      setMessage('Category updated successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update category.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!state.token || !window.confirm('Delete this category?')) {
      return;
    }

    setBusyKey(`delete-category-${categoryId}`);
    try {
      await deleteCategory(state.token, categoryId);
      setMessage('Category deleted successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete category.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="dv3-page taxonomy-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="taxonomy-main">
        <header className="taxonomy-head">
          <div>
            <h2>Labels &amp; Categories</h2>
            <p>
              Refine your issue tracking with structured taxonomies. Sync with external repositories or create local
              organizational units.
            </p>
          </div>
        </header>

        <section className="taxonomy-tabs-bar">
          <div className="taxonomy-tabs">
            <button
              type="button"
              className={activeTab === 'labels' ? 'active' : ''}
              onClick={() => setActiveTab('labels')}
            >
              Labels
            </button>
            <button
              type="button"
              className={activeTab === 'categories' ? 'active' : ''}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>

          {activeTab === 'labels' && (
            <div className="taxonomy-actions">
              <button type="button" className="secondary" disabled={busyKey === 'sync'} onClick={() => void handleSyncLabels()}>
                {busyKey === 'sync' ? 'Syncing…' : 'Sync from GitHub'}
              </button>
              <button type="button" onClick={() => setCreateLabelOpen((current) => !current)}>
                {createLabelOpen ? 'Close' : '+ Create Label'}
              </button>
            </div>
          )}
        </section>

        {createLabelOpen && (
          <section className="taxonomy-create-form">
            <input value={labelName} onChange={(event) => setLabelName(event.target.value)} placeholder="Label name" />
            <input
              value={labelColor}
              onChange={(event) => setLabelColor(event.target.value.replace('#', ''))}
              placeholder="Color (hex)"
            />
            <input
              value={labelDescription}
              onChange={(event) => setLabelDescription(event.target.value)}
              placeholder="Description (optional)"
            />
            <button type="button" disabled={busyKey === 'create-label'} onClick={() => void handleCreateLabel()}>
              {busyKey === 'create-label' ? 'Creating…' : 'Create Label'}
            </button>
          </section>
        )}

        <section className="taxonomy-table-card">
          {loading && <div className="taxonomy-info">Loading taxonomy data...</div>}

          {!loading && activeTab === 'labels' && (
            <>
              {labels.length === 0 ? (
                <div className="taxonomy-info">No labels found.</div>
              ) : (
                <table className="taxonomy-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>COLOR SWATCH</th>
                      <th>ISSUE COUNT</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((label) => (
                      <tr key={label.id}>
                        <td>
                          <span className="taxonomy-label-chip" style={{ backgroundColor: `#${label.color}` }}>
                            {label.name}
                          </span>
                        </td>
                        <td>
                          <span className="taxonomy-color-meta">
                            <span className="taxonomy-color-dot" style={{ backgroundColor: `#${label.color}` }} />
                            #{label.color.toUpperCase()}
                          </span>
                        </td>
                        <td>{label.issueCount} issues</td>
                        <td>
                          <div className="taxonomy-row-actions">
                            <button
                              type="button"
                              className="icon"
                              disabled={busyKey === `edit-label-${label.id}`}
                              onClick={() => void handleEditLabel(label)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="icon danger"
                              disabled={busyKey === `delete-label-${label.id}`}
                              onClick={() => void handleDeleteLabel(label.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {!loading && activeTab === 'categories' && (
            <>
              {categories.length === 0 ? (
                <div className="taxonomy-info">No categories found.</div>
              ) : (
                <table className="taxonomy-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>COLOR SWATCH</th>
                      <th>ISSUE COUNT</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <span className="taxonomy-category-name">
                            <span className="taxonomy-color-dot" style={{ backgroundColor: `#${category.color}` }} />
                            {category.name}
                          </span>
                        </td>
                        <td>
                          <span className="taxonomy-color-meta">
                            <span className="taxonomy-color-dot" style={{ backgroundColor: `#${category.color}` }} />
                            #{category.color.toUpperCase()}
                          </span>
                        </td>
                        <td>{category.issueCount} issues</td>
                        <td>
                          <div className="taxonomy-row-actions">
                            <button
                              type="button"
                              className="icon"
                              disabled={busyKey === `edit-category-${category.id}`}
                              onClick={() => void handleEditCategory(category)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="icon danger"
                              disabled={busyKey === `delete-category-${category.id}`}
                              onClick={() => void handleDeleteCategory(category.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>

        <section className="taxonomy-categories-head">
          <h3>Top Categories</h3>
          <button type="button" className="taxonomy-link" onClick={() => setActiveTab('categories')}>
            View all categories ›
          </button>
        </section>

        <section className="taxonomy-categories-grid">
          {topCategories.map((category) => (
            <article key={category.id} className="taxonomy-category-card">
              <header>
                <div className="taxonomy-category-title">
                  <span className="taxonomy-color-dot" style={{ backgroundColor: `#${category.color}` }} />
                  <strong>{category.name}</strong>
                </div>
                <span className="taxonomy-active-badge">{category.issueCount} Active</span>
              </header>

              <p>Track related workstreams and prioritize grouped issues efficiently.</p>

              <footer>
                <div className="taxonomy-color-stack">
                  <span style={{ backgroundColor: `#${category.color}` }} />
                  <span style={{ backgroundColor: `#${category.color}99` }} />
                  <span style={{ backgroundColor: `#${category.color}66` }} />
                </div>
                <div className="taxonomy-row-actions">
                  <button type="button" className="icon" onClick={() => void handleEditCategory(category)}>
                    Edit
                  </button>
                  <button type="button" className="icon danger" onClick={() => void handleDeleteCategory(category.id)}>
                    Delete
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        <section className="taxonomy-empty-card">
          <p className="title">Need more structure?</p>
          <p>Create high-level categories to group related labels and streamline your workflow filtering.</p>
          <button type="button" onClick={() => setCreateCategoryOpen((current) => !current)}>
            Add New Category
          </button>

          {createCategoryOpen && (
            <div className="taxonomy-create-form category">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Category name"
              />
              <input
                value={categoryColor}
                onChange={(event) => setCategoryColor(event.target.value.replace('#', ''))}
                placeholder="Color (hex)"
              />
              <button type="button" disabled={busyKey === 'create-category'} onClick={() => void handleCreateCategory()}>
                {busyKey === 'create-category' ? 'Creating…' : 'Create Category'}
              </button>
            </div>
          )}
        </section>

        {message && <div className="taxonomy-message">{message}</div>}
      </main>
    </div>
  );
};

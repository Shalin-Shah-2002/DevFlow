import { useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '../../controllers/categories.controller';
import type { CategoryItem } from '../../models/categories.model';

const DEFAULT_CATEGORY_COLOR = '0ea5e9';

export const CategoriesManagementPage = () => {
  const { state } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadCategories = async () => {
    if (!state.token) {
      return;
    }

    const response = await getCategories(state.token);
    setCategories(response);
  };

  useEffect(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    loadCategories()
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load categories.');
      })
      .finally(() => setLoading(false));
  }, [state.token]);

  const visibleCategories = useMemo(() => {
    if (!search.trim()) {
      return categories;
    }

    const query = search.toLowerCase();
    return categories.filter((item) => item.name.toLowerCase().includes(query));
  }, [categories, search]);

  const summary = useMemo(() => {
    const total = categories.length;
    const withIssues = categories.filter((item) => item.issueCount > 0).length;
    const linkedIssues = categories.reduce((sum, item) => sum + item.issueCount, 0);
    const newest = categories[0]?.createdAt || '—';

    return { total, withIssues, linkedIssues, newest };
  }, [categories]);

  const handleCreateCategory = async () => {
    if (!state.token || !name.trim()) {
      return;
    }

    setBusyKey('create');
    try {
      await createCategory(state.token, {
        name: name.trim(),
        color: color.trim().replace('#', '')
      });
      setName('');
      setColor(DEFAULT_CATEGORY_COLOR);
      setMessage('Category created successfully.');
      await loadCategories();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create category.');
    } finally {
      setBusyKey(null);
    }
  };

  const startEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!state.token) {
      return;
    }

    setBusyKey(`edit-${categoryId}`);
    try {
      await updateCategory(state.token, categoryId, {
        name: editName.trim() || undefined,
        color: editColor.trim().replace('#', '') || undefined
      });
      setEditingId(null);
      setMessage('Category updated successfully.');
      await loadCategories();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update category.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!state.token) {
      return;
    }

    setBusyKey(`delete-${categoryId}`);
    try {
      await deleteCategory(state.token, categoryId);
      setMessage('Category deleted successfully.');
      if (editingId === categoryId) {
        setEditingId(null);
      }
      await loadCategories();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete category.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="dv3-page categories-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="categories-main">
        <header className="categories-head">
          <div>
            <h2>Categories Management</h2>
            <p>Organize issue groups with custom categories for planning and reporting.</p>
          </div>
        </header>

        <section className="categories-summary">
          <article>
            <span>Total Categories</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <span>With Issues</span>
            <strong>{summary.withIssues}</strong>
          </article>
          <article>
            <span>Linked Issues</span>
            <strong>{summary.linkedIssues}</strong>
          </article>
          <article>
            <span>Latest Update</span>
            <strong>{summary.newest}</strong>
          </article>
        </section>

        <section className="categories-create-card">
          <h3>Create Category</h3>
          <div className="categories-create-grid">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" />
            <input
              value={color}
              onChange={(event) => setColor(event.target.value.replace('#', ''))}
              placeholder="Hex color (e.g. ff0000)"
            />
            <button type="button" disabled={busyKey === 'create'} onClick={() => void handleCreateCategory()}>
              {busyKey === 'create' ? 'Creating...' : 'Create'}
            </button>
          </div>
        </section>

        <section className="categories-list-card">
          <div className="categories-toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
            />
          </div>

          {loading && <div className="categories-info">Loading categories...</div>}
          {!loading && visibleCategories.length === 0 && <div className="categories-info">No categories found.</div>}

          {!loading && visibleCategories.length > 0 && (
            <div className="categories-grid">
              {visibleCategories.map((category) => (
                <article key={category.id} className="category-item">
                  {editingId === category.id ? (
                    <div className="category-edit-grid">
                      <input value={editName} onChange={(event) => setEditName(event.target.value)} />
                      <input value={editColor} onChange={(event) => setEditColor(event.target.value.replace('#', ''))} />
                      <div className="category-item-actions">
                        <button
                          type="button"
                          disabled={busyKey === `edit-${category.id}`}
                          onClick={() => void handleSaveEdit(category.id)}
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
                      <div className="category-item-head">
                        <span className="category-dot" style={{ backgroundColor: `#${category.color}` }} />
                        <strong>{category.name}</strong>
                      </div>
                      <div className="category-item-meta">
                        <span>Issues: {category.issueCount}</span>
                        <span>Created: {category.createdAt}</span>
                      </div>
                      <div className="category-item-actions">
                        <button type="button" onClick={() => startEdit(category)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          disabled={busyKey === `delete-${category.id}`}
                          onClick={() => void handleDelete(category.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {message && <div className="categories-message">{message}</div>}
      </main>
    </div>
  );
};

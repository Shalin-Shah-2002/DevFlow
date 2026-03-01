import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addIssueCategories,
  addIssueComment,
  getIssueDetail,
  manageIssueLabels,
  removeIssueCategory,
  updateIssueDetails
} from '../../controllers/issues.controller';
import type { IssueDetailItem } from '../../models/issues.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { getCategories } from '../../controllers/categories.controller';
import type { CategoryItem } from '../../models/categories.model';
import { getLabels } from '../../controllers/labels.controller';
import type { LabelItem } from '../../models/labels.model';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const IssueDetailPage = () => {
  const { state } = useAuth();
  const { issueId = '' } = useParams();
  const [issue, setIssue] = useState<IssueDetailItem | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedLabelName, setSelectedLabelName] = useState('');
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3' | ''>('');
  const [customStatus, setCustomStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssueData = async () => {
    if (!state.token || !issueId) {
      return;
    }

    const payload = await getIssueDetail(state.token, issueId);
    setIssue(payload);
    setPriority((payload.priority as 'P0' | 'P1' | 'P2' | 'P3' | undefined) || '');
    setCustomStatus(payload.customStatus || '');

    try {
      if (payload.repository?.id) {
        const labelsResponse = await getLabels(state.token, {
          repositoryId: payload.repository.id,
          page: 1,
          pageSize: 200,
          sortBy: 'name',
          sortOrder: 'asc'
        });

        setAvailableLabels(labelsResponse.labels || []);
      } else {
        setAvailableLabels([]);
      }
    } catch {
      setAvailableLabels([]);
    }
  };

  const labelOptions = useMemo(() => {
    const names = new Set<string>();

    availableLabels.forEach((label) => {
      if (label.name) {
        names.add(label.name);
      }
    });

    issue?.labels?.forEach((label) => {
      if (label.name) {
        names.add(label.name);
      }
    });

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [availableLabels, issue?.labels]);

  useEffect(() => {
    if (!selectedLabelName && labelOptions.length > 0) {
      setSelectedLabelName(labelOptions[0]);
    }
  }, [labelOptions, selectedLabelName]);

  useEffect(() => {
    if (!state.token || !issueId) {
      return;
    }

    Promise.all([loadIssueData(), getCategories(state.token)])
      .then(([, categoriesPayload]) => {
        setError(null);
        setCategories(categoriesPayload || []);
        if ((categoriesPayload || []).length > 0) {
          setSelectedCategoryId(categoriesPayload[0].id);
        }
      })
      .catch(() => setError('Failed to load issue detail.'))
      .finally(() => setLoading(false));
  }, [state.token, issueId]);

  const handleSaveIssueFields = async () => {
    if (!state.token || !issue) {
      return;
    }

    setSavingKey('fields');
    try {
      const updated = await updateIssueDetails(state.token, issue.id, {
        ...(priority ? { priority } : {}),
        customStatus: customStatus.trim() || undefined
      });

      setIssue(updated);
      setMessage('Issue fields updated successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to update issue fields.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddComment = async () => {
    if (!state.token || !issue || !newComment.trim()) {
      return;
    }

    setSavingKey('comment');
    try {
      await addIssueComment(state.token, issue.id, newComment.trim());
      setNewComment('');
      await loadIssueData();
      setMessage('Comment added successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to add comment.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddCategory = async () => {
    if (!state.token || !issue || !selectedCategoryId) {
      return;
    }

    setSavingKey('category-add');
    try {
      await addIssueCategories(state.token, issue.id, [selectedCategoryId]);
      await loadIssueData();
      setMessage('Category added successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to add category.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    if (!state.token || !issue) {
      return;
    }

    setSavingKey(`category-remove-${categoryId}`);
    try {
      await removeIssueCategory(state.token, issue.id, categoryId);
      await loadIssueData();
      setMessage('Category removed successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to remove category.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddLabel = async () => {
    if (!state.token || !issue || !selectedLabelName) {
      return;
    }

    setSavingKey('label-add');
    try {
      await manageIssueLabels(state.token, issue.id, [selectedLabelName], 'add');
      await loadIssueData();
      setMessage('Label added successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to add label.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemoveLabel = async (labelName: string) => {
    if (!state.token || !issue) {
      return;
    }

    setSavingKey(`label-remove-${labelName}`);
    try {
      await manageIssueLabels(state.token, issue.id, [labelName], 'remove');
      await loadIssueData();
      setMessage('Label removed successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to remove label.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="dv3-page issues-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="issue-detail-main">
        <header className="issue-detail-head">
          <Link to="/app/issues">← Back to Issues</Link>
          {issue && <span>#{issue.number}</span>}
        </header>

        {loading && <div className="issues-info">Loading issue details...</div>}
        {error && <div className="issues-info issues-error">{error}</div>}

        {!loading && !error && issue && (
          <section className="issue-detail-card">
            <div className="issue-detail-title">
              <h2>{issue.title}</h2>
              <span className={issue.state === 'open' ? 'badge-open' : 'badge-closed'}>{issue.state}</span>
            </div>

            <div className="issue-detail-body md-content">
              {issue.body ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.body}</ReactMarkdown>
              ) : (
                <p>No description provided for this issue.</p>
              )}
            </div>

            <div className="issue-detail-meta-grid">
              <article>
                <h4>Repository</h4>
                <p>{issue.repository.fullName}</p>
              </article>
              <article>
                <h4>Priority</h4>
                <p>{issue.priority || 'Not set'}</p>
              </article>
              <article>
                <h4>Custom Status</h4>
                <p>{issue.customStatus || 'None'}</p>
              </article>
              <article>
                <h4>Updated</h4>
                <p>{issue.githubUpdatedAt || '—'}</p>
              </article>
            </div>

            <section className="issue-detail-actions">
              <h4>Update Issue Details</h4>
              <div className="issue-detail-actions-grid">
                <select value={priority} onChange={(event) => setPriority(event.target.value as 'P0' | 'P1' | 'P2' | 'P3' | '')}>
                  <option value="">No Priority</option>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
                <input
                  value={customStatus}
                  onChange={(event) => setCustomStatus(event.target.value)}
                  placeholder="Custom status"
                />
                <button
                  type="button"
                  disabled={savingKey === 'fields'}
                  onClick={() => void handleSaveIssueFields()}
                >
                  {savingKey === 'fields' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </section>

            <section className="issue-detail-categories">
              <h4>Categories</h4>
              <div className="issue-detail-category-row">
                <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={savingKey === 'category-add' || !selectedCategoryId}
                  onClick={() => void handleAddCategory()}
                >
                  {savingKey === 'category-add' ? 'Adding...' : 'Add Category'}
                </button>
              </div>

              <div className="issue-detail-category-chips">
                {issue.categories && issue.categories.length > 0 ? (
                  issue.categories.map((category) => (
                    <span key={category.id} className="issue-category-chip">
                      {category.name}
                      <button
                        type="button"
                        disabled={savingKey === `category-remove-${category.id}`}
                        onClick={() => void handleRemoveCategory(category.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="issues-info">No categories assigned.</span>
                )}
              </div>
            </section>

            <div className="issue-detail-labels">
              <h4>Labels</h4>
              <div className="issue-detail-label-row">
                <select value={selectedLabelName} onChange={(event) => setSelectedLabelName(event.target.value)}>
                  {labelOptions.length === 0 ? (
                    <option value="">No labels available</option>
                  ) : (
                    labelOptions.map((labelName) => (
                      <option key={labelName} value={labelName}>
                        {labelName}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  disabled={savingKey === 'label-add' || !selectedLabelName || labelOptions.length === 0}
                  onClick={() => void handleAddLabel()}
                >
                  {savingKey === 'label-add' ? 'Adding...' : 'Add Label'}
                </button>
              </div>
              <div>
                {issue.labels.length > 0 ? (
                  issue.labels.map((label) => (
                    <span key={label.id} className="issue-label-chip">
                      {label.name}
                      <button
                        type="button"
                        disabled={savingKey === `label-remove-${label.name}`}
                        onClick={() => void handleRemoveLabel(label.name)}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span>No labels</span>
                )}
              </div>
            </div>

            <div className="issue-detail-comments">
              <h4>Comments ({issue.comments?.length || 0})</h4>

              <div className="issue-detail-comment-form">
                <textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Add a new comment"
                  rows={3}
                />
                <button
                  type="button"
                  disabled={savingKey === 'comment' || !newComment.trim()}
                  onClick={() => void handleAddComment()}
                >
                  {savingKey === 'comment' ? 'Posting...' : 'Add Comment'}
                </button>
              </div>

              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <article key={comment.id}>
                    <header>
                      <strong>{comment.user?.name || comment.user?.githubLogin || 'Contributor'}</strong>
                      <span>{comment.createdAt}</span>
                    </header>
                    <div className="md-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body}</ReactMarkdown>
                    </div>
                  </article>
                ))
              ) : (
                <p className="issues-info">No comments available.</p>
              )}
            </div>

            {message && <div className="issue-detail-message">{message}</div>}
          </section>
        )}
      </main>
    </div>
  );
};

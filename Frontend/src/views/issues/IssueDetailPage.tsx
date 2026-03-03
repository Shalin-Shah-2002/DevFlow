import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const loadIssueData = useCallback(async () => {
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
  }, [state.token, issueId]);

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
  }, [state.token, issueId, loadIssueData]);

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

  const handleToggleIssueState = async () => {
    if (!state.token || !issue) {
      return;
    }

    const nextState = issue.state === 'open' ? 'closed' : 'open';
    const stateReason = nextState === 'closed' ? 'completed' : 'reopened';

    setSavingKey('state');
    try {
      const updated = await updateIssueDetails(state.token, issue.id, {
        state: nextState,
        stateReason
      });

      setIssue(updated);
      setMessage(nextState === 'closed' ? 'Issue closed successfully.' : 'Issue reopened successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Failed to update issue state.');
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

  const formatTimelineMeta = () => {
    if (!issue) {
      return 'Unknown author opened this recently';
    }

    const author = issue.assignees?.[0]?.githubLogin || issue.assignees?.[0]?.name || 'Contributor';
    return `${author} opened this issue • ${issue.comments?.length || 0} comments`;
  };

  const primaryCategory = issue?.categories?.[0]?.name || 'Uncategorized';
  const isOpen = issue?.state === 'open';

  return (
    <div className="dv3-page issues-page issue-detail-figma-page">
      <DashboardSidebar authState={state} unreadCount={4} />

      <main className="idv-main idv-main-with-sidebar">
        <div className="idv-back-row">
          <Link to="/app/issues" className="idv-back-link">
            ← Back to Issues
          </Link>
        </div>

        <div className="idv-breadcrumb-row">
          <div className="idv-breadcrumbs">
            <span>DevFlow</span>
            <span>›</span>
            <span>{issue?.repository?.name || 'Repository'}</span>
            <span>›</span>
            <strong>{issue ? `Issue #${issue.number}` : 'Issue'}</strong>
          </div>
          <a href={issue?.url || '#'} target="_blank" rel="noreferrer" className="idv-open-gh">
            Open in GitHub ↗
          </a>
        </div>

        {loading && <div className="issues-info">Loading issue details...</div>}
        {error && <div className="issues-info issues-error">{error}</div>}

        {!loading && !error && issue && (
          <section className="idv-grid">
            <section className="idv-left">
              <article className="idv-card idv-heading-card">
                <h1>{issue.title}</h1>
                <div className="idv-heading-meta">
                  <span className={isOpen ? 'idv-status-open' : 'idv-status-closed'}>{issue.state}</span>
                  <span>{formatTimelineMeta()}</span>
                </div>

                <div className="idv-description md-content">
                  {issue.body ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.body}</ReactMarkdown>
                  ) : (
                    <p>No description provided for this issue.</p>
                  )}
                </div>

                <div className="idv-affected">
                  <p>Affected Component</p>
                  <code>src/components/{issue.repository.name}/TopNavBar.tsx</code>
                </div>
              </article>

              <article className="idv-card idv-activity-card">
                <h3>Activity</h3>
                <div className="idv-timeline">
                  {issue.comments && issue.comments.length > 0 ? (
                    issue.comments.map((comment) => (
                      <div key={comment.id} className="idv-timeline-item">
                        <header>
                          <strong>{comment.user?.name || comment.user?.githubLogin || 'Contributor'}</strong>
                          <span>{comment.createdAt}</span>
                        </header>
                        <div className="md-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="issues-info">No activity yet.</p>
                  )}
                </div>

                <div className="idv-comment-box">
                  <textarea
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <div className="idv-comment-actions">
                    <button
                      type="button"
                      className={isOpen ? 'idv-close-btn' : 'idv-reopen-btn'}
                      disabled={savingKey === 'state'}
                      onClick={() => void handleToggleIssueState()}
                    >
                      {savingKey === 'state'
                        ? isOpen
                          ? 'Closing...'
                          : 'Reopening...'
                        : isOpen
                          ? 'Close Issue'
                          : 'Reopen Issue'}
                    </button>
                    <button
                      type="button"
                      className="idv-comment-btn"
                      disabled={savingKey === 'comment' || !newComment.trim()}
                      onClick={() => void handleAddComment()}
                    >
                      {savingKey === 'comment' ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </article>
            </section>

            <aside className="idv-right">
              <article className="idv-card idv-sidebar-card">
                <section className="idv-side-block">
                  <h4>Priority</h4>
                  <div className="idv-priority-row">
                    <span className="idv-priority-pill">{issue.priority || 'No Priority'}</span>
                    <select value={priority} onChange={(event) => setPriority(event.target.value as 'P0' | 'P1' | 'P2' | 'P3' | '')}>
                      <option value="">No Priority</option>
                      <option value="P0">P0</option>
                      <option value="P1">P1</option>
                      <option value="P2">P2</option>
                      <option value="P3">P3</option>
                    </select>
                    <button
                      type="button"
                      disabled={savingKey === 'fields'}
                      onClick={() => void handleSaveIssueFields()}
                    >
                      {savingKey === 'fields' ? 'Saving...' : 'Update'}
                    </button>
                  </div>
                </section>

                <section className="idv-side-block">
                  <h4>Assignees</h4>
                  <div className="idv-assignees">
                    {issue.assignees?.length ? (
                      issue.assignees.map((person) => (
                        <div key={person.id} className="idv-assignee-item">
                          <span className="idv-avatar-mini">{(person.name || person.githubLogin || 'U')[0]}</span>
                          <div>
                            <strong>{person.githubLogin || person.name}</strong>
                            <span>{person.name || 'Contributor'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="issues-info">No assignees</span>
                    )}
                  </div>
                </section>

                <section className="idv-side-block">
                  <h4>Labels</h4>
                  <div className="idv-labels">
                    {issue.labels.map((label) => (
                      <span key={label.id} className="idv-label-chip">
                        {label.name}
                        <button
                          type="button"
                          disabled={savingKey === `label-remove-${label.name}`}
                          onClick={() => void handleRemoveLabel(label.name)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {issue.labels.length === 0 && <span className="issues-info">No labels</span>}
                  </div>
                  <div className="idv-inline-edit">
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
                      Add
                    </button>
                  </div>
                </section>

                <section className="idv-side-block">
                  <h4>Category</h4>
                  <div className="idv-inline-edit">
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
                      Add
                    </button>
                  </div>
                  <div className="idv-categories">
                    {issue.categories?.map((category) => (
                      <span key={category.id} className="idv-category-chip">
                        {category.name}
                        <button
                          type="button"
                          disabled={savingKey === `category-remove-${category.id}`}
                          onClick={() => void handleRemoveCategory(category.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </section>

                <section className="idv-side-block idv-details">
                  <h4>Metadata</h4>
                  <div>
                    <span>Category</span>
                    <strong>{primaryCategory}</strong>
                  </div>
                  <div>
                    <span>Repository</span>
                    <strong>{issue.repository.fullName}</strong>
                  </div>
                  <div>
                    <span>Created</span>
                    <strong>{issue.githubCreatedAt || '—'}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{issue.githubUpdatedAt || '—'}</strong>
                  </div>
                </section>
              </article>

              <article className="idv-card idv-notify-card">
                <h4>Notifications</h4>
                <button type="button">Unsubscribe</button>
                <p>You&apos;re receiving notifications because you&apos;re assigned to this issue.</p>
              </article>
            </aside>
          </section>
        )}

        {message && <div className="issue-detail-message">{message}</div>}
      </main>
    </div>
  );
};

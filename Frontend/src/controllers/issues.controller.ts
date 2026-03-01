import type {
  IssueCommentCreateResponse,
  IssueCreatePayload,
  IssueCreateResponse,
  IssueDetailItem,
  IssueDetailResponse,
  IssueListResponse,
  IssueUpdatePayload,
  IssuesListQuery
} from '../models/issues.model';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001/api';

const apiGet = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as T;
};

const apiRequest = async <T>(
  path: string,
  token: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string; error?: string })
    | null;

  if (!response.ok) {
    const reason = payload?.error || payload?.message || `Request failed (${response.status})`;
    throw new Error(reason);
  }

  if (!payload) {
    throw new Error('Empty API response');
  }

  return payload;
};

const asDateString = (value?: string): string => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString();
};

export const getIssuesList = async (token: string, query: IssuesListQuery): Promise<IssueListResponse> => {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.state && query.state !== 'all') params.set('state', query.state);
  if (query.search) params.set('search', query.search);
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order);

  const suffix = params.toString();
  return apiGet<IssueListResponse>(`/issues${suffix ? `?${suffix}` : ''}`, token);
};

export const createIssue = async (token: string, payload: IssueCreatePayload): Promise<IssueDetailItem> => {
  const response = await apiRequest<IssueCreateResponse>('/issues', token, 'POST', payload);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Issue creation failed');
  }

  return {
    ...response.data,
    githubCreatedAt: asDateString(response.data.githubCreatedAt),
    githubUpdatedAt: asDateString(response.data.githubUpdatedAt),
    closedAt: asDateString(response.data.closedAt),
    comments:
      response.data.comments?.map((comment) => ({
        ...comment,
        createdAt: asDateString(comment.createdAt)
      })) || []
  };
};

export const getIssueDetail = async (token: string, issueId: string): Promise<IssueDetailItem> => {
  const response = await apiGet<IssueDetailResponse>(`/issues/${issueId}`, token);

  if (!response.success || !response.data) {
    throw new Error('Issue details not available');
  }

  return {
    ...response.data,
    githubCreatedAt: asDateString(response.data.githubCreatedAt),
    githubUpdatedAt: asDateString(response.data.githubUpdatedAt),
    closedAt: asDateString(response.data.closedAt),
    comments:
      response.data.comments?.map((comment) => ({
        ...comment,
        createdAt: asDateString(comment.createdAt)
      })) || []
  };
};

export const updateIssueDetails = async (
  token: string,
  issueId: string,
  payload: IssueUpdatePayload
): Promise<IssueDetailItem> => {
  const response = await apiRequest<IssueDetailResponse>(`/issues/${issueId}`, token, 'PATCH', payload);

  if (!response.success || !response.data) {
    throw new Error('Issue update failed');
  }

  return {
    ...response.data,
    githubCreatedAt: asDateString(response.data.githubCreatedAt),
    githubUpdatedAt: asDateString(response.data.githubUpdatedAt),
    closedAt: asDateString(response.data.closedAt),
    comments:
      response.data.comments?.map((comment) => ({
        ...comment,
        createdAt: asDateString(comment.createdAt)
      })) || []
  };
};

export const addIssueComment = async (token: string, issueId: string, body: string): Promise<void> => {
  await apiRequest<IssueCommentCreateResponse>(`/issues/${issueId}/comments`, token, 'POST', { body });
};

export const addIssueCategories = async (
  token: string,
  issueId: string,
  categoryIds: string[]
): Promise<void> => {
  await apiRequest<{ success: boolean; message?: string }>(`/issues/${issueId}/categories`, token, 'POST', {
    categoryIds
  });
};

export const removeIssueCategory = async (
  token: string,
  issueId: string,
  categoryId: string
): Promise<void> => {
  await apiRequest<{ success: boolean; message?: string }>(
    `/issues/${issueId}/categories/${categoryId}`,
    token,
    'DELETE'
  );
};

export const manageIssueLabels = async (
  token: string,
  issueId: string,
  labels: string[],
  action: 'add' | 'remove' | 'set'
): Promise<void> => {
  await apiRequest<{ success: boolean; message?: string }>(`/issues/${issueId}/labels`, token, 'POST', {
    labels,
    action
  });
};

import type {
  IssueDetailItem,
  IssueDetailResponse,
  IssueListResponse,
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

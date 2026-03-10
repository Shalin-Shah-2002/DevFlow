import type {
  RepositoriesQuery,
  RepositoryDetails,
  RepositoryDetailsResponse,
  RepositoryItem,
  RepositoryListResponse,
  RepositorySyncResponse,
  RepositoryWebhookResponse
} from '../models/repositories.model';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

const apiRequest = async <T>(
  token: string,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
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

  const payload = (await response.json().catch(() => null)) as (T & {
    success?: boolean;
    error?: string;
    message?: string;
  }) | null;

  if (!response.ok) {
    const reason = payload?.error || payload?.message || `Request failed (${response.status})`;
    throw new Error(reason);
  }

  if (!payload) {
    throw new Error('Empty API response');
  }

  return payload as T;
};

const toLocalDate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
};

const normalizeRepository = (repo: RepositoryItem): RepositoryItem => {
  return {
    ...repo,
    createdAt: toLocalDate(repo.createdAt) || '',
    updatedAt: toLocalDate(repo.updatedAt) || '',
    lastSyncedAt: toLocalDate(repo.lastSyncedAt)
  };
};

export const getRepositoriesOverview = async (
  token: string,
  query: RepositoriesQuery
): Promise<RepositoryListResponse> => {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.group) params.set('group', query.group);

  const suffix = params.toString();
  const response = await apiRequest<RepositoryListResponse>(
    token,
    `/repositories${suffix ? `?${suffix}` : ''}`,
    'GET'
  );

  return {
    ...response,
    data: (response.data || []).map(normalizeRepository)
  };
};

export const getRepositoryOverviewDetails = async (
  token: string,
  repositoryId: string
): Promise<RepositoryDetails> => {
  const response = await apiRequest<RepositoryDetailsResponse>(token, `/repositories/${repositoryId}`, 'GET');
  return normalizeRepository(response.data) as RepositoryDetails;
};

export const addRepositoryToOverview = async (
  token: string,
  repoUrl: string,
  group?: string
): Promise<RepositoryItem> => {
  const response = await apiRequest<{ success: boolean; data: RepositoryItem }>(token, '/repositories', 'POST', {
    repoUrl,
    group
  });

  return normalizeRepository(response.data);
};

export const updateRepositoryOverview = async (
  token: string,
  repositoryId: string,
  payload: { group?: string; webhookEnabled?: boolean }
): Promise<RepositoryItem> => {
  const response = await apiRequest<{ success: boolean; data: RepositoryItem }>(
    token,
    `/repositories/${repositoryId}`,
    'PATCH',
    payload
  );

  return normalizeRepository(response.data);
};

export const syncRepositoryOverview = async (
  token: string,
  repositoryId: string
): Promise<RepositorySyncResponse> => {
  return apiRequest<RepositorySyncResponse>(token, `/repositories/${repositoryId}/sync`, 'POST');
};

export const setupRepositoryOverviewWebhook = async (
  token: string,
  repositoryId: string
): Promise<RepositoryWebhookResponse> => {
  return apiRequest<RepositoryWebhookResponse>(token, `/repositories/${repositoryId}/webhook`, 'POST');
};

export const deleteRepositoryFromOverview = async (token: string, repositoryId: string): Promise<void> => {
  await apiRequest<{ success: boolean }>(token, `/repositories/${repositoryId}`, 'DELETE');
};

export const getRepositoryGroups = async (token: string): Promise<string[]> => {
  const response = await apiRequest<{ success: boolean; groups: string[] }>(token, '/repositories/groups', 'GET');
  return response.groups;
};

import type {
  CreateLabelPayload,
  LabelItem,
  LabelResponse,
  LabelsListResponse,
  LabelsQuery,
  LabelSyncResponse,
  UpdateLabelPayload
} from '../models/labels.model';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001/api';

const toLocalDate = (value?: string): string => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString();
};

const normalizeLabel = (label: LabelItem): LabelItem => ({
  ...label,
  createdAt: toLocalDate(label.createdAt)
});

const apiRequest = async <T>(
  token: string,
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
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

  return payload;
};

export const getLabels = async (token: string, query: LabelsQuery): Promise<LabelsListResponse> => {
  const params = new URLSearchParams();
  if (query.repositoryId) params.set('repositoryId', query.repositoryId);
  if (query.search) params.set('search', query.search);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const suffix = params.toString();
  const response = await apiRequest<LabelsListResponse>(token, `/labels${suffix ? `?${suffix}` : ''}`, 'GET');

  return {
    ...response,
    labels: (response.labels || []).map(normalizeLabel)
  };
};

export const createLabel = async (token: string, payload: CreateLabelPayload): Promise<LabelItem> => {
  const response = await apiRequest<LabelResponse>(token, '/labels', 'POST', payload);
  return normalizeLabel(response.label);
};

export const updateLabel = async (
  token: string,
  labelId: string,
  payload: UpdateLabelPayload
): Promise<LabelItem> => {
  const response = await apiRequest<LabelResponse>(token, `/labels/${labelId}`, 'PUT', payload);
  return normalizeLabel(response.label);
};

export const deleteLabel = async (token: string, labelId: string): Promise<void> => {
  await apiRequest<{ success: boolean; message: string }>(token, `/labels/${labelId}`, 'DELETE');
};

export const syncLabels = async (token: string, repositoryId: string): Promise<LabelSyncResponse> => {
  const response = await apiRequest<LabelSyncResponse>(token, `/labels/sync/${repositoryId}`, 'POST');
  return {
    ...response,
    labels: (response.labels || []).map(normalizeLabel)
  };
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001/api';

export type SavedView = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const request = async <T>(
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

  const payload = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; message?: string; error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Request failed (${response.status})`);
  }

  if (!payload) {
    throw new Error('Empty API response');
  }

  return payload;
};

const toDate = (value?: string) => (value ? new Date(value).toLocaleString() : '');

export const getSavedViews = async (token: string): Promise<SavedView[]> => {
  const response = await request<{ success: boolean; data: SavedView[] }>(token, '/views', 'GET');
  return (response.data || []).map((item) => ({
    ...item,
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt)
  }));
};

export const createSavedView = async (
  token: string,
  payload: { name: string; filters: Record<string, unknown>; isDefault?: boolean }
): Promise<void> => {
  await request<{ success: boolean }>(token, '/views', 'POST', payload);
};

export const updateSavedView = async (
  token: string,
  id: string,
  payload: { name?: string; filters?: Record<string, unknown>; isDefault?: boolean }
): Promise<void> => {
  await request<{ success: boolean }>(token, `/views/${id}`, 'PATCH', payload);
};

export const deleteSavedView = async (token: string, id: string): Promise<void> => {
  await request<{ success: boolean }>(token, `/views/${id}`, 'DELETE');
};

export const applySavedView = async (token: string, id: string): Promise<{ total: number; issues: unknown[] }> => {
  const response = await request<{
    success: boolean;
    data: { issues: unknown[]; pagination: { total: number } };
  }>(token, `/views/${id}/apply`, 'POST');

  return {
    total: response.data.pagination.total,
    issues: response.data.issues
  };
};

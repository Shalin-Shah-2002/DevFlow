const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

const request = async <T>(
  token: string | null,
  path: string,
  method: 'GET' | 'POST' | 'PUT',
  body?: unknown,
  isPublic = false
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      ...(isPublic ? {} : { Authorization: `Bearer ${token}` }),
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

export const getHealth = async () => request<{ status: string; services: Record<string, string> }>(null, '/health', 'GET', undefined, true);

export const getSettings = async (token: string) => request<{ success: boolean; data: Record<string, unknown> }>(token, '/settings', 'GET');
export const updateSettings = async (token: string, payload: Record<string, unknown>) =>
  request<{ success: boolean }>(token, '/settings', 'PUT', payload);

export const getMilestones = async (token: string, page = 1, limit = 50) =>
  request<{ success: boolean; data: unknown[]; pagination?: any }>(token, `/milestones?page=${page}&limit=${limit}`, 'GET');

export const createMilestone = async (token: string, payload: Record<string, unknown>) =>
  request<{ success: boolean }>(token, '/milestones', 'POST', payload);

export const getActivityLog = async (token: string, page = 1, limit = 20) =>
  request<{ success: boolean; data: unknown[]; pagination?: any }>(token, `/activity-log?page=${page}&limit=${limit}`, 'GET');

export const globalSearch = async (token: string, q: string, page = 1, limit = 50) =>
  request<{ success: boolean; data: { totalResults: number }; pagination?: { total: number; page: number; limit: number; totalPages: number } }>(token, `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`, 'GET');

export const getTeams = async (token: string, page = 1, limit = 20) => request<{ success: boolean; data: unknown[]; pagination?: any }>(token, `/teams?page=${page}&limit=${limit}`, 'GET');

export const createTeam = async (token: string, payload: { name: string; description?: string }) =>
  request<{ success: boolean }>(token, '/teams', 'POST', payload);

export const setupWebhook = async (token: string, payload: { repositoryId: string; webhookUrl?: string }) =>
  request<{ success: boolean; message: string }>(token, '/webhooks', 'POST', payload);

export const exportData = async (
  token: string,
  payload: { format: 'csv' | 'json'; entity: 'issues' | 'repositories' | 'milestones'; repositoryId?: string }
) => request<Record<string, unknown>>(token, '/export', 'POST', payload);

export const bulkActions = async (
  token: string,
  payload: { issueIds: string[]; action: string; payload?: Record<string, unknown> }
) => request<{ success: boolean; affected?: number }>(token, '/bulk-actions', 'POST', payload);

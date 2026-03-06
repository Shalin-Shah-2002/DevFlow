const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

export type IssuesByStatusData = {
  byState: Record<string, number>;
  byCustomStatus: Record<string, number>;
};

export type IssuesByRepoRow = {
  name: string;
  fullName: string;
  open: number;
  closed: number;
  total: number;
};

export type IssuesOverTimeData = {
  period: '7d' | '30d' | '90d' | '1y' | string;
  timeline: Array<{
    date: string;
    created: number;
    closed: number;
  }>;
};

export type AssigneeWorkloadRow = {
  userId: string;
  name?: string | null;
  githubLogin?: string;
  avatar?: string | null;
  open: number;
  closed: number;
  total: number;
};

export type CompletionRateData = {
  overall: {
    totalIssues: number;
    closedIssues: number;
    openIssues: number;
    completionRate: number;
  };
  byRepository: Array<{
    repositoryId: string;
    name: string;
    fullName: string;
    totalIssues: number;
    closedIssues: number;
    openIssues: number;
    completionRate: number;
  }>;
};

const request = async <T>(token: string, path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
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

export const getIssuesByStatus = async (token: string) =>
  request<{ success: boolean; data: IssuesByStatusData }>(token, '/analytics/issues-by-status');

export const getIssuesByRepo = async (token: string) =>
  request<{ success: boolean; data: IssuesByRepoRow[] }>(token, '/analytics/issues-by-repo');

export const getIssuesOverTime = async (token: string, period = '30d') =>
  request<{ success: boolean; data: IssuesOverTimeData }>(token, `/analytics/issues-over-time?period=${period}`);

export const getAssigneeWorkload = async (token: string) =>
  request<{ success: boolean; data: AssigneeWorkloadRow[] }>(token, '/analytics/assignee-workload');

export const getCompletionRate = async (token: string) =>
  request<{ success: boolean; data: CompletionRateData }>(token, '/analytics/completion-rate');

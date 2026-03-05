import {
  dashboardFallbackData,
  type ActivityItem,
  type DashboardViewModel,
  type IssueCard,
  type RepoHealthItem,
  type VelocityPoint,
  type WorkloadItem
} from '../models/dashboard.model';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type DashboardAnalytics = {
  totalRepositories: number;
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  closedRate: number;
};

type TimelinePoint = {
  date: string;
  created: number;
  closed: number;
};

type TimelineResponseData = {
  period: string;
  timeline: TimelinePoint[];
};

type NotificationApiItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

type NotificationListData = {
  notifications: NotificationApiItem[];
};

type IssueLabel = { name: string };
type IssueAssignee = { name?: string; githubLogin?: string };
type IssueApiItem = {
  id: string;
  number: number;
  title: string;
  priority?: string;
  labels?: IssueLabel[];
  commentsCount?: number;
  githubUpdatedAt?: string;
  updatedAt?: string;
  assignees?: IssueAssignee[];
};

type IssuesListResponse = {
  success: boolean;
  data: IssueApiItem[];
};

type CompletionRepo = {
  repositoryId: string;
  name: string;
  fullName: string;
  completionRate: number;
};

type CompletionData = {
  byRepository: CompletionRepo[];
};

type WorkloadRow = {
  open: number;
};

type UnreadCountData = {
  unreadCount: number;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

const apiGet = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`API failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

const toPercentDelta = (current: number, base: number): string => {
  if (base <= 0) {
    return '+0%';
  }

  const value = Math.round(((current - base) / base) * 100);
  return `${value >= 0 ? '+' : ''}${value}%`;
};

const formatAge = (dateValue: string | Date): string => {
  const date = new Date(dateValue);
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60000);

  if (min < 60) {
    return `${Math.max(1, min)}m`;
  }

  const hour = Math.floor(min / 60);
  if (hour < 24) {
    return `${hour}h`;
  }

  return `${Math.floor(hour / 24)}d`;
};

const formatAgo = (dateValue: string | Date): string => {
  const date = new Date(dateValue);
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60000);

  if (min < 60) {
    return `${Math.max(1, min)} mins ago`;
  }

  const hour = Math.floor(min / 60);
  if (hour < 24) {
    return `${hour} hours ago`;
  }

  return `${Math.floor(hour / 24)} days ago`;
};

const toPriority = (value?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (value === 'P0' || value === 'P1') {
    return 'HIGH';
  }

  if (value === 'P2') {
    return 'MEDIUM';
  }

  return 'LOW';
};

const shortName = (name: string): string => {
  const chunks = name.split(' ').filter(Boolean);
  if (chunks.length === 0) {
    return 'U';
  }

  if (chunks.length === 1) {
    return chunks[0].slice(0, 1).toUpperCase();
  }

  return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase();
};

const mapVelocity = (timeline: Array<{ date: string; created: number; closed: number }>): VelocityPoint[] => {
  const usable = timeline.slice(-28);
  const buckets = [0, 0, 0, 0];

  usable.forEach((item, idx) => {
    const bucket = Math.min(3, Math.floor(idx / 7));
    buckets[bucket] += item.created + item.closed;
  });

  return buckets.map((value, index) => ({
    week: `Week ${index + 1}`,
    velocity: Math.max(8, value)
  }));
};

const mapActivities = (input: NotificationApiItem[]): ActivityItem[] => {
  return input.slice(0, 4).map((item, index) => {
    const actor = item?.title?.split(' ')?.slice(0, 2).join(' ') || `Member ${index + 1}`;
    return {
      id: item?.id || `act-${index}`,
      actor,
      action: item?.title || 'updated issue',
      target: item?.message || 'project activity',
      targetAccent: '#1d4fd7',
      timeAgo: formatAgo(item?.createdAt || new Date())
    };
  });
};

const mapIssueCards = (issues: IssueApiItem[]): IssueCard[] => {
  return issues.slice(0, 3).map((issue, index) => ({
    id: issue.id || `issue-${index}`,
    number: issue.number || 0,
    title: issue.title || 'Untitled issue',
    priority: toPriority(issue.priority),
    tags: issue.labels?.slice(0, 2).map((label: IssueLabel) => label.name) || ['general'],
    comments: issue.commentsCount || 0,
    age: formatAge(issue.githubUpdatedAt || issue.updatedAt || new Date()),
    assignees:
      issue.assignees
        ?.slice(0, 2)
        .map((person: IssueAssignee) => shortName(person.name || person.githubLogin || 'User')) ||
      ['U']
  }));
};

const mapRepoHealth = (repositories: CompletionRepo[]): RepoHealthItem[] => {
  return repositories.slice(0, 3).map((repo, index) => ({
    id: repo.repositoryId || `repo-${index}`,
    name: repo.name || repo.fullName || `Repo ${index + 1}`,
    passing: repo.completionRate || 0
  }));
};

const mapWorkload = (workloadRows: WorkloadRow[]): WorkloadItem[] => {
  const buckets = ['Design', 'Backend', 'Frontend', 'QA'];

  return buckets.map((team, index) => {
    const row = workloadRows[index];
    const tasks = row?.open ?? [12, 28, 34, 8][index];

    if (tasks >= 30) {
      return { team, tasks, note: 'Overloaded', status: 'warn' as const };
    }

    if (tasks <= 12) {
      return { team, tasks, note: '+1 task', status: 'good' as const };
    }

    return { team, tasks, note: 'Stable', status: 'neutral' as const };
  });
};

export const getDashboardVariant3Data = async (token: string): Promise<DashboardViewModel> => {
  const [dashboardRes, overTimeRes, notificationsRes, issuesRes, completionRes, workloadRes, unreadRes] =
    await Promise.allSettled([
      apiGet<ApiResponse<DashboardAnalytics>>('/analytics/dashboard', token),
      apiGet<ApiResponse<TimelineResponseData>>('/analytics/issues-over-time?period=30d', token),
      apiGet<ApiResponse<NotificationListData>>('/notifications?limit=6', token),
      apiGet<IssuesListResponse>('/issues?limit=6&sort=updated&order=desc', token),
      apiGet<ApiResponse<CompletionData>>('/analytics/completion-rate', token),
      apiGet<ApiResponse<WorkloadRow[]>>('/analytics/assignee-workload', token),
      apiGet<ApiResponse<UnreadCountData>>('/notifications/unread-count', token)
    ]);

  const fallback = dashboardFallbackData;

  const dash = dashboardRes.status === 'fulfilled' ? dashboardRes.value?.data : null;
  const overTime = overTimeRes.status === 'fulfilled' ? overTimeRes.value?.data?.timeline : null;
  const notifications = notificationsRes.status === 'fulfilled' ? notificationsRes.value?.data?.notifications : null;
  const issues = issuesRes.status === 'fulfilled' ? issuesRes.value?.data : null;
  const completion = completionRes.status === 'fulfilled' ? completionRes.value?.data?.byRepository : null;
  const workload = workloadRes.status === 'fulfilled' ? workloadRes.value?.data : null;
  const unreadCount = unreadRes.status === 'fulfilled' ? unreadRes.value?.data?.unreadCount : fallback.unreadCount;

  const openIssues = Number(dash?.openIssues ?? 0);
  const closedIssues = Number(dash?.closedIssues ?? 0);
  const totalIssues = Number(dash?.totalIssues ?? openIssues + closedIssues);

  const metrics = dash
    ? [
        {
          value: String(openIssues),
          label: 'Open Issues',
          delta: toPercentDelta(openIssues, Math.max(1, totalIssues - openIssues)),
          trend: 'up' as const
        },
        {
          value: String(closedIssues),
          label: 'Merged PRs',
          delta: `${dash.closedRate ?? 0}%`,
          trend: (dash.closedRate ?? 0) >= 50 ? ('up' as const) : ('down' as const)
        },
        {
          value: `${((totalIssues / Math.max(1, dash.totalRepositories || 1)) / 10).toFixed(1)}d`,
          label: 'Avg Cycle Time',
          delta: '+8%',
          trend: 'up' as const
        }
      ]
    : fallback.metrics;

  return {
    metrics,
    velocity: Array.isArray(overTime) && overTime.length > 0 ? mapVelocity(overTime) : fallback.velocity,
    activities:
      Array.isArray(notifications) && notifications.length > 0 ? mapActivities(notifications) : fallback.activities,
    issueCards: Array.isArray(issues) && issues.length > 0 ? mapIssueCards(issues) : fallback.issueCards,
    repoHealth:
      Array.isArray(completion) && completion.length > 0 ? mapRepoHealth(completion) : fallback.repoHealth,
    workload: Array.isArray(workload) && workload.length > 0 ? mapWorkload(workload) : fallback.workload,
    unreadCount: Number(unreadCount || 0)
  };
};

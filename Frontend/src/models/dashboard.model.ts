export type DashboardMetric = {
  value: string;
  label: string;
  delta: string;
  trend: 'up' | 'down';
};

export type VelocityPoint = {
  week: string;
  velocity: number;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  targetAccent?: string;
  timeAgo: string;
};

export type IssueCard = {
  id: string;
  number: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  comments: number;
  age: string;
  assignees: string[];
};

export type RepoHealthItem = {
  id: string;
  name: string;
  passing: number;
};

export type WorkloadItem = {
  team: string;
  tasks: number;
  note: string;
  status: 'good' | 'warn' | 'neutral';
};

export type DashboardViewModel = {
  metrics: DashboardMetric[];
  velocity: VelocityPoint[];
  activities: ActivityItem[];
  issueCards: IssueCard[];
  repoHealth: RepoHealthItem[];
  workload: WorkloadItem[];
  unreadCount: number;
};

export const dashboardFallbackData: DashboardViewModel = {
  metrics: [
    { value: '128', label: 'Open Issues', delta: '+12%', trend: 'up' },
    { value: '42', label: 'Merged PRs', delta: '-5%', trend: 'down' },
    { value: '4.2d', label: 'Avg Cycle Time', delta: '+8%', trend: 'up' }
  ],
  velocity: [
    { week: 'Week 1', velocity: 44 },
    { week: 'Week 2', velocity: 63 },
    { week: 'Week 3', velocity: 78 },
    { week: 'Week 4', velocity: 67 }
  ],
  activities: [
    {
      id: 'a1',
      actor: 'Sarah J.',
      action: 'merged PR',
      target: '#242',
      targetAccent: '#10b981',
      timeAgo: '2 mins ago'
    },
    {
      id: 'a2',
      actor: 'Marcus K.',
      action: 'commented on',
      target: '#1031',
      targetAccent: '#1d4fd7',
      timeAgo: '15 mins ago'
    },
    {
      id: 'a3',
      actor: 'Lee Wong',
      action: 'opened issue',
      target: '#1059',
      targetAccent: '#f43f5e',
      timeAgo: '1 hour ago'
    },
    {
      id: 'a4',
      actor: 'Emma D.',
      action: 'added update',
      target: 'Web-Core',
      targetAccent: '#0f172a',
      timeAgo: '3 hours ago'
    }
  ],
  issueCards: [
    {
      id: 'i1',
      number: 882,
      title: 'Auth token expiration logic failing on Safari mobile',
      priority: 'HIGH',
      tags: ['web-ui', 'authentication'],
      comments: 8,
      age: '4h',
      assignees: ['S', 'M']
    },
    {
      id: 'i2',
      number: 879,
      title: 'Dark mode contrast issues in dashboard charts',
      priority: 'MEDIUM',
      tags: ['ui-bug', 'design-sys'],
      comments: 3,
      age: '1d',
      assignees: ['L']
    },
    {
      id: 'i3',
      number: 875,
      title: 'Update documentation for new WebSocket events',
      priority: 'LOW',
      tags: ['docs'],
      comments: 2,
      age: '3d',
      assignees: ['A', 'E']
    }
  ],
  repoHealth: [
    { id: 'r1', name: 'DevFlow-Core', passing: 98 },
    { id: 'r2', name: 'DevFlow-UI', passing: 82 },
    { id: 'r3', name: 'API-Gateway', passing: 94 }
  ],
  workload: [
    { team: 'Design', tasks: 12, note: '+2 tasks', status: 'good' },
    { team: 'Backend', tasks: 28, note: 'Stable', status: 'neutral' },
    { team: 'Frontend', tasks: 34, note: 'Overloaded', status: 'warn' },
    { team: 'QA', tasks: 8, note: '+1 task', status: 'good' }
  ],
  unreadCount: 4
};

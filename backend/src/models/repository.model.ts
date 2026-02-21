// Repository Models and Types

export interface RepositoryResponse {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  owner: string;
  isPrivate: boolean;
  language: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  webhookEnabled: boolean;
  webhookId: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userRole?: string;
  group?: string | null;
}

export interface RepositoryListResponse {
  success: boolean;
  data: RepositoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RepositoryDetailsResponse {
  success: boolean;
  data: RepositoryResponse & {
    stats: {
      totalIssues: number;
      openIssues: number;
      closedIssues: number;
      labels: number;
      contributors: number;
    };
  };
}

export interface AddRepositoryRequest {
  repoUrl: string;
  group?: string;
}

export interface UpdateRepositoryRequest {
  group?: string;
  webhookEnabled?: boolean;
}

export interface RepositorySyncResponse {
  success: boolean;
  message: string;
  stats: {
    issuesAdded: number;
    issuesUpdated: number;
    issuesClosed: number;
    totalIssues: number;
  };
}

export interface WebhookSetupResponse {
  success: boolean;
  message: string;
  webhookId: string;
}

// GitHub API Response Types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
  };
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  state_reason: string | null;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  assignees: Array<{
    id: number;
    login: string;
    avatar_url: string;
  }>;
  milestone: {
    id: number;
    title: string;
    due_on: string | null;
  } | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

// Internal GitHub types for API responses
interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubMilestone {
  id: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  due_on: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// Helper function to convert GitHub repo to our format
export function toRepositoryResponse(
  repo: any,
  userRepo?: any
): RepositoryResponse {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    description: repo.description,
    url: repo.url,
    owner: repo.owner,
    isPrivate: repo.isPrivate,
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    openIssuesCount: repo.openIssuesCount,
    webhookEnabled: repo.webhookEnabled,
    webhookId: repo.webhookId,
    lastSyncedAt: repo.lastSyncedAt,
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    userRole: userRepo?.role,
    group: userRepo?.group,
  };
}

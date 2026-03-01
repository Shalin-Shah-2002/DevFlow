export type RepositoryItem = {
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
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userRole?: string;
  group?: string | null;
};

export type RepositoryDetails = RepositoryItem & {
  stats: {
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    labels: number;
    contributors: number;
  };
};

export type RepositoryListResponse = {
  success: boolean;
  data: RepositoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RepositoryDetailsResponse = {
  success: boolean;
  data: RepositoryDetails;
};

export type RepositorySyncResponse = {
  success: boolean;
  message: string;
  stats: {
    issuesAdded: number;
    issuesUpdated: number;
    issuesClosed: number;
    totalIssues: number;
  };
};

export type RepositoryWebhookResponse = {
  success: boolean;
  message: string;
  webhookId: string;
};

export type RepositoriesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  group?: string;
};

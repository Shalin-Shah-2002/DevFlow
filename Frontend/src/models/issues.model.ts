export type IssueListItem = {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3' | string;
  customStatus?: string;
  commentsCount: number;
  labels: { id: string; name: string; color?: string }[];
  categories?: { id: string; name: string; color?: string }[];
  assignees: { id: string; name?: string; avatar?: string; githubLogin: string }[];
  repository: { id: string; name: string; fullName: string };
  githubUpdatedAt?: string;
  createdAt?: string;
};

export type IssueComment = {
  id: string;
  body: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
    githubLogin: string;
  };
};

export type IssueDetailItem = IssueListItem & {
  url?: string;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
  closedAt?: string;
  estimatedTime?: number;
  comments?: IssueComment[];
};

export type IssueListResponse = {
  success: boolean;
  data: IssueListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type IssueDetailResponse = {
  success: boolean;
  data: IssueDetailItem;
};

export type IssueUpdatePayload = {
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  customStatus?: string;
  state?: 'open' | 'closed';
  stateReason?: 'completed' | 'not_planned' | 'reopened';
};

export type IssueCreatePayload = {
  repositoryId: string;
  title: string;
  body?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  customStatus?: string;
};

export type IssueCreateResponse = {
  success: boolean;
  message?: string;
  data: IssueDetailItem;
};

export type IssueCommentCreateResponse = {
  success: boolean;
  message?: string;
  data: IssueComment;
};

export type IssuesListQuery = {
  page?: number;
  limit?: number;
  state?: 'all' | 'open' | 'closed';
  search?: string;
  sort?: 'created' | 'updated' | 'priority' | 'comments';
  order?: 'asc' | 'desc';
  repositoryId?: string;
};

import { Issue, Label, User, Repository, Comment, Category, Milestone } from '@prisma/client';

// ============= GITHUB TYPES =============

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  title: string;
  description?: string;
  state: string;
  due_on?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  state_reason?: string;
  html_url: string;
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  milestone?: GitHubMilestone;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  html_url: string;
}

// ============= REQUEST TYPES =============

export interface CreateIssueRequest {
  repositoryId: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  customStatus?: string;
  estimatedTime?: number;
}

export interface UpdateIssueRequest {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  stateReason?: 'completed' | 'not_planned' | 'reopened';
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  customStatus?: string;
  estimatedTime?: number;
  labels?: string[];
  assignees?: string[];
}

export interface IssueFilters {
  state?: 'open' | 'closed' | 'all';
  priority?: string | string[];
  label?: string | string[];
  repositoryId?: string;
  assignee?: string;
  search?: string;
  categoryId?: string;
  milestoneId?: string;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  limit?: number;
  sort?: 'created' | 'updated' | 'priority' | 'comments';
  order?: 'asc' | 'desc';
}

export interface BulkIssueOperation {
  action: 'close' | 'label' | 'assign' | 'priority' | 'category';
  issueIds: string[];
  data?: any;
}

export interface CreateCommentRequest {
  body: string;
}

export interface UpdateCommentRequest {
  body: string;
}

export interface AssignUsersRequest {
  assignees: string[]; // GitHub usernames
}

export interface ManageLabelsRequest {
  labels: string[]; // Label names
  action: 'add' | 'remove' | 'set';
}

// ============= RESPONSE TYPES =============

export interface IssueResponse {
  id: string;
  githubId: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  stateReason?: string;
  priority?: string;
  customStatus?: string;
  estimatedTime?: number;
  repository: {
    id: string;
    name: string;
    fullName: string;
  };
  creator?: {
    id: string;
    name?: string;
    avatar?: string;
    githubLogin: string;
  };
  labels: {
    id: string;
    name: string;
    color: string;
    description?: string;
  }[];
  assignees: {
    id: string;
    name?: string;
    avatar?: string;
    githubLogin: string;
  }[];
  categories: {
    id: string;
    name: string;
    color: string;
  }[];
  milestone?: {
    id: string;
    title: string;
    dueOn?: Date;
  };
  commentsCount: number;
  url: string;
  githubCreatedAt: Date;
  githubUpdatedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueDetailResponse extends IssueResponse {
  comments?: CommentResponse[];
  timeSpent?: number;
  notesCount?: number;
}

export interface CommentResponse {
  id: string;
  githubId?: number;
  body: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
    githubLogin: string;
  };
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueListResponse {
  success: boolean;
  data: IssueResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    state?: string;
    priority?: string;
    appliedFilters: number;
  };
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  results: {
    successful: number;
    failed: number;
    total: number;
    errors?: { issueId: string; error: string }[];
  };
}

// ============= TRANSFORMATION FUNCTIONS =============

export function toIssueResponse(
  issue: Issue & {
    repository: Repository;
    creator?: User | null;
    labels?: any[];
    assignees?: any[];
    categories?: any[];
    milestone?: Milestone | null;
    _count?: any;
  }
): IssueResponse {
  return {
    id: issue.id,
    githubId: Number(issue.githubId),
    number: issue.number,
    title: issue.title,
    body: issue.body || undefined,
    state: issue.state,
    stateReason: issue.stateReason || undefined,
    priority: issue.priority || undefined,
    customStatus: issue.customStatus || undefined,
    estimatedTime: issue.estimatedTime || undefined,
    repository: {
      id: issue.repository.id,
      name: issue.repository.name,
      fullName: issue.repository.fullName,
    },
    creator: issue.creator
      ? {
          id: issue.creator.id,
          name: issue.creator.name || undefined,
          avatar: issue.creator.avatar || undefined,
          githubLogin: issue.creator.githubLogin,
        }
      : undefined,
    labels:
      issue.labels?.map((il: any) => ({
        id: il.label.id,
        name: il.label.name,
        color: il.label.color,
        description: il.label.description,
      })) || [],
    assignees: issue.assignees || [],
    categories:
      issue.categories?.map((ic: any) => ({
        id: ic.category.id,
        name: ic.category.name,
        color: ic.category.color,
      })) || [],
    milestone: issue.milestone
      ? {
          id: issue.milestone.id,
          title: issue.milestone.title,
          dueOn: issue.milestone.dueOn || undefined,
        }
      : undefined,
    commentsCount: issue._count?.comments || 0,
    url: `https://github.com/${issue.repository.fullName}/issues/${issue.number}`,
    githubCreatedAt: issue.githubCreatedAt,
    githubUpdatedAt: issue.githubUpdatedAt,
    closedAt: issue.closedAt || undefined,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export function toCommentResponse(
  comment: Comment & { user?: User | null }
): CommentResponse {
  return {
    id: comment.id,
    githubId: comment.githubId ? Number(comment.githubId) : undefined,
    body: comment.body,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name || undefined,
          avatar: comment.user.avatar || undefined,
          githubLogin: comment.user.githubLogin,
        }
      : undefined,
    githubCreatedAt: comment.githubCreatedAt || undefined,
    githubUpdatedAt: comment.githubUpdatedAt || undefined,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

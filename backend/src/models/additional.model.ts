// ─── Additional Features Model Types ─────────────────────────────────────────

// ── Milestones ───────────────────────────────────────────────────────────────

export interface MilestoneResponse {
  id: string;
  githubId: bigint | null;
  title: string;
  description: string | null;
  state: string;
  dueOn: Date | null;
  repositoryId: string;
  openIssuesCount?: number;
  closedIssuesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  state?: 'open' | 'closed';
  dueOn?: string; // ISO date string
  repositoryId: string;
}

export interface MilestoneFilters {
  repositoryId?: string;
  state?: 'open' | 'closed';
  page?: number;
  limit?: number;
}

export interface MilestoneListResponse {
  milestones: MilestoneResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function toMilestoneResponse(m: any): MilestoneResponse {
  return {
    id: m.id,
    githubId: m.githubId ?? null,
    title: m.title,
    description: m.description ?? null,
    state: m.state,
    dueOn: m.dueOn ?? null,
    repositoryId: m.repositoryId,
    openIssuesCount: m._count
      ? m._count.issues
      : undefined,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface UserSettingsResponse {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  githubLogin: string;
  githubUrl: string | null;
}

export interface UpdateUserSettingsRequest {
  name?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
}

// ── Teams ────────────────────────────────────────────────────────────────────

export interface TeamMemberResponse {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    githubLogin: string;
  };
}

export interface TeamResponse {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  members?: TeamMemberResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface TeamListResponse {
  teams: TeamResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function toTeamResponse(t: any): TeamResponse {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? null,
    memberCount: t._count?.members ?? t.members?.length ?? 0,
    members: t.members?.map((m: any): TeamMemberResponse => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user
        ? {
            id: m.user.id,
            name: m.user.name ?? null,
            email: m.user.email,
            avatar: m.user.avatar ?? null,
            githubLogin: m.user.githubLogin,
          }
        : undefined,
    })),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  type: 'issue_created' | 'issue_updated' | 'issue_closed' | 'comment_added' | 'label_assigned' | 'milestone_created';
  description: string;
  entityId: string;
  entityType: 'issue' | 'comment' | 'label' | 'milestone';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ActivityLogResponse {
  activities: ActivityEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  issues: Array<{
    id: string;
    number: number;
    title: string;
    state: string;
    priority: string | null;
    repositoryId: string;
    repositoryName: string;
    createdAt: Date;
  }>;
  repositories: Array<{
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    language: string | null;
  }>;
  totalResults: number;
}

// ── Export ───────────────────────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'json';
export type ExportEntity = 'issues' | 'repositories' | 'milestones';

export interface ExportRequest {
  format: ExportFormat;
  entity: ExportEntity;
  repositoryId?: string;
  state?: string;
}

// ── Bulk Actions ─────────────────────────────────────────────────────────────

export type BulkAction = 'close' | 'reopen' | 'assign_label' | 'remove_label' | 'assign_milestone' | 'set_priority';

export interface BulkActionRequest {
  issueIds: string[];
  action: BulkAction;
  payload?: {
    labelId?: string;
    milestoneId?: string;
    priority?: string;
    assigneeId?: string;
  };
}

export interface BulkActionResponse {
  success: boolean;
  affected: number;
  message: string;
}

// ── Health ───────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    api: 'operational';
  };
}

import prisma from '../config/prisma';
import {
  ActivityEntry,
  ActivityLogResponse,
  BulkActionRequest,
  BulkActionResponse,
  CreateMilestoneRequest,
  CreateTeamRequest,
  ExportRequest,
  MilestoneFilters,
  MilestoneListResponse,
  MilestoneResponse,
  SearchResult,
  TeamListResponse,
  TeamResponse,
  UpdateUserSettingsRequest,
  UserSettingsResponse,
  toMilestoneResponse,
  toTeamResponse,
} from '../models/additional.model';

export class AdditionalService {
  // ── Milestones ─────────────────────────────────────────────────────────────

  /**
   * List milestones with optional filters
   */
  static async getMilestones(
    userId: string,
    filters: MilestoneFilters
  ): Promise<MilestoneListResponse> {
    const { repositoryId, state, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Only list milestones for repositories the user has access to
    const userRepos = await prisma.userRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    const accessibleRepoIds = userRepos.map((r) => r.repositoryId);

    const where: any = {
      repositoryId: { in: accessibleRepoIds },
    };

    if (repositoryId) {
      if (!accessibleRepoIds.includes(repositoryId)) {
        return { milestones: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      where.repositoryId = repositoryId;
    }

    if (state) {
      where.state = state;
    }

    const [milestones, total] = await Promise.all([
      prisma.milestone.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { issues: true } },
        },
      }),
      prisma.milestone.count({ where }),
    ]);

    return {
      milestones: milestones.map(toMilestoneResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new milestone
   */
  static async createMilestone(
    userId: string,
    data: CreateMilestoneRequest
  ): Promise<MilestoneResponse> {
    // Verify user has access to this repository
    const access = await prisma.userRepository.findFirst({
      where: { userId, repositoryId: data.repositoryId },
    });

    if (!access) {
      throw new Error('Repository not found or access denied');
    }

    const milestone = await prisma.milestone.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        state: data.state ?? 'open',
        dueOn: data.dueOn ? new Date(data.dueOn) : null,
        repositoryId: data.repositoryId,
      },
      include: {
        _count: { select: { issues: true } },
      },
    });

    return toMilestoneResponse(milestone);
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  /**
   * Get user settings / profile
   */
  static async getUserSettings(userId: string): Promise<UserSettingsResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        website: true,
        githubLogin: true,
        githubUrl: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      company: user.company ?? null,
      website: user.website ?? null,
      githubLogin: user.githubLogin,
      githubUrl: user.githubUrl ?? null,
    };
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(
    userId: string,
    data: UpdateUserSettingsRequest
  ): Promise<UserSettingsResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.website !== undefined && { website: data.website }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        website: true,
        githubLogin: true,
        githubUrl: true,
      },
    });

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      company: user.company ?? null,
      website: user.website ?? null,
      githubLogin: user.githubLogin,
      githubUrl: user.githubUrl ?? null,
    };
  }

  // ── Activity Log ───────────────────────────────────────────────────────────

  /**
   * Get a user's recent activity by aggregating from issues and comments
   */
  static async getActivityLog(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ActivityLogResponse> {
    const skip = (page - 1) * limit;

    // Collect recent issues created by the user
    const [recentIssues, recentComments, totalIssues, totalComments] = await Promise.all([
      prisma.issue.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          number: true,
          title: true,
          state: true,
          createdAt: true,
          repository: { select: { fullName: true } },
        },
      }),
      prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          body: true,
          createdAt: true,
          issue: {
            select: {
              id: true,
              number: true,
              title: true,
              repository: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.issue.count({ where: { creatorId: userId } }),
      prisma.comment.count({ where: { userId } }),
    ]);

    // Build activity entries and sort by date
    const activities: ActivityEntry[] = [
      ...recentIssues.map(
        (issue): ActivityEntry => ({
          id: `issue-${issue.id}`,
          type: issue.state === 'closed' ? 'issue_closed' : 'issue_created',
          description: `${issue.state === 'closed' ? 'Closed' : 'Created'} issue #${issue.number}: "${issue.title}" in ${issue.repository.fullName}`,
          entityId: issue.id,
          entityType: 'issue',
          metadata: { issueNumber: issue.number, repoFullName: issue.repository.fullName },
          createdAt: issue.createdAt,
        })
      ),
      ...recentComments.map(
        (comment): ActivityEntry => ({
          id: `comment-${comment.id}`,
          type: 'comment_added',
          description: `Commented on issue #${comment.issue.number}: "${comment.issue.title}" in ${comment.issue.repository.fullName}`,
          entityId: comment.id,
          entityType: 'comment',
          metadata: {
            issueId: comment.issue.id,
            issueNumber: comment.issue.number,
            repoFullName: comment.issue.repository.fullName,
          },
          createdAt: comment.createdAt,
        })
      ),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    const total = totalIssues + totalComments;

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  /**
   * Global search across issues and repositories
   */
  static async globalSearch(userId: string, query: string, page = 1, limit = 10): Promise<SearchResult> {
    if (!query || query.trim().length === 0) {
      return { issues: [], repositories: [], totalResults: 0, pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    const searchTerm = query.trim();

    // Get repos accessible to the user
    const userRepos = await prisma.userRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    const repoIds = userRepos.map((r) => r.repositoryId);

    const skip = (page - 1) * limit;

    const issueWhere = {
      repositoryId: { in: repoIds },
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { body: { contains: searchTerm, mode: 'insensitive' as const } },
      ],
    };

    const repoWhere = {
      id: { in: repoIds },
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' as const } },
        { fullName: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
      ],
    };

    const [issues, repositories, totalIssues, totalRepos] = await Promise.all([
      prisma.issue.findMany({
        where: issueWhere,
        skip,
        take: limit,
        orderBy: { githubUpdatedAt: 'desc' },
        select: {
          id: true,
          number: true,
          title: true,
          state: true,
          priority: true,
          repositoryId: true,
          createdAt: true,
          repository: { select: { fullName: true } },
        },
      }),
      prisma.repository.findMany({
        where: repoWhere,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
        },
      }),
      prisma.issue.count({ where: issueWhere }),
      prisma.repository.count({ where: repoWhere }),
    ]);

    const total = totalIssues + totalRepos;

    return {
      issues: issues.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        priority: i.priority ?? null,
        repositoryId: i.repositoryId,
        repositoryName: i.repository.fullName,
        createdAt: i.createdAt,
      })),
      repositories: repositories.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        description: r.description ?? null,
        language: r.language ?? null,
      })),
      totalResults: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  /**
   * Export data as JSON or CSV
   */
  static async exportData(
    userId: string,
    options: ExportRequest
  ): Promise<{ data: any[]; filename: string }> {
    const { entity, format, repositoryId, state } = options;

    // Get repos accessible to the user
    const userRepos = await prisma.userRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    const accessibleRepoIds = userRepos.map((r) => r.repositoryId);

    let data: any[] = [];
    let filename = '';

    if (entity === 'issues') {
      const where: any = { repositoryId: { in: accessibleRepoIds } };
      if (repositoryId && accessibleRepoIds.includes(repositoryId)) {
        where.repositoryId = repositoryId;
      }
      if (state) where.state = state;

      const issues = await prisma.issue.findMany({
        where,
        include: {
          repository: { select: { fullName: true } },
          labels: { include: { label: { select: { name: true } } } },
        },
        orderBy: { githubCreatedAt: 'desc' },
      });

      data = issues.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        priority: i.priority ?? '',
        customStatus: i.customStatus ?? '',
        repository: i.repository.fullName,
        labels: i.labels.map((l) => l.label.name).join(', '),
        createdAt: i.githubCreatedAt.toISOString(),
        updatedAt: i.githubUpdatedAt.toISOString(),
        closedAt: i.closedAt ? i.closedAt.toISOString() : '',
      }));
      filename = `devflow-issues-${Date.now()}.${format}`;
    } else if (entity === 'repositories') {
      const repos = await prisma.repository.findMany({
        where: { id: { in: accessibleRepoIds } },
        orderBy: { name: 'asc' },
      });

      data = repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        description: r.description ?? '',
        language: r.language ?? '',
        stars: r.stars,
        forks: r.forks,
        openIssues: r.openIssuesCount,
        isPrivate: r.isPrivate,
        createdAt: r.createdAt.toISOString(),
      }));
      filename = `devflow-repositories-${Date.now()}.${format}`;
    } else if (entity === 'milestones') {
      const where: any = { repositoryId: { in: accessibleRepoIds } };
      if (repositoryId && accessibleRepoIds.includes(repositoryId)) {
        where.repositoryId = repositoryId;
      }

      const milestones = await prisma.milestone.findMany({
        where,
        include: { repository: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      });

      data = milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? '',
        state: m.state,
        repository: m.repository.fullName,
        dueOn: m.dueOn ? m.dueOn.toISOString() : '',
        createdAt: m.createdAt.toISOString(),
      }));
      filename = `devflow-milestones-${Date.now()}.${format}`;
    }

    return { data, filename };
  }

  // ── Bulk Actions ───────────────────────────────────────────────────────────

  /**
   * Apply bulk actions to a set of issues
   */
  static async bulkAction(
    userId: string,
    request: BulkActionRequest
  ): Promise<BulkActionResponse> {
    const { issueIds, action, payload } = request;

    if (!issueIds || issueIds.length === 0) {
      throw new Error('No issue IDs provided');
    }

    // Verify user has access to all these issues via their repositories
    const userRepos = await prisma.userRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    const accessibleRepoIds = userRepos.map((r) => r.repositoryId);

    const accessibleIssues = await prisma.issue.findMany({
      where: {
        id: { in: issueIds },
        repositoryId: { in: accessibleRepoIds },
      },
      select: { id: true },
    });

    const accessibleIds = accessibleIssues.map((i) => i.id);

    if (accessibleIds.length === 0) {
      throw new Error('No accessible issues found');
    }

    let affected = 0;

    switch (action) {
      case 'close':
        const closeResult = await prisma.issue.updateMany({
          where: { id: { in: accessibleIds } },
          data: { state: 'closed', closedAt: new Date() },
        });
        affected = closeResult.count;
        break;

      case 'reopen':
        const reopenResult = await prisma.issue.updateMany({
          where: { id: { in: accessibleIds } },
          data: { state: 'open', closedAt: null },
        });
        affected = reopenResult.count;
        break;

      case 'assign_label':
        if (!payload?.labelId) throw new Error('labelId is required for assign_label action');
        // Upsert to avoid duplicate key errors
        for (const issueId of accessibleIds) {
          await prisma.issueLabel.upsert({
            where: { issueId_labelId: { issueId, labelId: payload.labelId } },
            update: {},
            create: { issueId, labelId: payload.labelId },
          });
        }
        affected = accessibleIds.length;
        break;

      case 'remove_label':
        if (!payload?.labelId) throw new Error('labelId is required for remove_label action');
        const removeLabelResult = await prisma.issueLabel.deleteMany({
          where: { issueId: { in: accessibleIds }, labelId: payload.labelId },
        });
        affected = removeLabelResult.count;
        break;

      case 'assign_milestone':
        if (!payload?.milestoneId)
          throw new Error('milestoneId is required for assign_milestone action');
        const milestoneResult = await prisma.issue.updateMany({
          where: { id: { in: accessibleIds } },
          data: { milestoneId: payload.milestoneId },
        });
        affected = milestoneResult.count;
        break;

      case 'set_priority':
        if (!payload?.priority) throw new Error('priority is required for set_priority action');
        const priorityResult = await prisma.issue.updateMany({
          where: { id: { in: accessibleIds } },
          data: { priority: payload.priority },
        });
        affected = priorityResult.count;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      success: true,
      affected,
      message: `Successfully applied "${action}" to ${affected} issue(s)`,
    };
  }

  // ── Teams ──────────────────────────────────────────────────────────────────

  /**
   * List all teams (with membership info)
   */
  static async getTeams(page = 1, limit = 20): Promise<TeamListResponse> {
    const skip = (page - 1) * limit;

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { members: true } },
          members: {
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  githubLogin: true,
                },
              },
            },
          },
        },
      }),
      prisma.team.count(),
    ]);

    return {
      teams: teams.map(toTeamResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new team and add the creator as the owner
   */
  static async createTeam(userId: string, data: CreateTeamRequest): Promise<TeamResponse> {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        members: {
          create: { userId, role: 'owner' },
        },
      },
      include: {
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                githubLogin: true,
              },
            },
          },
        },
      },
    });

    return toTeamResponse(team);
  }

  // ── Health ─────────────────────────────────────────────────────────────────

  /**
   * Check database connectivity and return health status
   */
  static async getHealth(): Promise<{
    status: string;
    version: string;
    uptime: number;
    timestamp: string;
    services: { database: string; api: string };
  }> {
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      version: process.env.npm_package_version ?? '1.2.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'operational',
      },
    };
  }
}

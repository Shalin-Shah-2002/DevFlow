import prisma from "../config/prisma";
import { CreateViewInput, UpdateViewInput } from "../validators/views.validator";

export class ViewsService {
  // ─── 6.1 Get All Saved Views ──────────────────────────────────────────────
  async getViews(userId: string) {
    const views = await prisma.savedView.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return views;
  }

  // ─── 6.2 Create Saved View ────────────────────────────────────────────────
  async createView(userId: string, data: CreateViewInput) {
    // If new view set as default, unset all others first
    if (data.isDefault) {
      await prisma.savedView.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const view = await prisma.savedView.create({
      data: {
        name: data.name,
        filters: data.filters,
        isDefault: data.isDefault ?? false,
        userId,
      },
    });

    return view;
  }

  // ─── 6.3 Update Saved View ────────────────────────────────────────────────
  async updateView(userId: string, viewId: string, data: UpdateViewInput) {
    // Check ownership
    const existing = await prisma.savedView.findFirst({
      where: { id: viewId, userId },
    });

    if (!existing) return null;

    // If setting as default, unset others
    if (data.isDefault) {
      await prisma.savedView.updateMany({
        where: { userId, isDefault: true, id: { not: viewId } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.savedView.update({
      where: { id: viewId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.filters && { filters: data.filters }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    return updated;
  }

  // ─── 6.4 Delete Saved View ────────────────────────────────────────────────
  async deleteView(userId: string, viewId: string) {
    const existing = await prisma.savedView.findFirst({
      where: { id: viewId, userId },
    });

    if (!existing) return false;

    await prisma.savedView.delete({ where: { id: viewId } });
    return true;
  }

  // ─── 6.5 Apply Saved View (fetch issues using stored filters) ─────────────
  async applyView(userId: string, viewId: string, page = 1, limit = 20) {
    // 1. Fetch the view
    const view = await prisma.savedView.findFirst({
      where: { id: viewId, userId },
    });

    if (!view) return null;

    const filters = view.filters as Record<string, any>;

    // 2. Build dynamic where clause
    const where: Record<string, any> = {
      repository: {
        users: { some: { userId } },
      },
    };

    if (filters.state && filters.state !== "all") {
      where.state = filters.state;
    }

    if (filters.priority?.length) {
      where.priority = { in: filters.priority };
    }

    if (filters.labels?.length) {
      where.labels = {
        some: {
          label: { name: { in: filters.labels } },
        },
      };
    }

    if (filters.assignee) {
      if (filters.assignee === "me") {
        where.assignees = { some: { userId } };
      } else {
        // Resolve github login → userId since IssueAssignee holds userId only
        const assigneeUser = await prisma.user.findUnique({
          where: { githubLogin: filters.assignee },
          select: { id: true },
        });
        if (assigneeUser) {
          where.assignees = { some: { userId: assigneeUser.id } };
        }
      }
    }

    if (filters.repository) {
      where.repositoryId = filters.repository;
    }

    if (filters.category) {
      where.categories = {
        some: { categoryId: filters.category },
      };
    }

    if (filters.milestone) {
      where.milestoneId = filters.milestone;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { body: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.createdAfter) {
      where.githubCreatedAt = {
        ...(where.githubCreatedAt || {}),
        gte: new Date(filters.createdAfter),
      };
    }

    if (filters.createdBefore) {
      where.githubCreatedAt = {
        ...(where.githubCreatedAt || {}),
        lte: new Date(filters.createdBefore),
      };
    }

    // 3. Map sort aliases → actual Prisma field names
    const sortFieldMap: Record<string, string> = {
      created: "githubCreatedAt",
      updated: "githubUpdatedAt",
      priority: "priority",
    };
    const sortField = sortFieldMap[filters.sort] ?? "githubUpdatedAt";

    // 4. Run query
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          repository: { select: { id: true, name: true, fullName: true } },
          creator: { select: { id: true, name: true, avatar: true } },
          labels: { include: { label: true } },
          assignees: true,
          categories: { include: { category: true } },
        },
        orderBy: {
          [sortField]: filters.order ?? "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      view: { id: view.id, name: view.name, filters },
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
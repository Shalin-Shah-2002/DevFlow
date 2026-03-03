"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewsService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class ViewsService {
    normalizeFilters(rawFilters) {
        if (!rawFilters || typeof rawFilters !== "object" || Array.isArray(rawFilters)) {
            return {};
        }
        const raw = rawFilters;
        const stateCandidate = typeof raw.state === "string" ? raw.state : typeof raw.status === "string" ? raw.status : undefined;
        const normalizedState = stateCandidate === "OPEN"
            ? "open"
            : stateCandidate === "CLOSED"
                ? "closed"
                : stateCandidate;
        const normalizeStringArray = (value) => {
            if (Array.isArray(value)) {
                return value.filter((item) => typeof item === "string" && item.trim().length > 0);
            }
            if (typeof value === "string" && value.trim().length > 0) {
                return [value];
            }
            return [];
        };
        const filters = {
            ...raw,
            state: normalizedState,
            priority: normalizeStringArray(raw.priority),
            labels: normalizeStringArray(raw.labels),
        };
        if (filters.state !== "open" && filters.state !== "closed" && filters.state !== "all") {
            delete filters.state;
        }
        if (typeof filters.order !== "string" || (filters.order !== "asc" && filters.order !== "desc")) {
            delete filters.order;
        }
        if (typeof filters.sort !== "string") {
            delete filters.sort;
        }
        if (typeof filters.search !== "string") {
            delete filters.search;
        }
        if (typeof filters.assignee !== "string") {
            delete filters.assignee;
        }
        if (typeof filters.repository !== "string") {
            delete filters.repository;
        }
        if (typeof filters.category !== "string") {
            delete filters.category;
        }
        if (typeof filters.milestone !== "string") {
            delete filters.milestone;
        }
        if (typeof filters.createdAfter !== "string" || Number.isNaN(new Date(filters.createdAfter).getTime())) {
            delete filters.createdAfter;
        }
        if (typeof filters.createdBefore !== "string" || Number.isNaN(new Date(filters.createdBefore).getTime())) {
            delete filters.createdBefore;
        }
        return filters;
    }
    // ─── 6.1 Get All Saved Views ──────────────────────────────────────────────
    async getViews(userId) {
        const views = await prisma_1.default.savedView.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        return views;
    }
    // ─── 6.2 Create Saved View ────────────────────────────────────────────────
    async createView(userId, data) {
        // If new view set as default, unset all others first
        if (data.isDefault) {
            await prisma_1.default.savedView.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const view = await prisma_1.default.savedView.create({
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
    async updateView(userId, viewId, data) {
        // Check ownership
        const existing = await prisma_1.default.savedView.findFirst({
            where: { id: viewId, userId },
        });
        if (!existing)
            return null;
        // If setting as default, unset others
        if (data.isDefault) {
            await prisma_1.default.savedView.updateMany({
                where: { userId, isDefault: true, id: { not: viewId } },
                data: { isDefault: false },
            });
        }
        const updated = await prisma_1.default.savedView.update({
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
    async deleteView(userId, viewId) {
        const existing = await prisma_1.default.savedView.findFirst({
            where: { id: viewId, userId },
        });
        if (!existing)
            return false;
        await prisma_1.default.savedView.delete({ where: { id: viewId } });
        return true;
    }
    // ─── 6.5 Apply Saved View (fetch issues using stored filters) ─────────────
    async applyView(userId, viewId, page = 1, limit = 20) {
        // 1. Fetch the view
        const view = await prisma_1.default.savedView.findFirst({
            where: { id: viewId, userId },
        });
        if (!view)
            return null;
        const filters = this.normalizeFilters(view.filters);
        // 2. Build dynamic where clause
        const where = {
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
            }
            else {
                // Resolve github login → userId since IssueAssignee holds userId only
                const assigneeUser = await prisma_1.default.user.findUnique({
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
        const sortFieldMap = {
            created: "githubCreatedAt",
            updated: "githubUpdatedAt",
            priority: "priority",
        };
        const sortField = sortFieldMap[filters.sort] ?? "githubUpdatedAt";
        // 4. Run query
        const [issues, total] = await Promise.all([
            prisma_1.default.issue.findMany({
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
            prisma_1.default.issue.count({ where }),
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
exports.ViewsService = ViewsService;

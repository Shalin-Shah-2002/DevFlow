"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AnalyticsService {
    // ─── Shared: build repo filter for a given user ───────────────────────────
    async userRepoIds(userId) {
        const links = await prisma_1.default.userRepository.findMany({
            where: { userId },
            select: { repositoryId: true },
        });
        return links.map((l) => l.repositoryId);
    }
    // ─── 8.1 Dashboard Overview ───────────────────────────────────────────────
    async getDashboard(userId) {
        const repoIds = await this.userRepoIds(userId);
        const [totalRepos, totalIssues, openIssues, closedIssues, totalComments, issuesByPriority,] = await Promise.all([
            // Total repos
            prisma_1.default.userRepository.count({ where: { userId } }),
            // Total issues
            prisma_1.default.issue.count({ where: { repositoryId: { in: repoIds } } }),
            // Open issues
            prisma_1.default.issue.count({
                where: { repositoryId: { in: repoIds }, state: "open" },
            }),
            // Closed issues
            prisma_1.default.issue.count({
                where: { repositoryId: { in: repoIds }, state: "closed" },
            }),
            // Total comments
            prisma_1.default.comment.count({
                where: { issue: { repositoryId: { in: repoIds } } },
            }),
            // Issues by priority
            prisma_1.default.issue.groupBy({
                by: ["priority"],
                where: { repositoryId: { in: repoIds } },
                _count: { _all: true },
            }),
        ]);
        const priorityMap = { P0: 0, P1: 0, P2: 0, P3: 0, unset: 0 };
        for (const row of issuesByPriority) {
            const key = row.priority ?? "unset";
            priorityMap[key] = row._count._all;
        }
        return {
            totalRepositories: totalRepos,
            totalIssues,
            openIssues,
            closedIssues,
            totalComments,
            closedRate: totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0,
            issuesByPriority: priorityMap,
        };
    }
    // ─── 8.2 Issues by Status ─────────────────────────────────────────────────
    async getIssuesByStatus(userId) {
        const repoIds = await this.userRepoIds(userId);
        const rows = await prisma_1.default.issue.groupBy({
            by: ["state", "customStatus"],
            where: { repositoryId: { in: repoIds } },
            _count: { _all: true },
        });
        // By GitHub state
        const byState = { open: 0, closed: 0 };
        const byCustomStatus = {};
        for (const row of rows) {
            byState[row.state] = (byState[row.state] ?? 0) + row._count._all;
            const cs = row.customStatus ?? "none";
            byCustomStatus[cs] = (byCustomStatus[cs] ?? 0) + row._count._all;
        }
        return { byState, byCustomStatus };
    }
    // ─── 8.3 Issues by Repository ─────────────────────────────────────────────
    async getIssuesByRepo(userId) {
        const repoIds = await this.userRepoIds(userId);
        const rows = await prisma_1.default.issue.groupBy({
            by: ["repositoryId", "state"],
            where: { repositoryId: { in: repoIds } },
            _count: { _all: true },
        });
        // Fetch repo names
        const repos = await prisma_1.default.repository.findMany({
            where: { id: { in: repoIds } },
            select: { id: true, name: true, fullName: true },
        });
        const repoMap = Object.fromEntries(repos.map((r) => [r.id, r]));
        const result = {};
        for (const row of rows) {
            const repo = repoMap[row.repositoryId];
            if (!repo)
                continue;
            if (!result[row.repositoryId]) {
                result[row.repositoryId] = {
                    name: repo.name,
                    fullName: repo.fullName,
                    open: 0,
                    closed: 0,
                    total: 0,
                };
            }
            result[row.repositoryId][row.state] += row._count._all;
            result[row.repositoryId].total += row._count._all;
        }
        return Object.values(result).sort((a, b) => b.total - a.total);
    }
    // ─── 8.4 Issues Over Time ─────────────────────────────────────────────────
    async getIssuesOverTime(userId, period = "30d") {
        const repoIds = await this.userRepoIds(userId);
        const periodDays = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        };
        const days = periodDays[period] ?? 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const issues = await prisma_1.default.issue.findMany({
            where: {
                repositoryId: { in: repoIds },
                githubCreatedAt: { gte: since },
            },
            select: { githubCreatedAt: true, closedAt: true, state: true },
            orderBy: { githubCreatedAt: "asc" },
        });
        // Bucket by date (YYYY-MM-DD)
        const created = {};
        const closed = {};
        for (const issue of issues) {
            const d = issue.githubCreatedAt.toISOString().slice(0, 10);
            created[d] = (created[d] ?? 0) + 1;
            if (issue.closedAt) {
                const cd = issue.closedAt.toISOString().slice(0, 10);
                if (new Date(cd) >= since) {
                    closed[cd] = (closed[cd] ?? 0) + 1;
                }
            }
        }
        // Build full date range
        const timeline = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            timeline.push({ date: key, created: created[key] ?? 0, closed: closed[key] ?? 0 });
        }
        return { period, timeline };
    }
    // ─── 8.5 Assignee Workload ────────────────────────────────────────────────
    async getAssigneeWorkload(userId) {
        const repoIds = await this.userRepoIds(userId);
        const assignees = await prisma_1.default.issueAssignee.findMany({
            where: { issue: { repositoryId: { in: repoIds } } },
            select: {
                userId: true,
                issue: { select: { state: true } },
            },
        });
        // Aggregate by userId
        const workload = {};
        for (const row of assignees) {
            if (!workload[row.userId]) {
                workload[row.userId] = { open: 0, closed: 0, total: 0 };
            }
            workload[row.userId][row.issue.state] += 1;
            workload[row.userId].total += 1;
        }
        // Enrich with user data
        const userIds = Object.keys(workload);
        const users = await prisma_1.default.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, githubLogin: true, avatar: true },
        });
        return users
            .map((u) => ({
            userId: u.id,
            name: u.name,
            githubLogin: u.githubLogin,
            avatar: u.avatar,
            ...workload[u.id],
        }))
            .sort((a, b) => b.open - a.open);
    }
    // ─── 8.6 Completion Rate ──────────────────────────────────────────────────
    async getCompletionRate(userId) {
        const repoIds = await this.userRepoIds(userId);
        const repos = await prisma_1.default.repository.findMany({
            where: { id: { in: repoIds } },
            select: {
                id: true,
                name: true,
                fullName: true,
                _count: { select: { issues: true } },
                issues: {
                    where: { state: "closed" },
                    select: { id: true },
                },
            },
        });
        const result = repos.map((r) => {
            const total = r._count.issues;
            const closed = r.issues.length;
            return {
                repositoryId: r.id,
                name: r.name,
                fullName: r.fullName,
                totalIssues: total,
                closedIssues: closed,
                openIssues: total - closed,
                completionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
            };
        });
        const totalIssues = result.reduce((s, r) => s + r.totalIssues, 0);
        const totalClosed = result.reduce((s, r) => s + r.closedIssues, 0);
        return {
            overall: {
                totalIssues,
                closedIssues: totalClosed,
                openIssues: totalIssues - totalClosed,
                completionRate: totalIssues > 0 ? Math.round((totalClosed / totalIssues) * 100) : 0,
            },
            byRepository: result.sort((a, b) => b.completionRate - a.completionRate),
        };
    }
}
exports.AnalyticsService = AnalyticsService;

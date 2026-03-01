"use strict";
// ─── Additional Features Model Types ─────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMilestoneResponse = toMilestoneResponse;
exports.toTeamResponse = toTeamResponse;
function toMilestoneResponse(m) {
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
function toTeamResponse(t) {
    return {
        id: t.id,
        name: t.name,
        description: t.description ?? null,
        memberCount: t._count?.members ?? t.members?.length ?? 0,
        members: t.members?.map((m) => ({
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

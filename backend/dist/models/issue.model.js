"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIssueResponse = toIssueResponse;
exports.toCommentResponse = toCommentResponse;
// ============= TRANSFORMATION FUNCTIONS =============
function toIssueResponse(issue) {
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
        labels: issue.labels?.map((il) => ({
            id: il.label.id,
            name: il.label.name,
            color: il.label.color,
            description: il.label.description,
        })) || [],
        assignees: issue.assignees || [],
        categories: issue.categories?.map((ic) => ({
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
function toCommentResponse(comment) {
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

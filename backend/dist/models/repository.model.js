"use strict";
// Repository Models and Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRepositoryResponse = toRepositoryResponse;
// Helper function to convert GitHub repo to our format
function toRepositoryResponse(repo, userRepo) {
    return {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        url: repo.url,
        owner: repo.owner,
        isPrivate: repo.isPrivate,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        openIssuesCount: repo.openIssuesCount,
        webhookEnabled: repo.webhookEnabled,
        webhookId: repo.webhookId,
        lastSyncedAt: repo.lastSyncedAt,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
        userRole: userRepo?.role,
        group: userRepo?.group,
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserProfile = toUserProfile;
/**
 * Convert Prisma User to UserProfile (removes sensitive data)
 */
function toUserProfile(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        githubLogin: user.githubLogin,
        githubId: Number(user.githubId),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

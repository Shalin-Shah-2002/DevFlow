"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../config/prisma"));
const issue_model_1 = require("../models/issue.model");
class IssueService {
    /**
     * Get all issues with filters
     */
    static async getIssues(userId, filters) {
        const { state = 'all', priority, label, repositoryId, assignee, search, categoryId, milestoneId, createdAfter, createdBefore, page = 1, limit = 20, sort = 'updated', order = 'desc', } = filters;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            repository: {
                users: {
                    some: { userId },
                },
            },
        };
        // State filter
        if (state !== 'all') {
            where.state = state;
        }
        // Priority filter
        if (priority) {
            if (Array.isArray(priority)) {
                where.priority = { in: priority };
            }
            else {
                where.priority = priority;
            }
        }
        // Repository filter
        if (repositoryId) {
            where.repositoryId = repositoryId;
        }
        // Milestone filter
        if (milestoneId) {
            where.milestoneId = milestoneId;
        }
        // Label filter
        if (label) {
            const labels = Array.isArray(label) ? label : [label];
            where.labels = {
                some: {
                    label: {
                        name: { in: labels },
                    },
                },
            };
        }
        // Assignee filter
        if (assignee) {
            if (assignee === 'me') {
                where.assignees = {
                    some: { userId },
                };
            }
            else {
                where.assignees = {
                    some: { userId: assignee },
                };
            }
        }
        // Category filter
        if (categoryId) {
            where.categories = {
                some: { categoryId },
            };
        }
        // Date filters
        if (createdAfter || createdBefore) {
            where.githubCreatedAt = {};
            if (createdAfter) {
                where.githubCreatedAt.gte = new Date(createdAfter);
            }
            if (createdBefore) {
                where.githubCreatedAt.lte = new Date(createdBefore);
            }
        }
        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { body: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Sorting
        const orderBy = {};
        switch (sort) {
            case 'created':
                orderBy.githubCreatedAt = order;
                break;
            case 'updated':
                orderBy.githubUpdatedAt = order;
                break;
            case 'priority':
                orderBy.priority = order;
                break;
            case 'comments':
                orderBy.comments = { _count: order };
                break;
            default:
                orderBy.githubUpdatedAt = 'desc';
        }
        // Execute query
        const [issues, total] = await Promise.all([
            prisma_1.default.issue.findMany({
                where,
                include: {
                    repository: true,
                    creator: true,
                    labels: {
                        include: {
                            label: true,
                        },
                    },
                    assignees: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    milestone: true,
                    _count: {
                        select: { comments: true },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma_1.default.issue.count({ where }),
        ]);
        const data = issues.map((issue) => (0, issue_model_1.toIssueResponse)(issue));
        // Count applied filters
        let appliedFilters = 0;
        if (state !== 'all')
            appliedFilters++;
        if (priority)
            appliedFilters++;
        if (label)
            appliedFilters++;
        if (repositoryId)
            appliedFilters++;
        if (assignee)
            appliedFilters++;
        if (categoryId)
            appliedFilters++;
        if (milestoneId)
            appliedFilters++;
        if (search)
            appliedFilters++;
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: {
                state,
                priority: priority,
                appliedFilters,
            },
        };
    }
    /**
     * Get single issue with details
     */
    static async getIssueById(issueId, userId) {
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
            include: {
                repository: true,
                creator: true,
                labels: {
                    include: {
                        label: true,
                    },
                },
                assignees: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                milestone: true,
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        githubCreatedAt: 'asc',
                    },
                },
                notes: true,
                timeEntries: true,
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const baseResponse = (0, issue_model_1.toIssueResponse)(issue);
        // Calculate time spent
        const timeSpent = issue.timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        return {
            ...baseResponse,
            comments: issue.comments.map((c) => (0, issue_model_1.toCommentResponse)(c)),
            timeSpent,
            notesCount: issue.notes.length,
        };
    }
    /**
     * Create new issue on GitHub and store locally
     */
    static async createIssue(userId, data, accessToken) {
        // Get repository
        const repository = await prisma_1.default.repository.findFirst({
            where: {
                id: data.repositoryId,
                users: {
                    some: { userId },
                },
            },
        });
        if (!repository) {
            throw new Error('Repository not found');
        }
        // Parse owner and repo
        const [owner, repo] = repository.fullName.split('/');
        try {
            // Create issue on GitHub
            const githubIssue = await this.createGitHubIssue(owner, repo, {
                title: data.title,
                body: data.body,
                labels: data.labels,
                assignees: data.assignees,
                milestone: data.milestone,
            }, accessToken);
            // Get creator (current user)
            const creator = await prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            // Create issue in database
            const issue = await prisma_1.default.issue.create({
                data: {
                    githubId: githubIssue.id,
                    repositoryId: repository.id,
                    number: githubIssue.number,
                    title: githubIssue.title,
                    body: githubIssue.body || null,
                    state: githubIssue.state,
                    stateReason: githubIssue.state_reason,
                    creatorId: creator?.id,
                    priority: data.priority,
                    customStatus: data.customStatus,
                    estimatedTime: data.estimatedTime,
                    githubCreatedAt: new Date(githubIssue.created_at),
                    githubUpdatedAt: new Date(githubIssue.updated_at),
                    closedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
                },
                include: {
                    repository: true,
                    creator: true,
                    _count: {
                        select: { comments: true },
                    },
                },
            });
            // Sync labels
            if (githubIssue.labels && githubIssue.labels.length > 0) {
                await this.syncIssueLabels(issue.id, repository.id, githubIssue.labels);
            }
            // Sync assignees
            if (githubIssue.assignees && githubIssue.assignees.length > 0) {
                await this.syncIssueAssignees(issue.id, githubIssue.assignees);
            }
            // Fetch full issue to return
            return this.getIssueById(issue.id, userId);
        }
        catch (error) {
            console.error('Error creating issue:', error);
            throw new Error(`Failed to create issue: ${error.message}`);
        }
    }
    /**
     * Update issue on GitHub and locally
     */
    static async updateIssue(issueId, userId, data, accessToken) {
        // Get issue
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
            include: {
                repository: true,
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const [owner, repo] = issue.repository.fullName.split('/');
        try {
            // Update on GitHub
            const githubData = {};
            if (data.title)
                githubData.title = data.title;
            if (data.body !== undefined)
                githubData.body = data.body;
            if (data.state)
                githubData.state = data.state;
            if (data.stateReason)
                githubData.state_reason = data.stateReason;
            if (data.labels)
                githubData.labels = data.labels;
            if (data.assignees)
                githubData.assignees = data.assignees;
            if (Object.keys(githubData).length > 0) {
                const githubIssue = await this.updateGitHubIssue(owner, repo, issue.number, githubData, accessToken);
                // Update in database
                const updateData = {
                    title: githubIssue.title,
                    body: githubIssue.body,
                    state: githubIssue.state,
                    stateReason: githubIssue.state_reason,
                    githubUpdatedAt: new Date(githubIssue.updated_at),
                    closedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
                };
                // Update custom fields
                if (data.priority !== undefined)
                    updateData.priority = data.priority;
                if (data.customStatus !== undefined)
                    updateData.customStatus = data.customStatus;
                if (data.estimatedTime !== undefined)
                    updateData.estimatedTime = data.estimatedTime;
                await prisma_1.default.issue.update({
                    where: { id: issueId },
                    data: updateData,
                });
                // Sync labels
                if (githubIssue.labels) {
                    await this.syncIssueLabels(issueId, issue.repositoryId, githubIssue.labels);
                }
                // Sync assignees
                if (githubIssue.assignees) {
                    await this.syncIssueAssignees(issueId, githubIssue.assignees);
                }
            }
            else {
                // Only update custom fields locally
                await prisma_1.default.issue.update({
                    where: { id: issueId },
                    data: {
                        priority: data.priority,
                        customStatus: data.customStatus,
                        estimatedTime: data.estimatedTime,
                    },
                });
            }
            return this.getIssueById(issueId, userId);
        }
        catch (error) {
            console.error('Error updating issue:', error);
            throw new Error(`Failed to update issue: ${error.message}`);
        }
    }
    /**
     * Close issue
     */
    static async closeIssue(issueId, userId, reason, accessToken) {
        return this.updateIssue(issueId, userId, {
            state: 'closed',
            stateReason: reason,
        }, accessToken);
    }
    /**
     * Bulk operations on issues
     */
    static async bulkOperation(userId, operation, accessToken) {
        const { action, issueIds, data } = operation;
        const results = {
            successful: 0,
            failed: 0,
            total: issueIds.length,
            errors: [],
        };
        for (const issueId of issueIds) {
            try {
                switch (action) {
                    case 'close':
                        await this.closeIssue(issueId, userId, data.stateReason || 'completed', accessToken);
                        break;
                    case 'label':
                        await this.manageLabels(issueId, userId, { labels: data.labels, action: 'add' }, accessToken);
                        break;
                    case 'assign':
                        await this.assignUsers(issueId, userId, { assignees: data.assignees }, accessToken);
                        break;
                    case 'priority':
                        await prisma_1.default.issue.update({
                            where: { id: issueId },
                            data: { priority: data.priority },
                        });
                        break;
                    case 'category':
                        await this.addCategories(issueId, userId, data.categoryIds);
                        break;
                    default:
                        throw new Error(`Unknown action: ${action}`);
                }
                results.successful++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    issueId,
                    error: error.message,
                });
            }
        }
        return {
            success: true,
            message: 'Bulk operation completed',
            results,
        };
    }
    /**
     * Get issue comments
     */
    static async getIssueComments(issueId, userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        // Verify access
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const [comments, total] = await Promise.all([
            prisma_1.default.comment.findMany({
                where: { issueId },
                include: {
                    user: true,
                },
                orderBy: {
                    githubCreatedAt: 'asc',
                },
                skip,
                take: limit,
            }),
            prisma_1.default.comment.count({ where: { issueId } }),
        ]);
        return {
            success: true,
            data: comments.map((c) => (0, issue_model_1.toCommentResponse)(c)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Add comment to issue
     */
    static async addComment(issueId, userId, data, accessToken) {
        // Get issue
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
            include: {
                repository: true,
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const [owner, repo] = issue.repository.fullName.split('/');
        try {
            // Create comment on GitHub
            const githubComment = await this.createGitHubComment(owner, repo, issue.number, data.body, accessToken);
            // Store in database
            const comment = await prisma_1.default.comment.create({
                data: {
                    githubId: githubComment.id,
                    body: githubComment.body,
                    issueId,
                    userId,
                    githubCreatedAt: new Date(githubComment.created_at),
                    githubUpdatedAt: new Date(githubComment.updated_at),
                },
                include: {
                    user: true,
                },
            });
            return (0, issue_model_1.toCommentResponse)(comment);
        }
        catch (error) {
            console.error('Error creating comment:', error);
            throw new Error(`Failed to create comment: ${error.message}`);
        }
    }
    /**
     * Update comment
     */
    static async updateComment(issueId, commentId, userId, data, accessToken) {
        // Get comment
        const comment = await prisma_1.default.comment.findFirst({
            where: {
                id: commentId,
                issueId,
                userId, // Only author can edit
                issue: {
                    repository: {
                        users: {
                            some: { userId },
                        },
                    },
                },
            },
            include: {
                issue: {
                    include: {
                        repository: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        const [owner, repo] = comment.issue.repository.fullName.split('/');
        try {
            // Update on GitHub
            const githubComment = await this.updateGitHubComment(owner, repo, Number(comment.githubId), data.body, accessToken);
            // Update in database
            const updated = await prisma_1.default.comment.update({
                where: { id: commentId },
                data: {
                    body: githubComment.body,
                    githubUpdatedAt: new Date(githubComment.updated_at),
                },
                include: {
                    user: true,
                },
            });
            return (0, issue_model_1.toCommentResponse)(updated);
        }
        catch (error) {
            console.error('Error updating comment:', error);
            throw new Error(`Failed to update comment: ${error.message}`);
        }
    }
    /**
     * Delete comment
     */
    static async deleteComment(issueId, commentId, userId, accessToken) {
        // Get comment
        const comment = await prisma_1.default.comment.findFirst({
            where: {
                id: commentId,
                issueId,
                userId, // Only author can delete
                issue: {
                    repository: {
                        users: {
                            some: { userId },
                        },
                    },
                },
            },
            include: {
                issue: {
                    include: {
                        repository: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        const [owner, repo] = comment.issue.repository.fullName.split('/');
        try {
            // Delete from GitHub
            await this.deleteGitHubComment(owner, repo, Number(comment.githubId), accessToken);
            // Delete from database
            await prisma_1.default.comment.delete({
                where: { id: commentId },
            });
            return {
                success: true,
                message: 'Comment deleted successfully',
            };
        }
        catch (error) {
            console.error('Error deleting comment:', error);
            throw new Error(`Failed to delete comment: ${error.message}`);
        }
    }
    /**
     * Assign users to issue
     */
    static async assignUsers(issueId, userId, data, accessToken) {
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
            include: {
                repository: true,
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const [owner, repo] = issue.repository.fullName.split('/');
        try {
            // Update on GitHub
            const githubIssue = await this.updateGitHubIssue(owner, repo, issue.number, { assignees: data.assignees }, accessToken);
            // Sync assignees
            await this.syncIssueAssignees(issueId, githubIssue.assignees || []);
            return {
                success: true,
                message: 'Users assigned successfully',
            };
        }
        catch (error) {
            console.error('Error assigning users:', error);
            throw new Error(`Failed to assign users: ${error.message}`);
        }
    }
    /**
     * Manage issue labels
     */
    static async manageLabels(issueId, userId, data, accessToken) {
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
            include: {
                repository: true,
                labels: {
                    include: {
                        label: true,
                    },
                },
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        const [owner, repo] = issue.repository.fullName.split('/');
        try {
            let newLabels = data.labels;
            if (data.action === 'add') {
                // Add to existing
                const existingLabels = issue.labels.map((il) => il.label.name);
                newLabels = [...new Set([...existingLabels, ...data.labels])];
            }
            else if (data.action === 'remove') {
                // Remove from existing
                const existingLabels = issue.labels.map((il) => il.label.name);
                newLabels = existingLabels.filter((l) => !data.labels.includes(l));
            }
            // 'set' action uses labels as-is
            // Update on GitHub
            const githubIssue = await this.updateGitHubIssue(owner, repo, issue.number, { labels: newLabels }, accessToken);
            // Sync labels
            await this.syncIssueLabels(issueId, issue.repositoryId, githubIssue.labels || []);
            return {
                success: true,
                message: 'Labels updated successfully',
                data: {
                    labels: newLabels,
                },
            };
        }
        catch (error) {
            console.error('Error managing labels:', error);
            throw new Error(`Failed to manage labels: ${error.message}`);
        }
    }
    /**
     * Add categories to issue (local only)
     */
    static async addCategories(issueId, userId, categoryIds) {
        // Verify access
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: {
                        some: { userId },
                    },
                },
            },
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        // Verify categories belong to user
        const categories = await prisma_1.default.category.findMany({
            where: {
                id: { in: categoryIds },
                userId,
            },
        });
        if (categories.length !== categoryIds.length) {
            throw new Error('One or more categories not found');
        }
        // Add categories
        await Promise.all(categoryIds.map((categoryId) => prisma_1.default.issueCategory.upsert({
            where: {
                issueId_categoryId: {
                    issueId,
                    categoryId,
                },
            },
            create: {
                issueId,
                categoryId,
            },
            update: {},
        })));
        return {
            success: true,
            message: 'Categories added successfully',
        };
    }
    // ============= GITHUB API METHODS =============
    static async createGitHubIssue(owner, repo, data, accessToken) {
        // Clean data - remove undefined/empty values
        const payload = {
            title: data.title,
        };
        if (data.body)
            payload.body = data.body;
        if (data.labels && data.labels.length > 0)
            payload.labels = data.labels;
        if (data.assignees && data.assignees.length > 0)
            payload.assignees = data.assignees;
        if (data.milestone)
            payload.milestone = data.milestone;
        try {
            const response = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/issues`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            return response.data;
        }
        catch (error) {
            // Handle GitHub API errors with detailed messages
            if (error.response?.status === 422) {
                const errors = error.response.data?.errors || [];
                const errorMessages = errors.map((e) => `${e.field}: ${e.message || e.code}`).join(', ');
                throw new Error(`GitHub validation failed: ${errorMessages || error.response.data?.message || 'Invalid request data. Check that assignees have repository access and labels exist.'}`);
            }
            throw error;
        }
    }
    static async updateGitHubIssue(owner, repo, issueNumber, data, accessToken) {
        try {
            const response = await axios_1.default.patch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            return response.data;
        }
        catch (error) {
            // Handle GitHub API errors with detailed messages
            if (error.response?.status === 422) {
                const errors = error.response.data?.errors || [];
                const errorMessages = errors.map((e) => `${e.field}: ${e.message || e.code}`).join(', ');
                throw new Error(`GitHub validation failed: ${errorMessages || error.response.data?.message || 'Invalid request data. Check that assignees have repository access and labels exist.'}`);
            }
            throw error;
        }
    }
    static async createGitHubComment(owner, repo, issueNumber, body, accessToken) {
        const response = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }
    static async updateGitHubComment(owner, repo, commentId, body, accessToken) {
        const response = await axios_1.default.patch(`https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}`, { body }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }
    static async deleteGitHubComment(owner, repo, commentId, accessToken) {
        await axios_1.default.delete(`https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
    }
    // ============= SYNC HELPERS =============
    static async syncIssueLabels(issueId, repositoryId, githubLabels) {
        // Remove all existing label links
        await prisma_1.default.issueLabel.deleteMany({
            where: { issueId },
        });
        // Add new labels
        for (const githubLabel of githubLabels) {
            // Find or create label
            let label = await prisma_1.default.label.findFirst({
                where: {
                    repositoryId,
                    name: githubLabel.name,
                },
            });
            if (!label) {
                label = await prisma_1.default.label.create({
                    data: {
                        githubId: githubLabel.id,
                        name: githubLabel.name,
                        color: githubLabel.color,
                        description: githubLabel.description,
                        repositoryId,
                    },
                });
            }
            // Link to issue
            await prisma_1.default.issueLabel.create({
                data: {
                    issueId,
                    labelId: label.id,
                },
            });
        }
    }
    static async syncIssueAssignees(issueId, githubAssignees) {
        // Remove all existing assignees
        await prisma_1.default.issueAssignee.deleteMany({
            where: { issueId },
        });
        // Add new assignees
        for (const githubUser of githubAssignees) {
            // Find or create user
            let user = await prisma_1.default.user.findUnique({
                where: { githubId: githubUser.id },
            });
            if (!user) {
                user = await prisma_1.default.user.create({
                    data: {
                        githubId: githubUser.id,
                        githubLogin: githubUser.login,
                        avatar: githubUser.avatar_url,
                        email: `${githubUser.login}@github.user`,
                        accessToken: '',
                    },
                });
            }
            // Link to issue
            await prisma_1.default.issueAssignee.create({
                data: {
                    issueId,
                    userId: user.id,
                },
            });
        }
    }
}
exports.IssueService = IssueService;

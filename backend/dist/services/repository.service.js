"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_model_1 = require("../models/repository.model");
class RepositoryService {
    /**
     * Get all repositories for a user
     */
    static async getUserRepositories(userId, options) {
        const { group, search, page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            users: {
                some: { userId },
            },
        };
        if (group) {
            where.users.some.group = group;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [repositories, total] = await Promise.all([
            prisma_1.default.repository.findMany({
                where,
                include: {
                    users: {
                        where: { userId },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.repository.count({ where }),
        ]);
        const data = repositories.map((repo) => (0, repository_model_1.toRepositoryResponse)(repo, repo.users[0]));
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get repository by ID
     */
    static async getRepositoryById(repositoryId, userId) {
        const repository = await prisma_1.default.repository.findFirst({
            where: {
                id: repositoryId,
                users: {
                    some: { userId },
                },
            },
            include: {
                users: {
                    where: { userId },
                },
                issues: {
                    select: {
                        id: true,
                        state: true,
                    },
                },
                labels: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!repository) {
            throw new Error('Repository not found');
        }
        // Calculate stats
        const stats = {
            totalIssues: repository.issues.length,
            openIssues: repository.issues.filter((i) => i.state === 'open').length,
            closedIssues: repository.issues.filter((i) => i.state === 'closed').length,
            labels: repository.labels.length,
            contributors: 0, // TODO: Calculate from issues/comments
        };
        const { issues, labels, ...repoData } = repository;
        return {
            ...(0, repository_model_1.toRepositoryResponse)(repoData, repository.users[0]),
            stats,
        };
    }
    /**
     * Add a new repository
     */
    static async addRepository(userId, repoUrl, group, accessToken) {
        // Parse repository URL
        const repoInfo = this.parseGitHubUrl(repoUrl);
        if (!repoInfo) {
            throw new Error('Invalid GitHub repository URL');
        }
        const { owner, repo } = repoInfo;
        // Fetch repository data from GitHub
        const githubRepo = await this.fetchGitHubRepository(owner, repo, accessToken);
        // Check if repository already exists
        let repository = await prisma_1.default.repository.findUnique({
            where: { githubId: githubRepo.id },
        });
        if (repository) {
            // Check if user already has access
            const existingLink = await prisma_1.default.userRepository.findUnique({
                where: {
                    userId_repositoryId: {
                        userId,
                        repositoryId: repository.id,
                    },
                },
            });
            if (existingLink) {
                throw new Error('Repository already added');
            }
            // Link existing repository to user
            const userRepo = await prisma_1.default.userRepository.create({
                data: {
                    userId,
                    repositoryId: repository.id,
                    role: 'admin',
                    group,
                },
            });
            return (0, repository_model_1.toRepositoryResponse)(repository, userRepo);
        }
        // Create new repository
        repository = await prisma_1.default.repository.create({
            data: {
                githubId: githubRepo.id,
                name: githubRepo.name,
                fullName: githubRepo.full_name,
                description: githubRepo.description,
                url: githubRepo.html_url,
                owner: githubRepo.owner.login,
                isPrivate: githubRepo.private,
                language: githubRepo.language,
                stars: githubRepo.stargazers_count,
                forks: githubRepo.forks_count,
                openIssuesCount: githubRepo.open_issues_count,
                lastSyncedAt: new Date(),
            },
        });
        // Link to user
        const userRepo = await prisma_1.default.userRepository.create({
            data: {
                userId,
                repositoryId: repository.id,
                role: 'admin',
                group,
            },
        });
        // Sync issues in background (non-blocking)
        this.syncRepositoryIssues(repository.id, owner, repo, accessToken).catch(console.error);
        return (0, repository_model_1.toRepositoryResponse)(repository, userRepo);
    }
    /**
     * Update repository settings
     */
    static async updateRepository(repositoryId, userId, data) {
        // Verify user has access
        const userRepo = await prisma_1.default.userRepository.findFirst({
            where: {
                userId,
                repositoryId,
            },
        });
        if (!userRepo) {
            throw new Error('Repository not found');
        }
        // Update user repository link (group)
        if (data.group !== undefined) {
            await prisma_1.default.userRepository.update({
                where: {
                    userId_repositoryId: {
                        userId,
                        repositoryId,
                    },
                },
                data: {
                    group: data.group,
                },
            });
        }
        // Update repository (webhookEnabled)
        if (data.webhookEnabled !== undefined) {
            await prisma_1.default.repository.update({
                where: { id: repositoryId },
                data: {
                    webhookEnabled: data.webhookEnabled,
                },
            });
        }
        return this.getRepositoryById(repositoryId, userId);
    }
    /**
     * Remove repository
     */
    static async removeRepository(repositoryId, userId) {
        // Remove user link
        const deleted = await prisma_1.default.userRepository.deleteMany({
            where: {
                userId,
                repositoryId,
            },
        });
        if (deleted.count === 0) {
            throw new Error('Repository not found');
        }
        // Check if any other users are linked to this repository
        const otherUsers = await prisma_1.default.userRepository.count({
            where: { repositoryId },
        });
        // If no other users, delete the repository and all related data
        if (otherUsers === 0) {
            await prisma_1.default.repository.delete({
                where: { id: repositoryId },
            });
        }
        return true;
    }
    /**
     * Sync repository issues from GitHub
     */
    static async syncRepositoryIssues(repositoryId, owner, repo, accessToken) {
        const repository = await prisma_1.default.repository.findUnique({
            where: { id: repositoryId },
        });
        if (!repository) {
            throw new Error('Repository not found');
        }
        let issuesAdded = 0;
        let issuesUpdated = 0;
        let issuesClosed = 0;
        try {
            // Fetch issues from GitHub
            const githubIssues = await this.fetchGitHubIssues(owner, repo, accessToken);
            // Sync each issue
            for (const githubIssue of githubIssues) {
                const existingIssue = await prisma_1.default.issue.findUnique({
                    where: { githubId: githubIssue.id },
                });
                // Find or create creator
                const creator = await this.findOrCreateUser(githubIssue.user);
                if (!existingIssue) {
                    // Create new issue
                    await prisma_1.default.issue.create({
                        data: {
                            githubId: githubIssue.id,
                            repositoryId: repository.id,
                            number: githubIssue.number,
                            title: githubIssue.title,
                            body: githubIssue.body,
                            state: githubIssue.state,
                            stateReason: githubIssue.state_reason,
                            creatorId: creator.id,
                            githubCreatedAt: new Date(githubIssue.created_at),
                            githubUpdatedAt: new Date(githubIssue.updated_at),
                            closedAt: githubIssue.closed_at
                                ? new Date(githubIssue.closed_at)
                                : null,
                        },
                    });
                    issuesAdded++;
                }
                else {
                    // Update existing issue
                    await prisma_1.default.issue.update({
                        where: { id: existingIssue.id },
                        data: {
                            title: githubIssue.title,
                            body: githubIssue.body,
                            state: githubIssue.state,
                            stateReason: githubIssue.state_reason,
                            githubUpdatedAt: new Date(githubIssue.updated_at),
                            closedAt: githubIssue.closed_at
                                ? new Date(githubIssue.closed_at)
                                : null,
                        },
                    });
                    if (existingIssue.state !== githubIssue.state) {
                        if (githubIssue.state === 'closed') {
                            issuesClosed++;
                        }
                    }
                    issuesUpdated++;
                }
            }
            // Update repository lastSyncedAt
            await prisma_1.default.repository.update({
                where: { id: repositoryId },
                data: {
                    lastSyncedAt: new Date(),
                    openIssuesCount: githubIssues.filter((i) => i.state === 'open').length,
                },
            });
            const totalIssues = await prisma_1.default.issue.count({
                where: { repositoryId },
            });
            return {
                success: true,
                message: 'Repository synced successfully',
                stats: {
                    issuesAdded,
                    issuesUpdated,
                    issuesClosed,
                    totalIssues,
                },
            };
        }
        catch (error) {
            console.error('Error syncing repository:', error);
            throw new Error('Failed to sync repository');
        }
    }
    /**
     * Setup GitHub webhook
     */
    static async setupWebhook(repositoryId, owner, repo, accessToken) {
        const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/github`;
        try {
            const response = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
                name: 'web',
                active: true,
                events: ['issues', 'issue_comment', 'label', 'milestone'],
                config: {
                    url: webhookUrl,
                    content_type: 'json',
                    secret: process.env.WEBHOOK_SECRET || 'your_webhook_secret',
                },
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            // Update repository with webhook ID
            await prisma_1.default.repository.update({
                where: { id: repositoryId },
                data: {
                    webhookId: response.data.id.toString(),
                    webhookEnabled: true,
                },
            });
            return {
                success: true,
                message: 'Webhook configured successfully',
                webhookId: response.data.id.toString(),
            };
        }
        catch (error) {
            console.error('Error setting up webhook:', error.response?.data || error);
            throw new Error('Failed to setup webhook');
        }
    }
    // ============= HELPER METHODS =============
    /**
     * Parse GitHub repository URL
     */
    static parseGitHubUrl(url) {
        const patterns = [
            /github\.com\/([^/]+)\/([^/]+)/,
            /^([^/]+)\/([^/]+)$/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, ''),
                };
            }
        }
        return null;
    }
    /**
     * Fetch repository from GitHub API
     */
    static async fetchGitHubRepository(owner, repo, accessToken) {
        try {
            const headers = {
                Accept: 'application/vnd.github.v3+json',
            };
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }
            const response = await axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Repository not found on GitHub');
            }
            throw new Error('Failed to fetch repository from GitHub');
        }
    }
    /**
     * Fetch issues from GitHub API
     */
    static async fetchGitHubIssues(owner, repo, accessToken) {
        try {
            const headers = {
                Accept: 'application/vnd.github.v3+json',
            };
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }
            const response = await axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                headers,
                params: {
                    state: 'all',
                    per_page: 100,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching GitHub issues:', error);
            return [];
        }
    }
    /**
     * Find or create user from GitHub data
     */
    static async findOrCreateUser(githubUser) {
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
        return user;
    }
}
exports.RepositoryService = RepositoryService;

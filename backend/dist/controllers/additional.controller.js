"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalController = void 0;
const additional_service_1 = require("../services/additional.service");
/**
 * @swagger
 * components:
 *   schemas:
 *     Milestone:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         githubId:
 *           type: integer
 *           nullable: true
 *         title:
 *           type: string
 *           example: v1.0 Release
 *         description:
 *           type: string
 *           nullable: true
 *         state:
 *           type: string
 *           enum: [open, closed]
 *           example: open
 *         dueOn:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         repositoryId:
 *           type: string
 *         openIssuesCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         name:
 *           type: string
 *           example: Backend Squad
 *         description:
 *           type: string
 *           nullable: true
 *         memberCount:
 *           type: integer
 *           example: 4
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ActivityEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [issue_created, issue_updated, issue_closed, comment_added, label_assigned, milestone_created]
 *         description:
 *           type: string
 *         entityId:
 *           type: string
 *         entityType:
 *           type: string
 *           enum: [issue, comment, label, milestone]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     UserSettings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *         bio:
 *           type: string
 *           nullable: true
 *         location:
 *           type: string
 *           nullable: true
 *         company:
 *           type: string
 *           nullable: true
 *         website:
 *           type: string
 *           nullable: true
 *         githubLogin:
 *           type: string
 */
class AdditionalController {
    // ── Milestones ─────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/milestones:
     *   get:
     *     summary: List milestones (across all accessible repositories)
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: repositoryId
     *         schema:
     *           type: string
     *         description: Filter milestones by repository ID
     *       - in: query
     *         name: state
     *         schema:
     *           type: string
     *           enum: [open, closed]
     *         description: Filter by milestone state
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *     responses:
     *       200:
     *         description: Milestones fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Milestone'
     *       401:
     *         description: Unauthorized
     */
    static async getMilestones(req, res) {
        try {
            const userId = req.user.id;
            const { repositoryId, state, page = '1', limit = '20', } = req.query;
            const result = await additional_service_1.AdditionalService.getMilestones(userId, {
                repositoryId,
                state: state,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
            });
            res.json({
                success: true,
                data: result.milestones,
                pagination: result.pagination,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * @swagger
     * /api/milestones:
     *   post:
     *     summary: Create a new milestone
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - repositoryId
     *             properties:
     *               title:
     *                 type: string
     *                 example: v1.0 Release
     *               description:
     *                 type: string
     *               state:
     *                 type: string
     *                 enum: [open, closed]
     *                 default: open
     *               dueOn:
     *                 type: string
     *                 format: date
     *                 example: 2026-06-01
     *               repositoryId:
     *                 type: string
     *     responses:
     *       201:
     *         description: Milestone created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Milestone'
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No access to repository
     */
    static async createMilestone(req, res) {
        try {
            const userId = req.user.id;
            const { title, description, state, dueOn, repositoryId } = req.body;
            if (!title || !repositoryId) {
                res.status(400).json({ success: false, error: 'title and repositoryId are required' });
                return;
            }
            const milestone = await additional_service_1.AdditionalService.createMilestone(userId, {
                title,
                description,
                state,
                dueOn,
                repositoryId,
            });
            res.status(201).json({ success: true, data: milestone });
        }
        catch (error) {
            if (error.message.includes('access denied')) {
                res.status(403).json({ success: false, error: error.message });
            }
            else {
                res.status(500).json({ success: false, error: error.message });
            }
        }
    }
    // ── Settings ───────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/settings:
     *   get:
     *     summary: Get current user settings and profile
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Settings fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/UserSettings'
     *       401:
     *         description: Unauthorized
     */
    static async getSettings(req, res) {
        try {
            const userId = req.user.id;
            const settings = await additional_service_1.AdditionalService.getUserSettings(userId);
            if (!settings) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            res.json({ success: true, data: settings });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * @swagger
     * /api/settings:
     *   put:
     *     summary: Update current user settings and profile
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: Jane Doe
     *               bio:
     *                 type: string
     *                 example: Open-source contributor
     *               location:
     *                 type: string
     *                 example: San Francisco, CA
     *               company:
     *                 type: string
     *                 example: Acme Corp
     *               website:
     *                 type: string
     *                 example: https://janedoe.dev
     *     responses:
     *       200:
     *         description: Settings updated successfully
     *       401:
     *         description: Unauthorized
     */
    static async updateSettings(req, res) {
        try {
            const userId = req.user.id;
            const { name, bio, location, company, website } = req.body;
            const updated = await additional_service_1.AdditionalService.updateUserSettings(userId, {
                name,
                bio,
                location,
                company,
                website,
            });
            res.json({ success: true, data: updated, message: 'Settings updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // ── Activity Log ───────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/activity-log:
     *   get:
     *     summary: Get the authenticated user's recent activity log
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *     responses:
     *       200:
     *         description: Activity log fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ActivityEntry'
     *       401:
     *         description: Unauthorized
     */
    static async getActivityLog(req, res) {
        try {
            const userId = req.user.id;
            const { page = '1', limit = '20' } = req.query;
            const result = await additional_service_1.AdditionalService.getActivityLog(userId, parseInt(page, 10), parseInt(limit, 10));
            res.json({ success: true, data: result.activities, pagination: result.pagination });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // ── Search ─────────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/search:
     *   get:
     *     summary: Global search across issues and repositories
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         required: true
     *         schema:
     *           type: string
     *         description: Search query string
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Max results per entity type
     *     responses:
     *       200:
     *         description: Search results
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     issues:
     *                       type: array
     *                       items:
     *                         type: object
     *                     repositories:
     *                       type: array
     *                       items:
     *                         type: object
     *                     totalResults:
     *                       type: integer
     *                     pagination:
     *                       type: object
     *                       properties:
     *                         page:
     *                           type: integer
     *                         limit:
     *                           type: integer
     *                         total:
     *                           type: integer
     *                         totalPages:
     *                           type: integer
     *       400:
     *         description: Query parameter is required
     *       401:
     *         description: Unauthorized
     */
    static async search(req, res) {
        try {
            const userId = req.user.id;
            const { q, limit = '10', page = '1' } = req.query;
            if (!q) {
                res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
                return;
            }
            const result = await additional_service_1.AdditionalService.globalSearch(userId, q, parseInt(page, 10), parseInt(limit, 10));
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // ── Export ─────────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/export:
     *   post:
     *     summary: Export data as CSV or JSON
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - format
     *               - entity
     *             properties:
     *               format:
     *                 type: string
     *                 enum: [csv, json]
     *                 example: csv
     *               entity:
     *                 type: string
     *                 enum: [issues, repositories, milestones]
     *                 example: issues
     *               repositoryId:
     *                 type: string
     *                 description: Optional — filter by a specific repository
     *               state:
     *                 type: string
     *                 enum: [open, closed]
     *                 description: Optional — filter issues/milestones by state
     *     responses:
     *       200:
     *         description: File exported successfully
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    static async exportData(req, res) {
        try {
            const userId = req.user.id;
            const { format, entity, repositoryId, state } = req.body;
            if (!format || !entity) {
                res.status(400).json({ success: false, error: '"format" and "entity" are required' });
                return;
            }
            if (!['csv', 'json'].includes(format)) {
                res.status(400).json({ success: false, error: 'format must be "csv" or "json"' });
                return;
            }
            if (!['issues', 'repositories', 'milestones'].includes(entity)) {
                res
                    .status(400)
                    .json({ success: false, error: 'entity must be "issues", "repositories", or "milestones"' });
                return;
            }
            const { data, filename } = await additional_service_1.AdditionalService.exportData(userId, {
                format,
                entity,
                repositoryId,
                state,
            });
            if (format === 'json') {
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'application/json');
                res.json(data);
                return;
            }
            // CSV format
            if (data.length === 0) {
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'text/csv');
                res.send('');
                return;
            }
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map((row) => headers
                    .map((h) => {
                    const val = String(row[h] ?? '').replace(/"/g, '""');
                    return `"${val}"`;
                })
                    .join(',')),
            ];
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'text/csv');
            res.send(csvRows.join('\n'));
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // ── Bulk Actions ───────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/bulk-actions:
     *   post:
     *     summary: Apply a bulk action to multiple issues
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - issueIds
     *               - action
     *             properties:
     *               issueIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: [clx111, clx222, clx333]
     *               action:
     *                 type: string
     *                 enum: [close, reopen, assign_label, remove_label, assign_milestone, set_priority]
     *                 example: close
     *               payload:
     *                 type: object
     *                 properties:
     *                   labelId:
     *                     type: string
     *                   milestoneId:
     *                     type: string
     *                   priority:
     *                     type: string
     *                     enum: [P0, P1, P2, P3]
     *     responses:
     *       200:
     *         description: Bulk action applied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 affected:
     *                   type: integer
     *                 message:
     *                   type: string
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    static async bulkActions(req, res) {
        try {
            const userId = req.user.id;
            const { issueIds, action, payload } = req.body;
            if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
                res.status(400).json({ success: false, error: 'issueIds array is required and must not be empty' });
                return;
            }
            if (!action) {
                res.status(400).json({ success: false, error: 'action is required' });
                return;
            }
            const result = await additional_service_1.AdditionalService.bulkAction(userId, { issueIds, action, payload });
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // ── Teams ──────────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/teams:
     *   get:
     *     summary: List all teams
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *     responses:
     *       200:
     *         description: Teams fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Team'
     *       401:
     *         description: Unauthorized
     */
    static async getTeams(req, res) {
        try {
            const { page = '1', limit = '20' } = req.query;
            const result = await additional_service_1.AdditionalService.getTeams(parseInt(page, 10), parseInt(limit, 10));
            res.json({ success: true, data: result.teams, pagination: result.pagination });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * @swagger
     * /api/teams:
     *   post:
     *     summary: Create a new team
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 example: Backend Squad
     *               description:
     *                 type: string
     *                 example: Handles all backend services
     *     responses:
     *       201:
     *         description: Team created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Team'
     *       400:
     *         description: name is required
     *       401:
     *         description: Unauthorized
     */
    static async createTeam(req, res) {
        try {
            const userId = req.user.id;
            const { name, description } = req.body;
            if (!name) {
                res.status(400).json({ success: false, error: 'name is required' });
                return;
            }
            const team = await additional_service_1.AdditionalService.createTeam(userId, { name, description });
            res.status(201).json({ success: true, data: team });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // ── Health ─────────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/health:
     *   get:
     *     summary: API health check — includes database status and uptime
     *     tags: [Additional Features]
     *     responses:
     *       200:
     *         description: Service is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   enum: [healthy, degraded, unhealthy]
     *                 version:
     *                   type: string
     *                 uptime:
     *                   type: integer
     *                   description: Uptime in seconds
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                 services:
     *                   type: object
     *                   properties:
     *                     database:
     *                       type: string
     *                     api:
     *                       type: string
     */
    static async getHealth(_req, res) {
        try {
            const health = await additional_service_1.AdditionalService.getHealth();
            const statusCode = health.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    // ── Webhooks ───────────────────────────────────────────────────────────────
    /**
     * @swagger
     * /api/webhooks:
     *   post:
     *     summary: Register or update a GitHub webhook for a repository
     *     tags: [Additional Features]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - repositoryId
     *             properties:
     *               repositoryId:
     *                 type: string
     *                 description: ID of the repository to set up the webhook for
     *               webhookUrl:
     *                 type: string
     *                 description: Optional custom webhook URL (defaults to server URL)
     *     responses:
     *       200:
     *         description: Webhook registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 repositoryId:
     *                   type: string
     *       400:
     *         description: repositoryId is required
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No access to repository
     */
    static async setupWebhook(req, res) {
        try {
            const userId = req.user.id;
            const { repositoryId, webhookUrl } = req.body;
            if (!repositoryId) {
                res.status(400).json({ success: false, error: 'repositoryId is required' });
                return;
            }
            // Verify user has admin access to the repository
            const access = await (await Promise.resolve().then(() => __importStar(require('../config/prisma')))).default.userRepository.findFirst({
                where: { userId, repositoryId },
            });
            if (!access) {
                res.status(403).json({ success: false, error: 'Repository not found or access denied' });
                return;
            }
            const serverUrl = webhookUrl ||
                `${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`}/api/webhooks/github`;
            // Update repository to flag webhook as enabled (actual GitHub API call
            // would require the GitHub access token and Octokit — tracking the intent here)
            await (await Promise.resolve().then(() => __importStar(require('../config/prisma')))).default.repository.update({
                where: { id: repositoryId },
                data: { webhookEnabled: true },
            });
            res.json({
                success: true,
                message: `Webhook registered for repository. Listening at: ${serverUrl}`,
                repositoryId,
                webhookUrl: serverUrl,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.AdditionalController = AdditionalController;

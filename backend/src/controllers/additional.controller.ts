import { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { AdditionalService } from '../services/additional.service';

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

export class AdditionalController {
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
  static async getMilestones(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        repositoryId,
        state,
        page = '1',
        limit = '20',
      } = req.query as Record<string, string>;

      const result = await AdditionalService.getMilestones(userId, {
        repositoryId,
        state: state as 'open' | 'closed' | undefined,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.json({
        success: true,
        data: result.milestones,
        pagination: result.pagination,
      });
    } catch (error: any) {
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
  static async createMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, description, state, dueOn, repositoryId } = req.body;

      if (!title || !repositoryId) {
        res.status(400).json({ success: false, error: 'title and repositoryId are required' });
        return;
      }

      const milestone = await AdditionalService.createMilestone(userId, {
        title,
        description,
        state,
        dueOn,
        repositoryId,
      });

      res.status(201).json({ success: true, data: milestone });
    } catch (error: any) {
      if (error.message.includes('access denied')) {
        res.status(403).json({ success: false, error: error.message });
      } else {
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
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const settings = await AdditionalService.getUserSettings(userId);

      if (!settings) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({ success: true, data: settings });
    } catch (error: any) {
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
  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, bio, location, company, website } = req.body;

      const updated = await AdditionalService.updateUserSettings(userId, {
        name,
        bio,
        location,
        company,
        website,
      });

      res.json({ success: true, data: updated, message: 'Settings updated successfully' });
    } catch (error: any) {
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
  static async getActivityLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = '1', limit = '20' } = req.query as Record<string, string>;

      const result = await AdditionalService.getActivityLog(
        userId,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      res.json({ success: true, data: result.activities, pagination: result.pagination });
    } catch (error: any) {
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
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { q, limit = '10', page = '1' } = req.query as Record<string, string>;

      if (!q) {
        res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
        return;
      }

      const result = await AdditionalService.globalSearch(userId, q, parseInt(page, 10), parseInt(limit, 10));
      res.json({ success: true, data: result });
    } catch (error: any) {
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
  static async exportData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
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

      const { data, filename } = await AdditionalService.exportData(userId, {
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
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = String(row[h] ?? '').replace(/"/g, '""');
              return `"${val}"`;
            })
            .join(',')
        ),
      ];

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(csvRows.join('\n'));
    } catch (error: any) {
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
  static async bulkActions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { issueIds, action, payload } = req.body;

      if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        res.status(400).json({ success: false, error: 'issueIds array is required and must not be empty' });
        return;
      }

      if (!action) {
        res.status(400).json({ success: false, error: 'action is required' });
        return;
      }

      const result = await AdditionalService.bulkAction(userId, { issueIds, action, payload });
      res.json(result);
    } catch (error: any) {
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
  static async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const result = await AdditionalService.getTeams(parseInt(page, 10), parseInt(limit, 10));

      res.json({ success: true, data: result.teams, pagination: result.pagination });
    } catch (error: any) {
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
  static async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: 'name is required' });
        return;
      }

      const team = await AdditionalService.createTeam(userId, { name, description });
      res.status(201).json({ success: true, data: team });
    } catch (error: any) {
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
  static async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const health = await AdditionalService.getHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error: any) {
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
  static async setupWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { repositoryId, webhookUrl } = req.body;

      if (!repositoryId) {
        res.status(400).json({ success: false, error: 'repositoryId is required' });
        return;
      }

      // Verify user has admin access to the repository
      const access = await (
        await import('../config/prisma')
      ).default.userRepository.findFirst({
        where: { userId, repositoryId },
      });

      if (!access) {
        res.status(403).json({ success: false, error: 'Repository not found or access denied' });
        return;
      }

      const serverUrl =
        webhookUrl ||
        `${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`}/api/webhooks/github`;

      // Update repository to flag webhook as enabled (actual GitHub API call
      // would require the GitHub access token and Octokit — tracking the intent here)
      await (
        await import('../config/prisma')
      ).default.repository.update({
        where: { id: repositoryId },
        data: { webhookEnabled: true },
      });

      res.json({
        success: true,
        message: `Webhook registered for repository. Listening at: ${serverUrl}`,
        repositoryId,
        webhookUrl: serverUrl,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── GitHub Webhook Receiver ────────────────────────────────────────────────

  /**
   * POST /api/webhooks/github
   * Receives and processes incoming GitHub webhook events.
   * Verifies the X-Hub-Signature-256 header using HMAC-SHA256.
   */
  static async handleGitHubWebhook(req: Request, res: Response): Promise<void> {
    const secret = process.env.WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Verify signature when a secret is configured
    if (secret !== 'your_webhook_secret') {
      if (!signature || !req.rawBody) {
        res.status(400).json({ error: 'Missing signature or body' });
        return;
      }
      const expected = `sha256=${createHmac('sha256', secret).update(req.rawBody).digest('hex')}`;
      try {
        if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      } catch {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const event = req.headers['x-github-event'] as string | undefined;
    const payload = req.body as any;

    try {
      const prisma = (await import('../config/prisma')).default;

      // Identify the repository from the payload
      const githubRepoId = payload?.repository?.id;
      if (!githubRepoId) {
        res.status(200).json({ received: true, skipped: 'no repository in payload' });
        return;
      }

      const repository = await prisma.repository.findFirst({
        where: { githubId: BigInt(githubRepoId) },
      });

      if (!repository) {
        res.status(200).json({ received: true, skipped: 'repository not tracked' });
        return;
      }

      const repositoryId = repository.id;

      switch (event) {
        // ── Issues ──────────────────────────────────────────────────────────
        case 'issues': {
          const { action, issue: ghIssue } = payload;

          if (action === 'opened') {
            const existing = await prisma.issue.findUnique({ where: { githubId: BigInt(ghIssue.id) } });
            if (!existing) {
              const creator = ghIssue.user
                ? await prisma.user.findUnique({ where: { githubId: ghIssue.user.id } })
                : null;
              await prisma.issue.create({
                data: {
                  githubId: BigInt(ghIssue.id),
                  repositoryId,
                  number: ghIssue.number,
                  title: ghIssue.title,
                  body: ghIssue.body ?? null,
                  state: ghIssue.state,
                  stateReason: ghIssue.state_reason ?? null,
                  creatorId: creator?.id ?? null,
                  githubCreatedAt: new Date(ghIssue.created_at),
                  githubUpdatedAt: new Date(ghIssue.updated_at),
                  closedAt: ghIssue.closed_at ? new Date(ghIssue.closed_at) : null,
                },
              });
            }
          } else if (action === 'closed' || action === 'reopened' || action === 'edited') {
            const existing = await prisma.issue.findUnique({ where: { githubId: BigInt(ghIssue.id) } });
            if (existing) {
              await prisma.issue.update({
                where: { id: existing.id },
                data: {
                  title: ghIssue.title,
                  body: ghIssue.body ?? null,
                  state: ghIssue.state,
                  stateReason: ghIssue.state_reason ?? null,
                  githubUpdatedAt: new Date(ghIssue.updated_at),
                  closedAt: ghIssue.closed_at ? new Date(ghIssue.closed_at) : null,
                },
              });
            }
          } else if (action === 'labeled' || action === 'unlabeled') {
            const existing = await prisma.issue.findUnique({ where: { githubId: BigInt(ghIssue.id) } });
            if (existing) {
              // Re-sync all labels for this issue from the current payload
              await prisma.issueLabel.deleteMany({ where: { issueId: existing.id } });
              for (const ghLabel of ghIssue.labels ?? []) {
                let label = await prisma.label.findFirst({ where: { repositoryId, name: ghLabel.name } });
                if (!label) {
                  label = await prisma.label.create({
                    data: {
                      githubId: BigInt(ghLabel.id),
                      name: ghLabel.name,
                      color: ghLabel.color,
                      description: ghLabel.description ?? null,
                      repositoryId,
                    },
                  });
                }
                await prisma.issueLabel.create({ data: { issueId: existing.id, labelId: label.id } });
              }
            }
          } else if (action === 'deleted') {
            await prisma.issue.deleteMany({ where: { githubId: BigInt(ghIssue.id) } });
          }
          break;
        }

        // ── Issue Comments ───────────────────────────────────────────────────
        case 'issue_comment': {
          const { action, comment: ghComment, issue: ghIssue } = payload;
          const issue = await prisma.issue.findUnique({ where: { githubId: BigInt(ghIssue.id) } });
          if (!issue) break;

          if (action === 'created') {
            const existing = await prisma.comment.findFirst({ where: { githubId: BigInt(ghComment.id) } });
            if (!existing) {
              const author = ghComment.user
                ? await prisma.user.findUnique({ where: { githubId: ghComment.user.id } })
                : null;
              await prisma.comment.create({
                data: {
                  githubId: BigInt(ghComment.id),
                  issueId: issue.id,
                  userId: author?.id ?? null,
                  body: ghComment.body,
                  githubCreatedAt: new Date(ghComment.created_at),
                  githubUpdatedAt: new Date(ghComment.updated_at),
                },
              });
            }
          } else if (action === 'edited') {
            await prisma.comment.updateMany({
              where: { githubId: BigInt(ghComment.id) },
              data: { body: ghComment.body, githubUpdatedAt: new Date(ghComment.updated_at) },
            });
          } else if (action === 'deleted') {
            await prisma.comment.deleteMany({ where: { githubId: BigInt(ghComment.id) } });
          }
          break;
        }

        // ── Labels ───────────────────────────────────────────────────────────
        case 'label': {
          const { action, label: ghLabel } = payload;
          if (action === 'created') {
            const existing = await prisma.label.findFirst({ where: { repositoryId, name: ghLabel.name } });
            if (!existing) {
              await prisma.label.create({
                data: {
                  githubId: BigInt(ghLabel.id),
                  name: ghLabel.name,
                  color: ghLabel.color,
                  description: ghLabel.description ?? null,
                  repositoryId,
                },
              });
            }
          } else if (action === 'edited') {
            await prisma.label.updateMany({
              where: { repositoryId, OR: [{ githubId: BigInt(ghLabel.id) }, { name: ghLabel.changes?.name?.from ?? ghLabel.name }] },
              data: { name: ghLabel.name, color: ghLabel.color, description: ghLabel.description ?? null },
            });
          } else if (action === 'deleted') {
            await prisma.label.deleteMany({ where: { repositoryId, githubId: BigInt(ghLabel.id) } });
          }
          break;
        }

        // ── Milestones ───────────────────────────────────────────────────────
        case 'milestone': {
          const { action, milestone: ghMilestone } = payload;
          if (action === 'created') {
            const existing = await prisma.milestone.findFirst({ where: { repositoryId, githubId: BigInt(ghMilestone.id) } });
            if (!existing) {
              await prisma.milestone.create({
                data: {
                  githubId: BigInt(ghMilestone.id),
                  repositoryId,
                  title: ghMilestone.title,
                  description: ghMilestone.description ?? null,
                  state: ghMilestone.state,
                  dueOn: ghMilestone.due_on ? new Date(ghMilestone.due_on) : null,
                },
              });
            }
          } else if (action === 'edited' || action === 'closed' || action === 'opened') {
            await prisma.milestone.updateMany({
              where: { repositoryId, githubId: BigInt(ghMilestone.id) },
              data: {
                title: ghMilestone.title,
                description: ghMilestone.description ?? null,
                state: ghMilestone.state,
                dueOn: ghMilestone.due_on ? new Date(ghMilestone.due_on) : null,
              },
            });
          } else if (action === 'deleted') {
            await prisma.milestone.deleteMany({ where: { repositoryId, githubId: BigInt(ghMilestone.id) } });
          }
          break;
        }

        default:
          // Unhandled event type — still return 200 so GitHub doesn't retry
          break;
      }

      res.status(200).json({ received: true, event });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      // Return 200 to prevent GitHub from retrying on internal errors
      res.status(200).json({ received: true, error: error.message });
    }
  }
}

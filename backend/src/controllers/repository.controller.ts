import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service';

/**
 * @swagger
 * tags:
 *   name: Repositories
 *   description: Repository management endpoints
 */

export class RepositoryController {
  /**
   * @swagger
   * /api/repositories:
   *   get:
   *     summary: List all user repositories
   *     description: Get all repositories added by the authenticated user
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: group
   *         schema:
   *           type: string
   *         description: Filter by custom group
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by name or description
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
   *           default: 20
   *         description: Items per page
   *     responses:
   *       200:
   *         description: List of repositories
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Repository'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   */
  static async getRepositories(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { group, search, page, limit } = req.query;

      const result = await RepositoryService.getUserRepositories(userId, {
        group: group as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch repositories',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories/{id}:
   *   get:
   *     summary: Get repository details
   *     description: Get detailed information about a specific repository
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Repository ID
   *     responses:
   *       200:
   *         description: Repository details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/RepositoryDetails'
   *       404:
   *         description: Repository not found
   *       401:
   *         description: Unauthorized
   */
  static async getRepositoryById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { id } = req.params;

      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid repository ID',
        });
        return;
      }

      const repository = await RepositoryService.getRepositoryById(id, userId);

      res.status(200).json({
        success: true,
        data: repository,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Repository not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch repository',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories:
   *   post:
   *     summary: Add new repository
   *     description: Add a GitHub repository to the dashboard
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - repoUrl
   *             properties:
   *               repoUrl:
   *                 type: string
   *                 example: https://github.com/johndoe/my-project
   *               group:
   *                 type: string
   *                 example: Frontend Projects
   *     responses:
   *       201:
   *         description: Repository added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Repository'
   *       400:
   *         description: Invalid repository URL or already added
   *       401:
   *         description: Unauthorized
   */
  static async addRepository(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { repoUrl, group } = req.body;

      if (!repoUrl) {
        res.status(400).json({
          success: false,
          error: 'Repository URL is required',
        });
        return;
      }

      // Get user's access token for GitHub API
      const dbUser = await require('../config/prisma').default.user.findUnique({
        where: { id: userId },
        select: { accessToken: true },
      });

      const repository = await RepositoryService.addRepository(
        userId,
        repoUrl,
        group,
        dbUser?.accessToken
      );

      res.status(201).json({
        success: true,
        message: 'Repository added successfully',
        data: repository,
      });
    } catch (error: any) {
      const statusCode =
        error.message === 'Invalid GitHub repository URL' ||
        error.message === 'Repository already added'
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to add repository',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories/{id}:
   *   patch:
   *     summary: Update repository settings
   *     description: Update repository configuration
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Repository ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               group:
   *                 type: string
   *                 example: Personal Projects
   *               webhookEnabled:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Repository updated successfully
   *       404:
   *         description: Repository not found
   *       401:
   *         description: Unauthorized
   */
  static async updateRepository(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { id } = req.params;
      const { group, webhookEnabled } = req.body;

      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid repository ID',
        });
        return;
      }

      const repository = await RepositoryService.updateRepository(id, userId, {
        group,
        webhookEnabled,
      });

      res.status(200).json({
        success: true,
        message: 'Repository updated successfully',
        data: repository,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Repository not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update repository',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories/{id}:
   *   delete:
   *     summary: Remove repository
   *     description: Remove repository from user's dashboard
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Repository ID
   *     responses:
   *       200:
   *         description: Repository removed successfully
   *       404:
   *         description: Repository not found
   *       401:
   *         description: Unauthorized
   */
  static async deleteRepository(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { id } = req.params;

      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid repository ID',
        });
        return;
      }

      await RepositoryService.removeRepository(id, userId);

      res.status(200).json({
        success: true,
        message: 'Repository removed successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Repository not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to remove repository',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories/{id}/sync:
   *   post:
   *     summary: Sync repository issues
   *     description: Fetch latest issues from GitHub
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Repository ID
   *     responses:
   *       200:
   *         description: Repository synced successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 stats:
   *                   type: object
   *                   properties:
   *                     issuesAdded:
   *                       type: integer
   *                     issuesUpdated:
   *                       type: integer
   *                     issuesClosed:
   *                       type: integer
   *                     totalIssues:
   *                       type: integer
   *       404:
   *         description: Repository not found
   *       401:
   *         description: Unauthorized
   */
  static async syncRepository(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { id } = req.params;

      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid repository ID',
        });
        return;
      }

      // Get repository details
      const repository = await RepositoryService.getRepositoryById(id, userId);
      
      // Parse owner and repo from fullName
      const [owner, repo] = repository.fullName.split('/');

      // Get user's access token
      const authUser = await require('../config/prisma').default.user.findUnique({
        where: { id: userId },
        select: { accessToken: true },
      });

      if (!authUser?.accessToken || authUser.accessToken === '' || authUser.accessToken === 'test_token') {
        res.status(400).json({
          success: false,
          error: 'GitHub access token not configured. Please complete OAuth authentication first.',
          hint: 'Visit /api/auth/github to authenticate with GitHub',
        });
        return;
      }

      const result = await RepositoryService.syncRepositoryIssues(
        id,
        owner,
        repo,
        authUser.accessToken
      );

      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.message === 'Repository not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to sync repository',
      });
    }
  }

  /**
   * @swagger
   * /api/repositories/{id}/webhook:
   *   post:
   *     summary: Setup GitHub webhook
   *     description: Configure webhook for real-time updates
   *     tags: [Repositories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Repository ID
   *     responses:
   *       200:
   *         description: Webhook configured successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 webhookId:
   *                   type: string
   *       404:
   *         description: Repository not found
   *       401:
   *         description: Unauthorized
   */
  static async setupWebhook(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string } | undefined;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = user.id;
      const { id } = req.params;

      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid repository ID',
        });
        return;
      }

      // Get repository details
      const repository = await RepositoryService.getRepositoryById(id, userId);
      
      // Parse owner and repo from fullName
      const [owner, repo] = repository.fullName.split('/');

      // Get user's access token
      const authUser = await require('../config/prisma').default.user.findUnique({
        where: { id: userId },
        select: { accessToken: true },
      });

      if (!authUser?.accessToken || authUser.accessToken === '' || authUser.accessToken === 'test_token') {
        res.status(400).json({
          success: false,
          error: 'GitHub access token not configured. Please complete OAuth authentication first.',
          hint: 'Visit /api/auth/github to authenticate with GitHub',
          note: 'Webhooks require a valid GitHub access token with repo permissions',
        });
        return;
      }

      const result = await RepositoryService.setupWebhook(
        id,
        owner,
        repo,
        authUser.accessToken
      );

      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.message === 'Repository not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to setup webhook',
      });
    }
  }
}

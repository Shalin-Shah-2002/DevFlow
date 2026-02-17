import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/issue.service';
import {
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueFilters,
  BulkIssueOperation,
  CreateCommentRequest,
  UpdateCommentRequest,
  AssignUsersRequest,
  ManageLabelsRequest,
} from '../models/issue.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         repositoryId:
 *           type: string
 *           example: clx987xyz654
 *         githubIssueId:
 *           type: integer
 *           example: 1234567890
 *         githubNumber:
 *           type: integer
 *           example: 42
 *         title:
 *           type: string
 *           example: Fix login bug
 *         body:
 *           type: string
 *           example: Users cannot login with OAuth
 *         state:
 *           type: string
 *           enum: [open, closed]
 *           example: open
 *         stateReason:
 *           type: string
 *           enum: [completed, not_planned, reopened]
 *           example: completed
 *         priority:
 *           type: string
 *           enum: [P0, P1, P2, P3]
 *           example: P1
 *         customStatus:
 *           type: string
 *           example: In Progress
 *         htmlUrl:
 *           type: string
 *           example: https://github.com/owner/repo/issues/42
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         closedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         issueId:
 *           type: string
 *         userId:
 *           type: string
 *         body:
 *           type: string
 *         githubCommentId:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class IssueController {
  /**
   * @swagger
   * /api/issues:
   *   get:
   *     summary: List all issues with advanced filters
   *     description: Get paginated list of issues with filtering, search, and sorting
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *           enum: [open, closed, all]
   *         description: Filter by issue state
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *         description: Filter by priority (comma-separated for multiple)
   *       - in: query
   *         name: label
   *         schema:
   *           type: string
   *         description: Filter by labels (comma-separated)
   *       - in: query
   *         name: repository
   *         schema:
   *           type: string
   *         description: Filter by repository ID
   *       - in: query
   *         name: assignee
   *         schema:
   *           type: string
   *         description: Filter by assignee user ID
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in title and body
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category ID
   *       - in: query
   *         name: milestone
   *         schema:
   *           type: string
   *         description: Filter by milestone ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Items per page
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [created, updated, priority, comments]
   *         description: Sort field
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *     responses:
   *       200:
   *         description: List of issues with pagination
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
   *                     $ref: '#/components/schemas/Issue'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const filters: IssueFilters = {
        state: req.query.state as any,
        priority: req.query.priority as any,
        label: req.query.label as any,
        repositoryId: req.query.repository as string,
        assignee: req.query.assignee as string,
        search: req.query.search as string,
        categoryId: req.query.category as string,
        milestoneId: req.query.milestone as string,
        createdAfter: req.query.createdAfter as string,
        createdBefore: req.query.createdBefore as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sort: req.query.sort as any,
        order: req.query.order as any,
      };

      // Handle array parameters
      if (filters.priority && typeof filters.priority === 'string') {
        filters.priority = (filters.priority as string).split(',');
      }
      if (filters.label && typeof filters.label === 'string') {
        filters.label = (filters.label as string).split(',');
      }

      const result = await IssueService.getIssues(userId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}:
   *   get:
   *     summary: Get single issue by ID
   *     description: Get detailed information about a specific issue
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     responses:
   *       200:
   *         description: Issue details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Issue'
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async getIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const issue = await IssueService.getIssueById(id, userId);

      res.json({
        success: true,
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues:
   *   post:
   *     summary: Create a new issue
   *     description: Create a new issue in a repository (syncs with GitHub)
   *     tags: [Issues]
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
   *               - title
   *             properties:
   *               repositoryId:
   *                 type: string
   *                 example: clx987xyz654
   *               title:
   *                 type: string
   *                 example: Fix authentication bug
   *               body:
   *                 type: string
   *                 example: Users cannot login properly
   *               labels:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: [bug, urgent]
   *               assignees:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: [johndoe]
   *               milestone:
   *                 type: string
   *                 example: v1.0.0
   *               priority:
   *                 type: string
   *                 enum: [P0, P1, P2, P3]
   *                 example: P1
   *               customStatus:
   *                 type: string
   *                 example: Backlog
   *               estimatedTime:
   *                 type: integer
   *                 example: 120
   *     responses:
   *       201:
   *         description: Issue created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Issue created successfully
   *                 data:
   *                   $ref: '#/components/schemas/Issue'
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   */
  static async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const data: CreateIssueRequest = req.body;

      const issue = await IssueService.createIssue(userId, data, accessToken);

      res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}:
   *   patch:
   *     summary: Update an existing issue
   *     description: Update issue details (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               body:
   *                 type: string
   *               state:
   *                 type: string
   *                 enum: [open, closed]
   *               stateReason:
   *                 type: string
   *                 enum: [completed, not_planned, reopened]
   *               priority:
   *                 type: string
   *                 enum: [P0, P1, P2, P3]
   *               customStatus:
   *                 type: string
   *               estimatedTime:
   *                 type: integer
   *               labels:
   *                 type: array
   *                 items:
   *                   type: string
   *               assignees:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Issue updated successfully
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
   *                   $ref: '#/components/schemas/Issue'
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async updateIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const data: UpdateIssueRequest = req.body;

      const issue = await IssueService.updateIssue(id, userId, data, accessToken);

      res.json({
        success: true,
        message: 'Issue updated successfully',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}:
   *   delete:
   *     summary: Close an issue
   *     description: Close an issue with a reason (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *       - in: query
   *         name: reason
   *         schema:
   *           type: string
   *           enum: [completed, not_planned]
   *           default: completed
   *         description: Reason for closing
   *     responses:
   *       200:
   *         description: Issue closed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Issue closed successfully
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async closeIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const reason = (req.query.reason as 'completed' | 'not_planned') || 'completed';

      await IssueService.closeIssue(id, userId, reason, accessToken);

      res.json({
        success: true,
        message: 'Issue closed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/bulk:
   *   post:
   *     summary: Perform bulk operations on multiple issues
   *     description: Close, update labels, or assign users to multiple issues at once
   *     tags: [Issues]
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
   *               - operation
   *             properties:
   *               issueIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: [clx123, clx456]
   *               operation:
   *                 type: string
   *                 enum: [close, addLabel, removeLabel, assign, unassign]
   *                 example: close
   *               labels:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Labels to add/remove (for label operations)
   *               assignees:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Users to assign/unassign
   *               stateReason:
   *                 type: string
   *                 enum: [completed, not_planned]
   *                 description: Reason for closing (for close operation)
   *     responses:
   *       200:
   *         description: Bulk operation completed
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   */
  static async bulkOperation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const operation: BulkIssueOperation = req.body;

      const result = await IssueService.bulkOperation(userId, operation, accessToken);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/comments:
   *   get:
   *     summary: Get all comments for an issue
   *     description: Retrieve paginated comments for a specific issue
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *     responses:
   *       200:
   *         description: List of comments
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
   *                     $ref: '#/components/schemas/Comment'
   *                 pagination:
   *                   type: object
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const result = await IssueService.getIssueComments(id, userId, page, limit);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/comments:
   *   post:
   *     summary: Add a comment to an issue
   *     description: Create a new comment on an issue (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - body
   *             properties:
   *               body:
   *                 type: string
   *                 example: This issue has been fixed in the latest commit
   *     responses:
   *       201:
   *         description: Comment added successfully
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
   *                   $ref: '#/components/schemas/Comment'
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const data: CreateCommentRequest = req.body;

      const comment = await IssueService.addComment(id, userId, data, accessToken);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/comments/{commentId}:
   *   patch:
   *     summary: Update a comment
   *     description: Edit an existing comment (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: string
   *         description: Comment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - body
   *             properties:
   *               body:
   *                 type: string
   *                 example: Updated comment text
   *     responses:
   *       200:
   *         description: Comment updated successfully
   *       404:
   *         description: Comment not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not authorized to edit this comment
   */
  static async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const commentId = req.params.commentId as string;
      const data: UpdateCommentRequest = req.body;

      const comment = await IssueService.updateComment(
        id,
        commentId,
        userId,
        data,
        accessToken
      );

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/comments/{commentId}:
   *   delete:
   *     summary: Delete a comment
   *     description: Remove a comment from an issue (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: string
   *         description: Comment ID
   *     responses:
   *       200:
   *         description: Comment deleted successfully
   *       404:
   *         description: Comment not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not authorized to delete this comment
   */
  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const commentId = req.params.commentId as string;

      const result = await IssueService.deleteComment(id, commentId, userId, accessToken);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/assign:
   *   post:
   *     summary: Assign or unassign users
   *     description: Add or remove user assignments from an issue (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               add:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: GitHub usernames to assign
   *                 example: [johndoe, janedoe]
   *               remove:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: GitHub usernames to unassign
   *                 example: [olduser]
   *     responses:
   *       200:
   *         description: Assignments updated successfully
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async assignUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const data: AssignUsersRequest = req.body;

      const result = await IssueService.assignUsers(id, userId, data, accessToken);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/labels:
   *   post:
   *     summary: Manage issue labels
   *     description: Add or remove labels from an issue (syncs with GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               add:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Labels to add
   *                 example: [bug, urgent]
   *               remove:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Labels to remove
   *                 example: [wontfix]
   *     responses:
   *       200:
   *         description: Labels updated successfully
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async manageLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accessToken = req.user!.accessToken;
      const id = req.params.id as string;
      const data: ManageLabelsRequest = req.body;

      const result = await IssueService.manageLabels(id, userId, data, accessToken);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/issues/{id}/categories:
   *   post:
   *     summary: Add categories to issue
   *     description: Add custom categories to an issue (local only, not synced to GitHub)
   *     tags: [Issues]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Issue ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoryIds
   *             properties:
   *               categoryIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: [clx123, clx456]
   *                 description: Array of category IDs to add
   *     responses:
   *       200:
   *         description: Categories added successfully
   *       404:
   *         description: Issue not found
   *       401:
   *         description: Unauthorized
   */
  static async addCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { categoryIds } = req.body;

      const result = await IssueService.addCategories(id, userId, categoryIds);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

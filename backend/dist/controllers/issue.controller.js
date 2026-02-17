"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueController = void 0;
const issue_service_1 = require("../services/issue.service");
/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: ckl1234567890
 *         githubId:
 *           type: integer
 *           example: 12345
 *         repositoryId:
 *           type: string
 *           example: repo123
 *         title:
 *           type: string
 *           example: Fix login bug
 *         body:
 *           type: string
 *           example: Users cannot login with email containing +
 *         state:
 *           type: string
 *           enum: [open, closed]
 *           example: open
 *         priority:
 *           type: string
 *           enum: [P0, P1, P2, P3]
 *           example: P1
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           example: [bug, urgent]
 *         assignees:
 *           type: array
 *           items:
 *             type: string
 *           example: [user123]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     IssueList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             issues:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 */
class IssueController {
    /**
     * @swagger
     * /api/issues:
     *   get:
     *     summary: Get all issues with filters
     *     description: Retrieve paginated list of issues with advanced filtering options
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
     *         description: Filter by label (comma-separated for multiple)
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
     *           default: desc
     *         description: Sort order
     *     responses:
     *       200:
     *         description: Issues retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IssueList'
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *       500:
     *         description: Server error
     */
    static async getIssues(req, res, next) {
        try {
            const userId = req.user.id;
            const filters = {
                state: req.query.state,
                priority: req.query.priority,
                label: req.query.label,
                repositoryId: req.query.repository,
                assignee: req.query.assignee,
                search: req.query.search,
                categoryId: req.query.category,
                milestoneId: req.query.milestone,
                createdAfter: req.query.createdAfter,
                createdBefore: req.query.createdBefore,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 20,
                sort: req.query.sort,
                order: req.query.order,
            };
            // Handle array parameters
            if (filters.priority && typeof filters.priority === 'string') {
                filters.priority = filters.priority.split(',');
            }
            if (filters.label && typeof filters.label === 'string') {
                filters.label = filters.label.split(',');
            }
            const result = await issue_service_1.IssueService.getIssues(userId, filters);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/{id}:
     *   get:
     *     summary: Get single issue by ID
     *     description: Retrieve detailed information about a specific issue
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
     *         description: Issue retrieved successfully
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
    static async getIssueById(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const issue = await issue_service_1.IssueService.getIssueById(id, userId);
            res.json({
                success: true,
                data: issue,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues:
     *   post:
     *     summary: Create new issue
     *     description: Create a new issue in a repository
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
     *                 description: Repository ID
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 256
     *                 description: Issue title
     *               body:
     *                 type: string
     *                 description: Issue description
     *               labels:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of label names
     *               assignees:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of user IDs to assign
     *               priority:
     *                 type: string
     *                 enum: [P0, P1, P2, P3]
     *                 description: Issue priority level
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
     *         description: Bad request - validation error
     *       401:
     *         description: Unauthorized
     */
    static async createIssue(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const data = req.body;
            const issue = await issue_service_1.IssueService.createIssue(userId, data, accessToken);
            res.status(201).json({
                success: true,
                message: 'Issue created successfully',
                data: issue,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/{id}:
     *   patch:
     *     summary: Update issue
     *     description: Update an existing issue's properties
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
     *                 minLength: 1
     *                 maxLength: 256
     *               body:
     *                 type: string
     *               state:
     *                 type: string
     *                 enum: [open, closed]
     *               priority:
     *                 type: string
     *                 enum: [P0, P1, P2, P3]
     *               labels:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Issue updated successfully
     *       404:
     *         description: Issue not found
     *       401:
     *         description: Unauthorized
     */
    static async updateIssue(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const data = req.body;
            const issue = await issue_service_1.IssueService.updateIssue(id, userId, data, accessToken);
            res.json({
                success: true,
                message: 'Issue updated successfully',
                data: issue,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/{id}:
     *   delete:
     *     summary: Close issue
     *     description: Close an issue with a reason
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
     *         description: Reason for closing the issue
     *     responses:
     *       200:
     *         description: Issue closed successfully
     *       404:
     *         description: Issue not found
     *       401:
     *         description: Unauthorized
     */
    static async closeIssue(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const reason = req.query.reason || 'completed';
            await issue_service_1.IssueService.closeIssue(id, userId, reason, accessToken);
            res.json({
                success: true,
                message: 'Issue closed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/bulk:
     *   post:
     *     summary: Bulk operations on issues
     *     description: Perform operations on multiple issues at once
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
     *               - action
     *               - issueIds
     *             properties:
     *               action:
     *                 type: string
     *                 enum: [close, reopen, assign, label, priority]
     *                 description: Action to perform
     *               issueIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of issue IDs
     *               data:
     *                 type: object
     *                 description: Additional data for the action
     *     responses:
     *       200:
     *         description: Bulk operation completed
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    static async bulkOperation(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const operation = req.body;
            const result = await issue_service_1.IssueService.bulkOperation(userId, operation, accessToken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/issues/:id/comments
     * Get issue comments
     */
    static async getComments(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 50;
            const result = await issue_service_1.IssueService.getIssueComments(id, userId, page, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/issues/:id/comments
     * Add comment to issue
     */
    static async addComment(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const data = req.body;
            const comment = await issue_service_1.IssueService.addComment(id, userId, data, accessToken);
            res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/issues/:id/comments/:commentId
     * Edit comment
     */
    static async updateComment(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const commentId = req.params.commentId;
            const data = req.body;
            const comment = await issue_service_1.IssueService.updateComment(id, commentId, userId, data, accessToken);
            res.json({
                success: true,
                message: 'Comment updated successfully',
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/issues/:id/comments/:commentId
     * Delete comment
     */
    static async deleteComment(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const commentId = req.params.commentId;
            const result = await issue_service_1.IssueService.deleteComment(id, commentId, userId, accessToken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/{id}/assign:
     *   post:
     *     summary: Assign users to issue
     *     description: Assign or unassign users to/from an issue
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
     *               - assignees
     *             properties:
     *               assignees:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of user IDs to assign
     *               action:
     *                 type: string
     *                 enum: [add, remove, set]
     *                 default: set
     *                 description: Assignment action
     *     responses:
     *       200:
     *         description: Users assigned successfully
     *       404:
     *         description: Issue not found
     *       401:
     *         description: Unauthorized
     */
    static async assignUsers(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const data = req.body;
            const result = await issue_service_1.IssueService.assignUsers(id, userId, data, accessToken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/issues/{id}/labels:
     *   post:
     *     summary: Manage issue labels
     *     description: Add or remove labels from an issue
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
     *               - labels
     *             properties:
     *               labels:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of label names
     *               action:
     *                 type: string
     *                 enum: [add, remove, set]
     *                 default: set
     *                 description: Label management action
     *     responses:
     *       200:
     *         description: Labels updated successfully
     *       404:
     *         description: Issue not found
     *       401:
     *         description: Unauthorized
     */
    static async manageLabels(req, res, next) {
        try {
            const userId = req.user.id;
            const accessToken = req.user.accessToken;
            const id = req.params.id;
            const data = req.body;
            const result = await issue_service_1.IssueService.manageLabels(id, userId, data, accessToken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/issues/:id/categories
     * Add categories to issue (local only)
     */
    static async addCategories(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const { categoryIds } = req.body;
            const result = await issue_service_1.IssueService.addCategories(id, userId, categoryIds);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.IssueController = IssueController;

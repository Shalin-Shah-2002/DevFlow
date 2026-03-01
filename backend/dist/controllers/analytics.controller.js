"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard analytics and reporting endpoints
 */
class AnalyticsController {
    // ─── 8.1 GET /api/analytics/dashboard ────────────────────────────────────
    /**
     * @swagger
     * /api/analytics/dashboard:
     *   get:
     *     summary: Get dashboard overview
     *     description: Returns high-level statistics — total repos, issues, priority breakdown and close rate for the authenticated user.
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard overview statistics
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     totalRepositories:
     *                       type: integer
     *                       example: 5
     *                     totalIssues:
     *                       type: integer
     *                       example: 120
     *                     openIssues:
     *                       type: integer
     *                       example: 45
     *                     closedIssues:
     *                       type: integer
     *                       example: 75
     *                     closedRate:
     *                       type: integer
     *                       example: 62
     *                     totalComments:
     *                       type: integer
     *                       example: 340
     *                     issuesByPriority:
     *                       type: object
     *                       example: { P0: 3, P1: 10, P2: 25, P3: 7, unset: 75 }
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getDashboard(userId);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics dashboard error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch dashboard analytics" });
        }
    }
    // ─── 8.2 GET /api/analytics/issues-by-status ─────────────────────────────
    /**
     * @swagger
     * /api/analytics/issues-by-status:
     *   get:
     *     summary: Get issues grouped by status
     *     description: Returns issue counts grouped by GitHub state (open/closed) and custom workflow status.
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Issues by status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     byState:
     *                       type: object
     *                       example: { open: 45, closed: 75 }
     *                     byCustomStatus:
     *                       type: object
     *                       example: { in_progress: 10, review: 5, none: 105 }
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getIssuesByStatus(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getIssuesByStatus(userId);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics issues-by-status error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch issues by status" });
        }
    }
    // ─── 8.3 GET /api/analytics/issues-by-repo ───────────────────────────────
    /**
     * @swagger
     * /api/analytics/issues-by-repo:
     *   get:
     *     summary: Get issues grouped by repository
     *     description: Returns open, closed and total issue counts per repository, sorted by total descending.
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Issues per repository
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
     *                     type: object
     *                     properties:
     *                       name:
     *                         type: string
     *                         example: devflow
     *                       fullName:
     *                         type: string
     *                         example: shalin/devflow
     *                       open:
     *                         type: integer
     *                         example: 12
     *                       closed:
     *                         type: integer
     *                         example: 30
     *                       total:
     *                         type: integer
     *                         example: 42
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getIssuesByRepo(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getIssuesByRepo(userId);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics issues-by-repo error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch issues by repository" });
        }
    }
    // ─── 8.4 GET /api/analytics/issues-over-time ─────────────────────────────
    /**
     * @swagger
     * /api/analytics/issues-over-time:
     *   get:
     *     summary: Get issues created and closed over time
     *     description: Returns a daily timeline of created vs closed issues for the selected period.
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [7d, 30d, 90d, 1y]
     *           default: 30d
     *         description: Time period to query
     *     responses:
     *       200:
     *         description: Timeline data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     period:
     *                       type: string
     *                       example: 30d
     *                     timeline:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           date:
     *                             type: string
     *                             example: "2026-02-01"
     *                           created:
     *                             type: integer
     *                             example: 3
     *                           closed:
     *                             type: integer
     *                             example: 5
     *       400:
     *         description: Invalid period value
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getIssuesOverTime(req, res) {
        try {
            const userId = req.user.id;
            const period = req.query.period ?? "30d";
            const validPeriods = ["7d", "30d", "90d", "1y"];
            if (!validPeriods.includes(period)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid period. Must be one of: ${validPeriods.join(", ")}`,
                });
                return;
            }
            const data = await analyticsService.getIssuesOverTime(userId, period);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics issues-over-time error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch issues over time" });
        }
    }
    // ─── 8.5 GET /api/analytics/assignee-workload ────────────────────────────
    /**
     * @swagger
     * /api/analytics/assignee-workload:
     *   get:
     *     summary: Get assignee workload distribution
     *     description: Returns open and closed issue counts per assignee, sorted by open issues descending.
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Assignee workload
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
     *                     type: object
     *                     properties:
     *                       userId:
     *                         type: string
     *                         example: clx123abc
     *                       name:
     *                         type: string
     *                         example: Shalin Shah
     *                       githubLogin:
     *                         type: string
     *                         example: shalin
     *                       avatar:
     *                         type: string
     *                         example: https://avatars.githubusercontent.com/u/1234
     *                       open:
     *                         type: integer
     *                         example: 8
     *                       closed:
     *                         type: integer
     *                         example: 15
     *                       total:
     *                         type: integer
     *                         example: 23
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getAssigneeWorkload(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getAssigneeWorkload(userId);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics assignee-workload error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch assignee workload" });
        }
    }
    // ─── 8.6 GET /api/analytics/completion-rate ──────────────────────────────
    /**
     * @swagger
     * /api/analytics/completion-rate:
     *   get:
     *     summary: Get completion rate metrics
     *     description: Returns overall and per-repository completion rates (closed / total issues × 100).
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Completion rate data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     overall:
     *                       type: object
     *                       properties:
     *                         totalIssues:
     *                           type: integer
     *                           example: 120
     *                         closedIssues:
     *                           type: integer
     *                           example: 75
     *                         openIssues:
     *                           type: integer
     *                           example: 45
     *                         completionRate:
     *                           type: integer
     *                           example: 62
     *                     byRepository:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           name:
     *                             type: string
     *                             example: devflow
     *                           fullName:
     *                             type: string
     *                             example: shalin/devflow
     *                           totalIssues:
     *                             type: integer
     *                             example: 50
     *                           closedIssues:
     *                             type: integer
     *                             example: 40
     *                           openIssues:
     *                             type: integer
     *                             example: 10
     *                           completionRate:
     *                             type: integer
     *                             example: 80
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    async getCompletionRate(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getCompletionRate(userId);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error("Analytics completion-rate error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch completion rate" });
        }
    }
}
exports.AnalyticsController = AnalyticsController;

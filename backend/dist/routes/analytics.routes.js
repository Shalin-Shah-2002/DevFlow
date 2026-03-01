"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const analyticsController = new analytics_controller_1.AnalyticsController();
// All analytics routes require authentication
router.use(auth_middleware_1.authMiddleware);
// 8.1 GET /api/analytics/dashboard          - Dashboard overview
// 8.2 GET /api/analytics/issues-by-status   - Issues grouped by state/custom status
// 8.3 GET /api/analytics/issues-by-repo     - Issues grouped by repository
// 8.4 GET /api/analytics/issues-over-time   - Timeline (created vs closed)
// 8.5 GET /api/analytics/assignee-workload  - Workload per assignee
// 8.6 GET /api/analytics/completion-rate    - Completion rate overall + per repo
router.get("/dashboard", analyticsController.getDashboard.bind(analyticsController));
router.get("/issues-by-status", analyticsController.getIssuesByStatus.bind(analyticsController));
router.get("/issues-by-repo", analyticsController.getIssuesByRepo.bind(analyticsController));
router.get("/issues-over-time", analyticsController.getIssuesOverTime.bind(analyticsController));
router.get("/assignee-workload", analyticsController.getAssigneeWorkload.bind(analyticsController));
router.get("/completion-rate", analyticsController.getCompletionRate.bind(analyticsController));
exports.default = router;

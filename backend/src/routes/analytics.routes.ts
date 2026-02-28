import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authMiddleware);

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

export default router;

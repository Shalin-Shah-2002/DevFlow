import { Router } from 'express';
import { AdditionalController } from '../controllers/additional.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────
// Health endpoint does NOT require authentication

/**
 * @route   GET /api/health
 * @desc    API health check (database connectivity + uptime)
 * @access  Public
 */
router.get('/health', AdditionalController.getHealth);

// ── Public webhook receiver (called by GitHub, no auth token) ───────────

/**
 * @route   POST /api/webhooks/github
 * @desc    Receive and process GitHub webhook events
 * @access  Public (verified by X-Hub-Signature-256)
 */
router.post('/webhooks/github', AdditionalController.handleGitHubWebhook);

// ── All remaining routes require authentication ──────────────────────────
router.use(authMiddleware);

// ── Milestones ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/milestones
 * @desc    List milestones (optionally filtered by repository/state)
 * @access  Private
 */
router.get(
  '/milestones',
  [
    query('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validate,
  ],
  AdditionalController.getMilestones
);

/**
 * @route   POST /api/milestones
 * @desc    Create a new milestone in a repository
 * @access  Private
 */
router.post(
  '/milestones',
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('repositoryId').trim().notEmpty().withMessage('repositoryId is required'),
    body('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    body('dueOn').optional().isISO8601().withMessage('dueOn must be a valid ISO date'),
    validate,
  ],
  AdditionalController.createMilestone
);

// ── Settings ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/settings
 * @desc    Get authenticated user's settings / profile
 * @access  Private
 */
router.get('/settings', AdditionalController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update authenticated user's settings / profile
 * @access  Private
 */
router.put(
  '/settings',
  [
    body('name').optional().trim().isLength({ max: 255 }).withMessage('name must be at most 255 chars'),
    body('bio').optional().trim().isLength({ max: 2000 }).withMessage('bio must be at most 2000 chars'),
    body('location').optional().trim().isLength({ max: 255 }),
    body('company').optional().trim().isLength({ max: 255 }),
    body('website').optional().trim().isURL().withMessage('website must be a valid URL'),
    validate,
  ],
  AdditionalController.updateSettings
);

// ── Activity Log ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/activity-log
 * @desc    Get the authenticated user's recent activity
 * @access  Private
 */
router.get(
  '/activity-log',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validate,
  ],
  AdditionalController.getActivityLog
);

// ── Global Search ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/search
 * @desc    Global search across issues and repositories
 * @access  Private
 */
router.get(
  '/search',
  [
    query('q').trim().notEmpty().withMessage('Query parameter "q" is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    validate,
  ],
  AdditionalController.search
);

// ── Export ────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/export
 * @desc    Export data as CSV or JSON
 * @access  Private
 */
router.post(
  '/export',
  [
    body('format').isIn(['csv', 'json']).withMessage('format must be csv or json'),
    body('entity')
      .isIn(['issues', 'repositories', 'milestones'])
      .withMessage('entity must be issues, repositories, or milestones'),
    body('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    validate,
  ],
  AdditionalController.exportData
);

// ── Bulk Actions ──────────────────────────────────────────────────────────

/**
 * @route   POST /api/bulk-actions
 * @desc    Apply an action to multiple issues at once
 * @access  Private
 */
router.post(
  '/bulk-actions',
  [
    body('issueIds')
      .isArray({ min: 1 })
      .withMessage('issueIds must be a non-empty array'),
    body('action')
      .isIn(['close', 'reopen', 'assign_label', 'remove_label', 'assign_milestone', 'set_priority'])
      .withMessage('Invalid action'),
    validate,
  ],
  AdditionalController.bulkActions
);

// ── Teams ─────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/teams
 * @desc    List all teams
 * @access  Private
 */
router.get(
  '/teams',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  AdditionalController.getTeams
);

/**
 * @route   POST /api/teams
 * @desc    Create a new team (creator is added as owner)
 * @access  Private
 */
router.post(
  '/teams',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('description').optional().trim().isLength({ max: 500 }),
    validate,
  ],
  AdditionalController.createTeam
);

// ── Webhooks ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/webhooks
 * @desc    Register a GitHub webhook for a repository
 * @access  Private
 */
router.post(
  '/webhooks',
  [
    body('repositoryId').trim().notEmpty().withMessage('repositoryId is required'),
    body('webhookUrl').optional().isURL().withMessage('webhookUrl must be a valid URL'),
    validate,
  ],
  AdditionalController.setupWebhook
);

export default router;

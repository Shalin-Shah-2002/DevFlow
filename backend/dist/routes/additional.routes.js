"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const additional_controller_1 = require("../controllers/additional.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// ── Public routes ─────────────────────────────────────────────────────────
// Health endpoint does NOT require authentication
/**
 * @route   GET /api/health
 * @desc    API health check (database connectivity + uptime)
 * @access  Public
 */
router.get('/health', additional_controller_1.AdditionalController.getHealth);
// ── All remaining routes require authentication ──────────────────────────
router.use(auth_middleware_1.authMiddleware);
// ── Milestones ────────────────────────────────────────────────────────────
/**
 * @route   GET /api/milestones
 * @desc    List milestones (optionally filtered by repository/state)
 * @access  Private
 */
router.get('/milestones', [
    (0, express_validator_1.query)('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.getMilestones);
/**
 * @route   POST /api/milestones
 * @desc    Create a new milestone in a repository
 * @access  Private
 */
router.post('/milestones', [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('title is required'),
    (0, express_validator_1.body)('repositoryId').trim().notEmpty().withMessage('repositoryId is required'),
    (0, express_validator_1.body)('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    (0, express_validator_1.body)('dueOn').optional().isISO8601().withMessage('dueOn must be a valid ISO date'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.createMilestone);
// ── Settings ──────────────────────────────────────────────────────────────
/**
 * @route   GET /api/settings
 * @desc    Get authenticated user's settings / profile
 * @access  Private
 */
router.get('/settings', additional_controller_1.AdditionalController.getSettings);
/**
 * @route   PUT /api/settings
 * @desc    Update authenticated user's settings / profile
 * @access  Private
 */
router.put('/settings', [
    (0, express_validator_1.body)('name').optional().trim().isLength({ max: 255 }).withMessage('name must be at most 255 chars'),
    (0, express_validator_1.body)('bio').optional().trim().isLength({ max: 2000 }).withMessage('bio must be at most 2000 chars'),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('company').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('website').optional().trim().isURL().withMessage('website must be a valid URL'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.updateSettings);
// ── Activity Log ──────────────────────────────────────────────────────────
/**
 * @route   GET /api/activity-log
 * @desc    Get the authenticated user's recent activity
 * @access  Private
 */
router.get('/activity-log', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.getActivityLog);
// ── Global Search ─────────────────────────────────────────────────────────
/**
 * @route   GET /api/search
 * @desc    Global search across issues and repositories
 * @access  Private
 */
router.get('/search', [
    (0, express_validator_1.query)('q').trim().notEmpty().withMessage('Query parameter "q" is required'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.search);
// ── Export ────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/export
 * @desc    Export data as CSV or JSON
 * @access  Private
 */
router.post('/export', [
    (0, express_validator_1.body)('format').isIn(['csv', 'json']).withMessage('format must be csv or json'),
    (0, express_validator_1.body)('entity')
        .isIn(['issues', 'repositories', 'milestones'])
        .withMessage('entity must be issues, repositories, or milestones'),
    (0, express_validator_1.body)('state').optional().isIn(['open', 'closed']).withMessage('state must be open or closed'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.exportData);
// ── Bulk Actions ──────────────────────────────────────────────────────────
/**
 * @route   POST /api/bulk-actions
 * @desc    Apply an action to multiple issues at once
 * @access  Private
 */
router.post('/bulk-actions', [
    (0, express_validator_1.body)('issueIds')
        .isArray({ min: 1 })
        .withMessage('issueIds must be a non-empty array'),
    (0, express_validator_1.body)('action')
        .isIn(['close', 'reopen', 'assign_label', 'remove_label', 'assign_milestone', 'set_priority'])
        .withMessage('Invalid action'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.bulkActions);
// ── Teams ─────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/teams
 * @desc    List all teams
 * @access  Private
 */
router.get('/teams', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.getTeams);
/**
 * @route   POST /api/teams
 * @desc    Create a new team (creator is added as owner)
 * @access  Private
 */
router.post('/teams', [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('name is required'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.createTeam);
// ── Webhooks ──────────────────────────────────────────────────────────────
/**
 * @route   POST /api/webhooks
 * @desc    Register a GitHub webhook for a repository
 * @access  Private
 */
router.post('/webhooks', [
    (0, express_validator_1.body)('repositoryId').trim().notEmpty().withMessage('repositoryId is required'),
    (0, express_validator_1.body)('webhookUrl').optional().isURL().withMessage('webhookUrl must be a valid URL'),
    validation_middleware_1.validate,
], additional_controller_1.AdditionalController.setupWebhook);
exports.default = router;

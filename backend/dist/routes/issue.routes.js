"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issue_controller_1 = require("../controllers/issue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
/**
 * @route   GET /api/issues
 * @desc    Get all issues with filters
 * @access  Private
 */
router.get('/', [
    (0, express_validator_1.query)('state').optional().isIn(['open', 'closed', 'all']),
    (0, express_validator_1.query)('priority').optional().isString(),
    (0, express_validator_1.query)('label').optional().isString(),
    (0, express_validator_1.query)('repository').optional().isString(),
    (0, express_validator_1.query)('assignee').optional().isString(),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('milestone').optional().isString(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('sort').optional().isIn(['created', 'updated', 'priority', 'comments']),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.getIssues);
/**
 * @route   GET /api/issues/:id
 * @desc    Get single issue with details
 * @access  Private
 */
router.get('/:id', [(0, express_validator_1.param)('id').isString().notEmpty(), validation_middleware_1.validate], issue_controller_1.IssueController.getIssueById);
/**
 * @route   POST /api/issues
 * @desc    Create new issue
 * @access  Private
 */
router.post('/', [
    (0, express_validator_1.body)('repositoryId').isString().notEmpty().withMessage('Repository ID is required'),
    (0, express_validator_1.body)('title')
        .isString()
        .notEmpty()
        .isLength({ min: 1, max: 256 })
        .withMessage('Title is required and must be between 1-256 characters'),
    (0, express_validator_1.body)('body').optional().isString(),
    (0, express_validator_1.body)('labels').optional().isArray(),
    (0, express_validator_1.body)('assignees').optional().isArray(),
    (0, express_validator_1.body)('milestone').optional().isString(),
    (0, express_validator_1.body)('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']),
    (0, express_validator_1.body)('customStatus').optional().isString(),
    (0, express_validator_1.body)('estimatedTime').optional().isInt({ min: 0 }),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.createIssue);
/**
 * @route   PATCH /api/issues/:id
 * @desc    Update issue
 * @access  Private
 */
router.patch('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('title').optional().isString().isLength({ min: 1, max: 256 }),
    (0, express_validator_1.body)('body').optional().isString(),
    (0, express_validator_1.body)('state').optional().isIn(['open', 'closed']),
    (0, express_validator_1.body)('stateReason').optional().isIn(['completed', 'not_planned', 'reopened']),
    (0, express_validator_1.body)('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']),
    (0, express_validator_1.body)('customStatus').optional().isString(),
    (0, express_validator_1.body)('estimatedTime').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('labels').optional().isArray(),
    (0, express_validator_1.body)('assignees').optional().isArray(),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.updateIssue);
/**
 * @route   DELETE /api/issues/:id
 * @desc    Close issue
 * @access  Private
 */
router.delete('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.query)('reason').optional().isIn(['completed', 'not_planned']),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.closeIssue);
/**
 * @route   POST /api/issues/bulk
 * @desc    Bulk operations on issues
 * @access  Private
 */
router.post('/bulk', [
    (0, express_validator_1.body)('action')
        .isString()
        .isIn(['close', 'label', 'assign', 'priority', 'category'])
        .withMessage('Invalid action'),
    (0, express_validator_1.body)('issueIds').isArray({ min: 1 }).withMessage('Issue IDs must be a non-empty array'),
    (0, express_validator_1.body)('data').optional().isObject(),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.bulkOperation);
/**
 * @route   GET /api/issues/:id/comments
 * @desc    Get issue comments
 * @access  Private
 */
router.get('/:id/comments', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.getComments);
/**
 * @route   POST /api/issues/:id/comments
 * @desc    Add comment to issue
 * @access  Private
 */
router.post('/:id/comments', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('body').isString().notEmpty().withMessage('Comment body is required'),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.addComment);
/**
 * @route   PATCH /api/issues/:id/comments/:commentId
 * @desc    Edit comment
 * @access  Private
 */
router.patch('/:id/comments/:commentId', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.param)('commentId').isString().notEmpty(),
    (0, express_validator_1.body)('body').isString().notEmpty().withMessage('Comment body is required'),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.updateComment);
/**
 * @route   DELETE /api/issues/:id/comments/:commentId
 * @desc    Delete comment
 * @access  Private
 */
router.delete('/:id/comments/:commentId', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.param)('commentId').isString().notEmpty(),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.deleteComment);
/**
 * @route   POST /api/issues/:id/assign
 * @desc    Assign users to issue
 * @access  Private
 */
router.post('/:id/assign', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('assignees')
        .isArray()
        .withMessage('Assignees must be an array of GitHub usernames'),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.assignUsers);
/**
 * @route   POST /api/issues/:id/labels
 * @desc    Add/remove labels
 * @access  Private
 */
router.post('/:id/labels', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('labels').isArray().withMessage('Labels must be an array'),
    (0, express_validator_1.body)('action')
        .isString()
        .isIn(['add', 'remove', 'set'])
        .withMessage('Action must be add, remove, or set'),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.manageLabels);
/**
 * @route   POST /api/issues/:id/categories
 * @desc    Add categories to issue
 * @access  Private
 */
router.post('/:id/categories', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('categoryIds').isArray({ min: 1 }).withMessage('Category IDs must be an array'),
    validation_middleware_1.validate,
], issue_controller_1.IssueController.addCategories);
exports.default = router;

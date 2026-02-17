import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/issues
 * @desc    Get all issues with filters
 * @access  Private
 */
router.get(
  '/',
  [
    query('state').optional().isIn(['open', 'closed', 'all']),
    query('priority').optional().isString(),
    query('label').optional().isString(),
    query('repository').optional().isString(),
    query('assignee').optional().isString(),
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('milestone').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['created', 'updated', 'priority', 'comments']),
    query('order').optional().isIn(['asc', 'desc']),
    validate,
  ],
  IssueController.getIssues
);

/**
 * @route   GET /api/issues/:id
 * @desc    Get single issue with details
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').isString().notEmpty(), validate],
  IssueController.getIssueById
);

/**
 * @route   POST /api/issues
 * @desc    Create new issue
 * @access  Private
 */
router.post(
  '/',
  [
    body('repositoryId').isString().notEmpty().withMessage('Repository ID is required'),
    body('title')
      .isString()
      .notEmpty()
      .isLength({ min: 1, max: 256 })
      .withMessage('Title is required and must be between 1-256 characters'),
    body('body').optional().isString(),
    body('labels').optional().isArray(),
    body('assignees').optional().isArray(),
    body('milestone').optional().isString(),
    body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']),
    body('customStatus').optional().isString(),
    body('estimatedTime').optional().isInt({ min: 0 }),
    validate,
  ],
  IssueController.createIssue
);

/**
 * @route   PATCH /api/issues/:id
 * @desc    Update issue
 * @access  Private
 */
router.patch(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('title').optional().isString().isLength({ min: 1, max: 256 }),
    body('body').optional().isString(),
    body('state').optional().isIn(['open', 'closed']),
    body('stateReason').optional().isIn(['completed', 'not_planned', 'reopened']),
    body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']),
    body('customStatus').optional().isString(),
    body('estimatedTime').optional().isInt({ min: 0 }),
    body('labels').optional().isArray(),
    body('assignees').optional().isArray(),
    validate,
  ],
  IssueController.updateIssue
);

/**
 * @route   DELETE /api/issues/:id
 * @desc    Close issue
 * @access  Private
 */
router.delete(
  '/:id',
  [
    param('id').isString().notEmpty(),
    query('reason').optional().isIn(['completed', 'not_planned']),
    validate,
  ],
  IssueController.closeIssue
);

/**
 * @route   POST /api/issues/bulk
 * @desc    Bulk operations on issues
 * @access  Private
 */
router.post(
  '/bulk',
  [
    body('action')
      .isString()
      .isIn(['close', 'label', 'assign', 'priority', 'category'])
      .withMessage('Invalid action'),
    body('issueIds').isArray({ min: 1 }).withMessage('Issue IDs must be a non-empty array'),
    body('data').optional().isObject(),
    validate,
  ],
  IssueController.bulkOperation
);

/**
 * @route   GET /api/issues/:id/comments
 * @desc    Get issue comments
 * @access  Private
 */
router.get(
  '/:id/comments',
  [
    param('id').isString().notEmpty(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  IssueController.getComments
);

/**
 * @route   POST /api/issues/:id/comments
 * @desc    Add comment to issue
 * @access  Private
 */
router.post(
  '/:id/comments',
  [
    param('id').isString().notEmpty(),
    body('body').isString().notEmpty().withMessage('Comment body is required'),
    validate,
  ],
  IssueController.addComment
);

/**
 * @route   PATCH /api/issues/:id/comments/:commentId
 * @desc    Edit comment
 * @access  Private
 */
router.patch(
  '/:id/comments/:commentId',
  [
    param('id').isString().notEmpty(),
    param('commentId').isString().notEmpty(),
    body('body').isString().notEmpty().withMessage('Comment body is required'),
    validate,
  ],
  IssueController.updateComment
);

/**
 * @route   DELETE /api/issues/:id/comments/:commentId
 * @desc    Delete comment
 * @access  Private
 */
router.delete(
  '/:id/comments/:commentId',
  [
    param('id').isString().notEmpty(),
    param('commentId').isString().notEmpty(),
    validate,
  ],
  IssueController.deleteComment
);

/**
 * @route   POST /api/issues/:id/assign
 * @desc    Assign users to issue
 * @access  Private
 */
router.post(
  '/:id/assign',
  [
    param('id').isString().notEmpty(),
    body('assignees')
      .isArray()
      .withMessage('Assignees must be an array of GitHub usernames'),
    validate,
  ],
  IssueController.assignUsers
);

/**
 * @route   POST /api/issues/:id/labels
 * @desc    Add/remove labels
 * @access  Private
 */
router.post(
  '/:id/labels',
  [
    param('id').isString().notEmpty(),
    body('labels').isArray().withMessage('Labels must be an array'),
    body('action')
      .isString()
      .isIn(['add', 'remove', 'set'])
      .withMessage('Action must be add, remove, or set'),
    validate,
  ],
  IssueController.manageLabels
);

/**
 * @route   POST /api/issues/:id/categories
 * @desc    Add categories to issue
 * @access  Private
 */
router.post(
  '/:id/categories',
  [
    param('id').isString().notEmpty(),
    body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs must be an array'),
    validate,
  ],
  IssueController.addCategories
);

export default router;

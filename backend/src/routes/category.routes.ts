/**
 * Category Routes
 * 5.1 GET    /api/categories       - Get all user categories
 * 5.2 POST   /api/categories       - Create category
 * 5.3 PATCH  /api/categories/:id   - Update category
 * 5.4 DELETE /api/categories/:id   - Delete category
 *
 * Note: 5.5 / 5.6 (issue-category assignment) live in issue.routes.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/categories
 * @desc    Get all categories for authenticated user
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validate,
  ],
  getCategories
);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Category name is required'),
    body('color')
      .isString()
      .matches(/^[0-9a-fA-F]{6}$/)
      .withMessage('Valid 6-char hex color required (e.g. ff0000)'),
    validate,
  ],
  createCategory
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update a category
 * @access  Private
 */
router.patch(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString().notEmpty(),
    body('color')
      .optional()
      .isString()
      .matches(/^[0-9a-fA-F]{6}$/)
      .withMessage('Valid 6-char hex color required (e.g. ff0000)'),
    validate,
  ],
  updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').isString().notEmpty(), validate],
  deleteCategory
);

export default router;
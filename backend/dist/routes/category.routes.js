"use strict";
/**
 * Category Routes
 * 5.1 GET    /api/categories       - Get all user categories
 * 5.2 POST   /api/categories       - Create category
 * 5.3 PATCH  /api/categories/:id   - Update category
 * 5.4 DELETE /api/categories/:id   - Delete category
 *
 * Note: 5.5 / 5.6 (issue-category assignment) live in issue.routes.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
/**
 * @route   GET /api/categories
 * @desc    Get all categories for authenticated user
 * @access  Private
 */
router.get('/', category_controller_1.getCategories);
/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post('/', [
    (0, express_validator_1.body)('name').isString().notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('color')
        .isString()
        .matches(/^[0-9a-fA-F]{6}$/)
        .withMessage('Valid 6-char hex color required (e.g. ff0000)'),
    validation_middleware_1.validate,
], category_controller_1.createCategory);
/**
 * @route   PATCH /api/categories/:id
 * @desc    Update a category
 * @access  Private
 */
router.patch('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('name').optional().isString().notEmpty(),
    (0, express_validator_1.body)('color')
        .optional()
        .isString()
        .matches(/^[0-9a-fA-F]{6}$/)
        .withMessage('Valid 6-char hex color required (e.g. ff0000)'),
    validation_middleware_1.validate,
], category_controller_1.updateCategory);
/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private
 */
router.delete('/:id', [(0, express_validator_1.param)('id').isString().notEmpty(), validation_middleware_1.validate], category_controller_1.deleteCategory);
exports.default = router;

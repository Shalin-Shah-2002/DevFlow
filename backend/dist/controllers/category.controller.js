"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCategoryFromIssue = exports.assignCategoriesToIssue = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const category_service_1 = require("../services/category.service");
const categoryService = new category_service_1.CategoryService();
/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         name:
 *           type: string
 *           example: Urgent
 *         color:
 *           type: string
 *           example: ff0000
 *         issueCount:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all user categories
 *     description: Retrieve all custom categories created by the authenticated user, including issue count per category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
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
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// ─────────────────────────────────────────────
// 5.1 GET /api/categories
// ─────────────────────────────────────────────
const getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const categories = await categoryService.getCategories(userId);
        return res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        console.error('[getCategories] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch categories',
        });
    }
};
exports.getCategories = getCategories;
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a custom category for organising issues (local only, not synced to GitHub)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 example: Urgent
 *               color:
 *                 type: string
 *                 description: 6-character hex color (no #)
 *                 example: ff0000
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category name already exists
 *       401:
 *         description: Unauthorized
 */
// ─────────────────────────────────────────────
// 5.2 POST /api/categories
// ─────────────────────────────────────────────
const createCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, color } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Category name is required',
            });
        }
        if (!color || !/^[0-9a-fA-F]{6}$/.test(color)) {
            return res.status(400).json({
                success: false,
                error: 'Valid hex color is required (e.g. ff0000)',
            });
        }
        // Check duplicate name for this user
        const exists = await categoryService.findByName(name.trim(), userId);
        if (exists) {
            return res.status(409).json({
                success: false,
                error: 'Category with this name already exists',
            });
        }
        const category = await categoryService.createCategory(userId, name.trim(), color);
        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                id: category.id,
                name: category.name,
                color: category.color,
                createdAt: category.createdAt,
            },
        });
    }
    catch (error) {
        console.error('[createCategory] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create category',
        });
    }
};
exports.createCategory = createCategory;
/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     description: Update the name and/or color of an existing category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Critical
 *               color:
 *                 type: string
 *                 description: 6-character hex color (no #)
 *                 example: b60205
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       401:
 *         description: Unauthorized
 */
// ─────────────────────────────────────────────
// 5.3 PATCH /api/categories/:id
// ─────────────────────────────────────────────
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const { name, color } = req.body;
        if (!name && !color) {
            return res.status(400).json({
                success: false,
                error: 'At least one of name or color is required',
            });
        }
        if (color && !/^[0-9a-fA-F]{6}$/.test(color)) {
            return res.status(400).json({
                success: false,
                error: 'Valid hex color is required (e.g. ff0000)',
            });
        }
        // Verify category exists and belongs to user
        const category = await categoryService.findById(id, userId);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
            });
        }
        // Check duplicate name (if name is being changed)
        if (name && name.trim() !== category.name) {
            const exists = await categoryService.findByName(name.trim(), userId);
            if (exists) {
                return res.status(409).json({
                    success: false,
                    error: 'Category with this name already exists',
                });
            }
        }
        const updated = await categoryService.updateCategory(id, {
            ...(name && { name: name.trim() }),
            ...(color && { color }),
        });
        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: {
                id: updated.id,
                name: updated.name,
                color: updated.color,
            },
        });
    }
    catch (error) {
        console.error('[updateCategory] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update category',
        });
    }
};
exports.updateCategory = updateCategory;
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Permanently delete a category. All issue-category links are removed automatically.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
// ─────────────────────────────────────────────
// 5.4 DELETE /api/categories/:id
// ─────────────────────────────────────────────
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        // Verify category exists and belongs to user
        const category = await categoryService.findById(id, userId);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
            });
        }
        await categoryService.deleteCategory(id);
        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    }
    catch (error) {
        console.error('[deleteCategory] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete category',
        });
    }
};
exports.deleteCategory = deleteCategory;
/**
 * @swagger
 * /api/issues/{id}/categories:
 *   post:
 *     summary: Assign categories to issue
 *     description: Add one or more custom categories to an issue (local only, not synced to GitHub)
 *     tags: [Categories]
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
 *               - categoryIds
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [clx123abc, clx456def]
 *     responses:
 *       200:
 *         description: Categories assigned successfully
 *       400:
 *         description: Invalid category IDs
 *       403:
 *         description: No access to issue
 *       401:
 *         description: Unauthorized
 */
// ─────────────────────────────────────────────
// 5.5 POST /api/issues/:issueId/categories
// ─────────────────────────────────────────────
const assignCategoriesToIssue = async (req, res) => {
    try {
        const issueId = req.params.id;
        const userId = req.user.id;
        const { categoryIds } = req.body;
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'categoryIds array is required',
            });
        }
        // Verify user has access to the issue
        const hasAccess = await categoryService.verifyIssueAccess(issueId, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'You do not have access to this issue',
            });
        }
        // Verify all categories belong to user
        const validCategories = await categoryService.verifyCategories(categoryIds, userId);
        if (validCategories.length !== categoryIds.length) {
            return res.status(400).json({
                success: false,
                error: 'One or more category IDs are invalid',
            });
        }
        await categoryService.assignCategories(issueId, categoryIds);
        return res.status(200).json({
            success: true,
            message: 'Categories assigned to issue successfully',
            data: {
                issueId,
                categoryIds,
            },
        });
    }
    catch (error) {
        console.error('[assignCategoriesToIssue] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to assign categories',
        });
    }
};
exports.assignCategoriesToIssue = assignCategoriesToIssue;
/**
 * @swagger
 * /api/issues/{id}/categories/{categoryId}:
 *   delete:
 *     summary: Remove category from issue
 *     description: Remove a single custom category from an issue
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to remove
 *     responses:
 *       200:
 *         description: Category removed from issue successfully
 *       403:
 *         description: No access to issue
 *       404:
 *         description: Category not assigned to this issue
 *       401:
 *         description: Unauthorized
 */
// ─────────────────────────────────────────────
// 5.6 DELETE /api/issues/:issueId/categories/:categoryId
// ─────────────────────────────────────────────
const removeCategoryFromIssue = async (req, res) => {
    try {
        const issueId = req.params.id;
        const categoryId = req.params.categoryId;
        const userId = req.user.id;
        // Verify user has access to the issue
        const hasAccess = await categoryService.verifyIssueAccess(issueId, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'You do not have access to this issue',
            });
        }
        // Verify category is actually assigned to this issue
        const isAssigned = await categoryService.isCategoryAssigned(issueId, categoryId);
        if (!isAssigned) {
            return res.status(404).json({
                success: false,
                error: 'Category is not assigned to this issue',
            });
        }
        await categoryService.removeCategoryFromIssue(issueId, categoryId);
        return res.status(200).json({
            success: true,
            message: 'Category removed from issue successfully',
        });
    }
    catch (error) {
        console.error('[removeCategoryFromIssue] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to remove category from issue',
        });
    }
};
exports.removeCategoryFromIssue = removeCategoryFromIssue;

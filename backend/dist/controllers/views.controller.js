"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewsController = void 0;
const views_service_1 = require("../services/views.service");
const views_validator_1 = require("../validators/views.validator");
const viewsService = new views_service_1.ViewsService();
/**
 * @swagger
 * components:
 *   schemas:
 *     ViewFilters:
 *       type: object
 *       description: Filter criteria stored inside a saved view
 *       properties:
 *         state:
 *           type: string
 *           enum: [open, closed, all]
 *           example: open
 *         priority:
 *           type: array
 *           items:
 *             type: string
 *             enum: [P0, P1, P2, P3]
 *           example: [P0, P1]
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           example: [bug, enhancement]
 *         assignee:
 *           type: string
 *           example: johndoe
 *         repository:
 *           type: string
 *           example: clx987xyz654
 *         category:
 *           type: string
 *           example: Frontend
 *         milestone:
 *           type: string
 *           example: v1.0
 *         search:
 *           type: string
 *           example: login bug
 *         createdAfter:
 *           type: string
 *           format: date-time
 *           example: '2026-01-01T00:00:00Z'
 *         createdBefore:
 *           type: string
 *           format: date-time
 *           example: '2026-12-31T23:59:59Z'
 *         sort:
 *           type: string
 *           enum: [created, updated, priority]
 *           example: created
 *         order:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     SavedView:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx123abc456
 *         name:
 *           type: string
 *           example: My Open P0 Bugs
 *         filters:
 *           $ref: '#/components/schemas/ViewFilters'
 *         isDefault:
 *           type: boolean
 *           example: false
 *         userId:
 *           type: string
 *           example: clx999user111
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2026-02-14T10:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: '2026-02-14T10:00:00Z'
 *
 *     CreateViewBody:
 *       type: object
 *       required:
 *         - name
 *         - filters
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Open P0 Issues
 *         filters:
 *           $ref: '#/components/schemas/ViewFilters'
 *         isDefault:
 *           type: boolean
 *           default: false
 *           example: false
 *
 *     UpdateViewBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Updated View Name
 *         filters:
 *           $ref: '#/components/schemas/ViewFilters'
 *         isDefault:
 *           type: boolean
 *           example: true
 *
 *     ApplyViewResult:
 *       type: object
 *       properties:
 *         view:
 *           $ref: '#/components/schemas/SavedView'
 *         issues:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Issue'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 42
 *             totalPages:
 *               type: integer
 *               example: 3
 */
class ViewsController {
    /**
     * @swagger
     * /api/views:
     *   get:
     *     summary: Get all saved views
     *     description: Returns all saved views belonging to the authenticated user, ordered by default first then newest.
     *     tags:
     *       - Views
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 20
     *         description: Items per page (max 100)
     *     responses:
     *       200:
     *         description: List of saved views retrieved successfully
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
     *                     $ref: '#/components/schemas/SavedView'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     total:
     *                       type: integer
     *                     totalPages:
     *                       type: integer
     *       401:
     *         description: Unauthorized – missing or invalid JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    // GET /api/views
    async getViews(req, res) {
        try {
            const userId = req.user.id;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const result = await viewsService.getViews(userId, page, limit);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch views" });
        }
    }
    /**
     * @swagger
     * /api/views:
     *   post:
     *     summary: Create a saved view
     *     description: Creates a new saved view with custom filter criteria. If `isDefault` is true, all other views for the user are unset as default.
     *     tags:
     *       - Views
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateViewBody'
     *           example:
     *             name: Open P0 Issues
     *             filters:
     *               state: open
     *               priority: [P0]
     *               sort: priority
     *               order: desc
     *             isDefault: false
     *     responses:
     *       201:
     *         description: View created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: View created successfully
     *                 data:
     *                   $ref: '#/components/schemas/SavedView'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 error:
     *                   type: string
     *                   example: Validation failed
     *                 details:
     *                   type: object
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    // POST /api/views
    async createView(req, res) {
        try {
            const parsed = views_validator_1.createViewSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: parsed.error.flatten(),
                });
            }
            const view = await viewsService.createView(req.user.id, parsed.data);
            res.status(201).json({
                success: true,
                message: "View created successfully",
                data: view,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to create view" });
        }
    }
    /**
     * @swagger
     * /api/views/{id}:
     *   patch:
     *     summary: Update a saved view
     *     description: Updates the name, filters, or default status of an existing saved view owned by the authenticated user.
     *     tags:
     *       - Views
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the saved view to update
     *         example: clx123abc456
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateViewBody'
     *           example:
     *             name: Updated View Name
     *             isDefault: true
     *     responses:
     *       200:
     *         description: View updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: View updated successfully
     *                 data:
     *                   $ref: '#/components/schemas/SavedView'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 error:
     *                   type: string
     *                   example: Validation failed
     *                 details:
     *                   type: object
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: View not found or does not belong to user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    // PATCH /api/views/:id
    async updateView(req, res) {
        try {
            const parsed = views_validator_1.updateViewSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: parsed.error.flatten(),
                });
            }
            const updated = await viewsService.updateView(req.user.id, req.params.id, parsed.data);
            if (!updated) {
                return res
                    .status(404)
                    .json({ success: false, error: "View not found" });
            }
            res.status(200).json({
                success: true,
                message: "View updated successfully",
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to update view" });
        }
    }
    /**
     * @swagger
     * /api/views/{id}:
     *   delete:
     *     summary: Delete a saved view
     *     description: Permanently deletes a saved view owned by the authenticated user.
     *     tags:
     *       - Views
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the saved view to delete
     *         example: clx123abc456
     *     responses:
     *       200:
     *         description: View deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: View deleted successfully
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: View not found or does not belong to user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    // DELETE /api/views/:id
    async deleteView(req, res) {
        try {
            const deleted = await viewsService.deleteView(req.user.id, req.params.id);
            if (!deleted) {
                return res
                    .status(404)
                    .json({ success: false, error: "View not found" });
            }
            res.status(200).json({
                success: true,
                message: "View deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to delete view" });
        }
    }
    /**
     * @swagger
     * /api/views/{id}/apply:
     *   post:
     *     summary: Apply a saved view
     *     description: Executes the filters stored in a saved view and returns matching issues with pagination.
     *     tags:
     *       - Views
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the saved view to apply
     *         example: clx123abc456
     *       - in: query
     *         name: page
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number for pagination
     *         example: 1
     *       - in: query
     *         name: limit
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 20
     *         description: Number of issues per page
     *         example: 20
     *     responses:
     *       200:
     *         description: Issues matching the saved view filters
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/ApplyViewResult'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: View not found or does not belong to user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    // POST /api/views/:id/apply
    async applyView(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await viewsService.applyView(req.user.id, req.params.id, page, limit);
            if (!result) {
                return res
                    .status(404)
                    .json({ success: false, error: "View not found" });
            }
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to apply view" });
        }
    }
}
exports.ViewsController = ViewsController;

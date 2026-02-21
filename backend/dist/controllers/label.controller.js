"use strict";
/**
 * Label Controller
 * HTTP request handlers for label endpoints
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLabelsFromGitHub = exports.deleteLabel = exports.updateLabel = exports.createLabel = exports.getLabelById = exports.getAllLabels = void 0;
const labelService = __importStar(require("../services/label.service"));
/**
 * @swagger
 * /api/labels:
 *   get:
 *     summary: Get all labels
 *     description: Retrieve all labels with optional filtering and pagination
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: repositoryId
 *         schema:
 *           type: string
 *         description: Filter by repository ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search labels by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, issueCount]
 *           default: name
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Labels retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getAllLabels = async (req, res) => {
    try {
        const userId = req.user.id;
        const params = {
            repositoryId: req.query.repositoryId,
            search: req.query.search,
            page: req.query.page ? parseInt(req.query.page) : 1,
            pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 50,
            sortBy: req.query.sortBy || 'name',
            sortOrder: req.query.sortOrder || 'asc',
        };
        const { labels, total } = await labelService.getLabels(userId, params);
        const response = {
            success: true,
            labels,
            total,
            page: params.page,
            pageSize: params.pageSize,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get all labels error:', error);
        const errorResponse = {
            success: false,
            message: 'Failed to retrieve labels',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.getAllLabels = getAllLabels;
/**
 * @swagger
 * /api/labels/{id}:
 *   get:
 *     summary: Get label by ID
 *     description: Retrieve a single label with details
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Label ID
 *     responses:
 *       200:
 *         description: Label retrieved successfully
 *       404:
 *         description: Label not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getLabelById = async (req, res) => {
    try {
        const userId = req.user.id;
        const labelId = req.params.id;
        const label = await labelService.getLabelById(labelId, userId);
        if (!label) {
            const errorResponse = {
                success: false,
                message: 'Label not found or access denied',
            };
            res.status(404).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            label,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get label by ID error:', error);
        const errorResponse = {
            success: false,
            message: 'Failed to retrieve label',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.getLabelById = getLabelById;
/**
 * @swagger
 * /api/labels:
 *   post:
 *     summary: Create a new label
 *     description: Create a new label in a repository
 *     tags: [Labels]
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
 *               - repositoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: bug
 *               color:
 *                 type: string
 *                 example: d73a4a
 *                 description: Hex color code (without #)
 *               description:
 *                 type: string
 *                 example: Something isn't working
 *               repositoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Label created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Label already exists
 *       500:
 *         description: Server error
 */
const createLabel = async (req, res) => {
    try {
        const userId = req.user.id;
        const input = req.body;
        // Validate required fields
        if (!input.name || !input.color || !input.repositoryId) {
            const errorResponse = {
                success: false,
                message: 'Name, color, and repositoryId are required',
            };
            res.status(400).json(errorResponse);
            return;
        }
        const label = await labelService.createLabel(input, userId);
        const response = {
            success: true,
            label,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Create label error:', error);
        if (error.message.includes('already exists')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(409).json(errorResponse);
            return;
        }
        if (error.message.includes('not found') || error.message.includes('denied')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(403).json(errorResponse);
            return;
        }
        if (error.message.includes('Invalid') || error.message.includes('must be')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(400).json(errorResponse);
            return;
        }
        const errorResponse = {
            success: false,
            message: 'Failed to create label',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.createLabel = createLabel;
/**
 * @swagger
 * /api/labels/{id}:
 *   put:
 *     summary: Update a label
 *     description: Update an existing label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Label ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *                 description: Hex color code (without #)
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Label updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Label not found
 *       500:
 *         description: Server error
 */
const updateLabel = async (req, res) => {
    try {
        const userId = req.user.id;
        const labelId = req.params.id;
        const input = req.body;
        const label = await labelService.updateLabel(labelId, input, userId);
        const response = {
            success: true,
            label,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update label error:', error);
        if (error.message.includes('not found')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(errorResponse);
            return;
        }
        if (error.message.includes('denied')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(403).json(errorResponse);
            return;
        }
        if (error.message.includes('Invalid') || error.message.includes('must be')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (error.message.includes('already exists')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(409).json(errorResponse);
            return;
        }
        const errorResponse = {
            success: false,
            message: 'Failed to update label',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.updateLabel = updateLabel;
/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     summary: Delete a label
 *     description: Delete a label from a repository
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Label ID
 *     responses:
 *       200:
 *         description: Label deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Label not found
 *       500:
 *         description: Server error
 */
const deleteLabel = async (req, res) => {
    try {
        const userId = req.user.id;
        const labelId = req.params.id;
        await labelService.deleteLabel(labelId, userId);
        const response = {
            success: true,
            message: 'Label deleted successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Delete label error:', error);
        if (error.message.includes('not found')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(errorResponse);
            return;
        }
        if (error.message.includes('denied')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(403).json(errorResponse);
            return;
        }
        const errorResponse = {
            success: false,
            message: 'Failed to delete label',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.deleteLabel = deleteLabel;
/**
 * @swagger
 * /api/labels/sync/{repoId}:
 *   post:
 *     summary: Sync labels from GitHub
 *     description: Sync labels from a GitHub repository
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository ID
 *     responses:
 *       200:
 *         description: Labels synced successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Server error
 */
const syncLabelsFromGitHub = async (req, res) => {
    try {
        const userId = req.user.id;
        const repositoryId = req.params.repoId;
        const result = await labelService.syncLabelsFromGitHub(repositoryId, userId);
        const response = {
            success: true,
            message: `Successfully synced ${result.synced} labels (${result.created} created, ${result.updated} updated)`,
            synced: result.synced,
            created: result.created,
            updated: result.updated,
            labels: result.labels,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Sync labels error:', error);
        if (error.message.includes('not found')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(errorResponse);
            return;
        }
        if (error.message.includes('denied')) {
            const errorResponse = {
                success: false,
                message: error.message,
            };
            res.status(403).json(errorResponse);
            return;
        }
        const errorResponse = {
            success: false,
            message: 'Failed to sync labels from GitHub',
            error: error.message,
        };
        res.status(500).json(errorResponse);
    }
};
exports.syncLabelsFromGitHub = syncLabelsFromGitHub;

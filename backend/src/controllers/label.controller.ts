/**
 * Label Controller
 * HTTP request handlers for label endpoints
 */

import { Request, Response } from 'express';
import * as labelService from '../services/label.service';
import {
  CreateLabelInput,
  UpdateLabelInput,
  LabelQueryParams,
  LabelsListResponse,
  LabelResponse,
  LabelSyncResponse,
  DeleteLabelResponse,
} from '../models/label.model';
import { ErrorResponse } from '../models';

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
export const getAllLabels = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const params: LabelQueryParams = {
      repositoryId: req.query.repositoryId as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 50,
      sortBy: (req.query.sortBy as any) || 'name',
      sortOrder: (req.query.sortOrder as any) || 'asc',
    };

    const { labels, total } = await labelService.getLabels(userId, params);

    const response: LabelsListResponse = {
      success: true,
      labels,
      total,
      page: params.page,
      pageSize: params.pageSize,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get all labels error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to retrieve labels',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

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
export const getLabelById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const labelId = req.params.id as string;

    const label = await labelService.getLabelById(labelId, userId);

    if (!label) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Label not found or access denied',
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: LabelResponse = {
      success: true,
      label,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get label by ID error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to retrieve label',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

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
export const createLabel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const input: CreateLabelInput = req.body;

    // Validate required fields
    if (!input.name || !input.color || !input.repositoryId) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Name, color, and repositoryId are required',
      };
      res.status(400).json(errorResponse);
      return;
    }

    const label = await labelService.createLabel(input, userId);

    const response: LabelResponse = {
      success: true,
      label,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create label error:', error);
    
    if (error.message.includes('already exists')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(409).json(errorResponse);
      return;
    }

    if (error.message.includes('not found') || error.message.includes('denied')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(403).json(errorResponse);
      return;
    }

    if (error.message.includes('Invalid') || error.message.includes('must be')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(400).json(errorResponse);
      return;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to create label',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

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
export const updateLabel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const labelId = req.params.id as string;
    const input: UpdateLabelInput = req.body;

    const label = await labelService.updateLabel(labelId, input, userId);

    const response: LabelResponse = {
      success: true,
      label,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Update label error:', error);

    if (error.message.includes('not found')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(404).json(errorResponse);
      return;
    }

    if (error.message.includes('denied')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(403).json(errorResponse);
      return;
    }

    if (error.message.includes('Invalid') || error.message.includes('must be')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (error.message.includes('already exists')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(409).json(errorResponse);
      return;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to update label',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

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
export const deleteLabel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const labelId = req.params.id as string;

    await labelService.deleteLabel(labelId, userId);

    const response: DeleteLabelResponse = {
      success: true,
      message: 'Label deleted successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Delete label error:', error);

    if (error.message.includes('not found')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(404).json(errorResponse);
      return;
    }

    if (error.message.includes('denied')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(403).json(errorResponse);
      return;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to delete label',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

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
export const syncLabelsFromGitHub = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const repositoryId = req.params.repoId as string;

    const result = await labelService.syncLabelsFromGitHub(repositoryId, userId);

    const response: LabelSyncResponse = {
      success: true,
      message: `Successfully synced ${result.synced} labels (${result.created} created, ${result.updated} updated)`,
      synced: result.synced,
      created: result.created,
      updated: result.updated,
      labels: result.labels,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Sync labels error:', error);

    if (error.message.includes('not found')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(404).json(errorResponse);
      return;
    }

    if (error.message.includes('denied')) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: error.message,
      };
      res.status(403).json(errorResponse);
      return;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to sync labels from GitHub',
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};

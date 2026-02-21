/**
 * Label Routes
 * API routes for label management
 */

import { Router } from 'express';
import * as labelController from '../controllers/label.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All label routes require authentication
router.use(authMiddleware);

/**
 * GET /api/labels
 * Get all labels with filtering and pagination
 */
router.get('/', labelController.getAllLabels);

/**
 * POST /api/labels
 * Create a new label
 */
router.post('/', labelController.createLabel);

/**
 * POST /api/labels/sync/:repoId
 * Sync labels from GitHub repository
 * Note: This must come before /:id to avoid route conflict
 */
router.post('/sync/:repoId', labelController.syncLabelsFromGitHub);

/**
 * GET /api/labels/:id
 * Get label by ID
 */
router.get('/:id', labelController.getLabelById);

/**
 * PUT /api/labels/:id
 * Update a label
 */
router.put('/:id', labelController.updateLabel);

/**
 * DELETE /api/labels/:id
 * Delete a label
 */
router.delete('/:id', labelController.deleteLabel);

export default router;

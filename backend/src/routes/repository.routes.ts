import { Router } from 'express';
import { RepositoryController } from '../controllers/repository.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All repository routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/repositories
 * @desc    List all user repositories
 * @access  Private
 */
router.get('/', RepositoryController.getRepositories);

/**
 * @route   POST /api/repositories
 * @desc    Add new repository
 * @access  Private
 */
router.post('/', RepositoryController.addRepository);

/**
 * @route   GET /api/repositories/:id
 * @desc    Get repository details
 * @access  Private
 */
router.get('/:id', RepositoryController.getRepositoryById);

/**
 * @route   PATCH /api/repositories/:id
 * @desc    Update repository settings
 * @access  Private
 */
router.patch('/:id', RepositoryController.updateRepository);

/**
 * @route   DELETE /api/repositories/:id
 * @desc    Remove repository
 * @access  Private
 */
router.delete('/:id', RepositoryController.deleteRepository);

/**
 * @route   POST /api/repositories/:id/sync
 * @desc    Sync repository issues from GitHub
 * @access  Private
 */
router.post('/:id/sync', RepositoryController.syncRepository);

/**
 * @route   POST /api/repositories/:id/webhook
 * @desc    Setup GitHub webhook
 * @access  Private
 */
router.post('/:id/webhook', RepositoryController.setupWebhook);

export default router;

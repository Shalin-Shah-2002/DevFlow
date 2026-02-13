import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: GitHub OAuth and JWT authentication endpoints
 */

// Public routes (no authentication required)
router.get('/github', AuthController.initiateGitHubAuth);
router.get('/github/callback', AuthController.githubCallback);

// Protected routes (authentication required)
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/refresh', authMiddleware, AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;

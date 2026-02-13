"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: GitHub OAuth and JWT authentication endpoints
 */
// Public routes (no authentication required)
router.get('/github', auth_controller_1.AuthController.initiateGitHubAuth);
router.get('/github/callback', auth_controller_1.AuthController.githubCallback);
// Protected routes (authentication required)
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.getCurrentUser);
router.post('/refresh', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.refreshToken);
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.logout);
exports.default = router;

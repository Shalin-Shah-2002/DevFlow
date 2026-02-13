"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         expiresIn:
 *           type: string
 *           example: 7d
 *         user:
 *           $ref: '#/components/schemas/User'
 */
class AuthController {
    /**
     * @swagger
     * /api/auth/github:
     *   get:
     *     summary: Initiate GitHub OAuth login
     *     description: Redirects user to GitHub for authentication
     *     tags: [Authentication]
     *     security: []
     *     responses:
     *       200:
     *         description: GitHub OAuth URL returned
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 redirectUrl:
     *                   type: string
     *                   example: https://github.com/login/oauth/authorize?client_id=xxx
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static async initiateGitHubAuth(req, res) {
        try {
            const redirectUrl = auth_service_1.AuthService.getGitHubAuthUrl();
            const response = {
                success: true,
                redirectUrl,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error initiating GitHub auth:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to initiate GitHub authentication',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            res.status(500).json(errorResponse);
        }
    }
    /**
     * @swagger
     * /api/auth/github/callback:
     *   get:
     *     summary: GitHub OAuth callback handler
     *     description: Handles the callback from GitHub after user authorization
     *     tags: [Authentication]
     *     security: []
     *     parameters:
     *       - in: query
     *         name: code
     *         required: true
     *         schema:
     *           type: string
     *         description: OAuth authorization code from GitHub
     *     responses:
     *       302:
     *         description: Redirects to frontend with JWT token
     *       400:
     *         description: Missing authorization code
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Authentication failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static async githubCallback(req, res) {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Authorization code is required',
                });
                return;
            }
            // Exchange code for access token
            const accessToken = await auth_service_1.AuthService.getGitHubAccessToken(code);
            // Get GitHub user profile
            const githubUser = await auth_service_1.AuthService.getGitHubUser(accessToken);
            // Create or update user in database
            const user = await auth_service_1.AuthService.createOrUpdateUser(githubUser, accessToken);
            // Generate JWT token
            const jwtToken = auth_service_1.AuthService.generateJWT(user.id, user.email, user.githubId);
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/success?token=${jwtToken}`);
        }
        catch (error) {
            console.error('Error in GitHub callback:', error);
            // Redirect to frontend with error
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`);
        }
    }
    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current user profile
     *     description: Retrieve authenticated user's information
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static async getCurrentUser(req, res) {
        try {
            const user = req.user;
            if (!user) {
                const errorResponse = {
                    success: false,
                    message: 'User not authenticated',
                };
                res.status(401).json(errorResponse);
                return;
            }
            const userProfile = await auth_service_1.AuthService.getUserById(user.id);
            if (!userProfile) {
                const errorResponse = {
                    success: false,
                    message: 'User not found',
                };
                res.status(404).json(errorResponse);
                return;
            }
            const response = {
                success: true,
                user: userProfile,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error getting current user:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to fetch user profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            res.status(500).json(errorResponse);
        }
    }
    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     description: Generate a new JWT token using the old token
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 token:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                 expiresIn:
     *                   type: string
     *                   example: 7d
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static async refreshToken(req, res) {
        try {
            const user = req.user;
            if (!user) {
                const errorResponse = {
                    success: false,
                    message: 'User not authenticated',
                };
                res.status(401).json(errorResponse);
                return;
            }
            // Generate new JWT token
            const newToken = auth_service_1.AuthService.generateJWT(user.id, user.email, user.githubId);
            const response = {
                success: true,
                token: newToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to refresh token',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            res.status(500).json(errorResponse);
        }
    }
    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout user
     *     description: Invalidate current session (client should delete token)
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logged out successfully
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
     *                   example: Logged out successfully
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static async logout(req, res) {
        try {
            // In a stateless JWT system, logout is handled client-side by deleting the token
            // If you want to implement token blacklisting, you can add that logic here
            const response = {
                success: true,
                message: 'Logged out successfully. Please delete your token on the client side.',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error during logout:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to logout',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            res.status(500).json(errorResponse);
        }
    }
}
exports.AuthController = AuthController;

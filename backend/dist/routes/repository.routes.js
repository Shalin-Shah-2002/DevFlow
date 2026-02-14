"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repository_controller_1 = require("../controllers/repository.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All repository routes require authentication
router.use(auth_middleware_1.authMiddleware);
/**
 * @route   GET /api/repositories
 * @desc    List all user repositories
 * @access  Private
 */
router.get('/', repository_controller_1.RepositoryController.getRepositories);
/**
 * @route   POST /api/repositories
 * @desc    Add new repository
 * @access  Private
 */
router.post('/', repository_controller_1.RepositoryController.addRepository);
/**
 * @route   GET /api/repositories/:id
 * @desc    Get repository details
 * @access  Private
 */
router.get('/:id', repository_controller_1.RepositoryController.getRepositoryById);
/**
 * @route   PATCH /api/repositories/:id
 * @desc    Update repository settings
 * @access  Private
 */
router.patch('/:id', repository_controller_1.RepositoryController.updateRepository);
/**
 * @route   DELETE /api/repositories/:id
 * @desc    Remove repository
 * @access  Private
 */
router.delete('/:id', repository_controller_1.RepositoryController.deleteRepository);
/**
 * @route   POST /api/repositories/:id/sync
 * @desc    Sync repository issues from GitHub
 * @access  Private
 */
router.post('/:id/sync', repository_controller_1.RepositoryController.syncRepository);
/**
 * @route   POST /api/repositories/:id/webhook
 * @desc    Setup GitHub webhook
 * @access  Private
 */
router.post('/:id/webhook', repository_controller_1.RepositoryController.setupWebhook);
exports.default = router;

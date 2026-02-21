"use strict";
/**
 * Label Routes
 * API routes for label management
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
const express_1 = require("express");
const labelController = __importStar(require("../controllers/label.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All label routes require authentication
router.use(auth_middleware_1.authMiddleware);
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
exports.default = router;

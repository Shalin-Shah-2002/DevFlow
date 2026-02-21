"use strict";
/**
 * Label Model
 * TypeScript interfaces and types for Label management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLabelResponse = toLabelResponse;
exports.isValidHexColor = isValidHexColor;
exports.generateRandomColor = generateRandomColor;
exports.isValidLabelName = isValidLabelName;
// ============= Helper Functions =============
/**
 * Convert Prisma Label to LabelResponse
 */
function toLabelResponse(label) {
    return {
        id: label.id,
        githubId: label.githubId,
        name: label.name,
        color: label.color,
        description: label.description,
        repositoryId: label.repositoryId,
        createdAt: label.createdAt,
    };
}
/**
 * Validate hex color code
 */
function isValidHexColor(color) {
    return /^[0-9A-Fa-f]{6}$/.test(color);
}
/**
 * Generate random hex color
 */
function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
/**
 * Validate label name
 */
function isValidLabelName(name) {
    return name.length > 0 && name.length <= 100;
}

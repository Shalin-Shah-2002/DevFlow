"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class CategoryService {
    // ─────────────────────────────────────────────
    // Get all categories for a user with issue count
    // ─────────────────────────────────────────────
    async getCategories(userId) {
        const categories = await prisma_1.default.category.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { issues: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            issueCount: cat._count.issues,
            createdAt: cat.createdAt,
        }));
    }
    // ─────────────────────────────────────────────
    // Find category by ID (ownership check)
    // ─────────────────────────────────────────────
    async findById(id, userId) {
        return prisma_1.default.category.findFirst({
            where: { id, userId },
        });
    }
    // ─────────────────────────────────────────────
    // Find category by name (duplicate check)
    // ─────────────────────────────────────────────
    async findByName(name, userId) {
        return prisma_1.default.category.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                userId,
            },
        });
    }
    // ─────────────────────────────────────────────
    // Create a new category
    // ─────────────────────────────────────────────
    async createCategory(userId, name, color) {
        return prisma_1.default.category.create({
            data: {
                name,
                color,
                userId,
            },
        });
    }
    // ─────────────────────────────────────────────
    // Update an existing category
    // ─────────────────────────────────────────────
    async updateCategory(id, data) {
        return prisma_1.default.category.update({
            where: { id },
            data,
        });
    }
    // ─────────────────────────────────────────────
    // Delete category (cascade removes issue links)
    // ─────────────────────────────────────────────
    async deleteCategory(id) {
        // Delete all issue-category links first
        await prisma_1.default.issueCategory.deleteMany({ where: { categoryId: id } });
        return prisma_1.default.category.delete({ where: { id } });
    }
    // ─────────────────────────────────────────────
    // Verify user has access to issue
    // ─────────────────────────────────────────────
    async verifyIssueAccess(issueId, userId) {
        const issue = await prisma_1.default.issue.findFirst({
            where: {
                id: issueId,
                repository: {
                    users: { some: { userId } },
                },
            },
        });
        return !!issue;
    }
    // ─────────────────────────────────────────────
    // Verify all categoryIds belong to user
    // ─────────────────────────────────────────────
    async verifyCategories(categoryIds, userId) {
        return prisma_1.default.category.findMany({
            where: {
                id: { in: categoryIds },
                userId,
            },
        });
    }
    // ─────────────────────────────────────────────
    // Assign multiple categories to an issue
    // Uses upsert to avoid duplicate entries
    // ─────────────────────────────────────────────
    async assignCategories(issueId, categoryIds) {
        const data = categoryIds.map((categoryId) => ({
            issueId,
            categoryId,
        }));
        return prisma_1.default.issueCategory.createMany({
            data,
            skipDuplicates: true, // skip if already assigned
        });
    }
    // ─────────────────────────────────────────────
    // Check if category is assigned to issue
    // ─────────────────────────────────────────────
    async isCategoryAssigned(issueId, categoryId) {
        const record = await prisma_1.default.issueCategory.findFirst({
            where: { issueId, categoryId },
        });
        return !!record;
    }
    // ─────────────────────────────────────────────
    // Remove single category from issue
    // ─────────────────────────────────────────────
    async removeCategoryFromIssue(issueId, categoryId) {
        return prisma_1.default.issueCategory.deleteMany({
            where: { issueId, categoryId },
        });
    }
}
exports.CategoryService = CategoryService;

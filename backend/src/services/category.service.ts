import prisma from '../config/prisma';

export class CategoryService {

  // ─────────────────────────────────────────────
  // Get all categories for a user with issue count
  // ─────────────────────────────────────────────
  async getCategories(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = { userId };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { issues: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        issueCount: cat._count.issues,
        createdAt: cat.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─────────────────────────────────────────────
  // Find category by ID (ownership check)
  // ─────────────────────────────────────────────
  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  }

  // ─────────────────────────────────────────────
  // Find category by name (duplicate check)
  // ─────────────────────────────────────────────
  async findByName(name: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        userId,
      },
    });
  }

  // ─────────────────────────────────────────────
  // Create a new category
  // ─────────────────────────────────────────────
  async createCategory(userId: string, name: string, color: string) {
    return prisma.category.create({
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
  async updateCategory(id: string, data: { name?: string; color?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  // ─────────────────────────────────────────────
  // Delete category (cascade removes issue links)
  // ─────────────────────────────────────────────
  async deleteCategory(id: string) {
    // Delete all issue-category links first
    await prisma.issueCategory.deleteMany({ where: { categoryId: id } });

    return prisma.category.delete({ where: { id } });
  }

  // ─────────────────────────────────────────────
  // Verify user has access to issue
  // ─────────────────────────────────────────────
  async verifyIssueAccess(issueId: string, userId: string) {
    const issue = await prisma.issue.findFirst({
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
  async verifyCategories(categoryIds: string[], userId: string) {
    return prisma.category.findMany({
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
  async assignCategories(issueId: string, categoryIds: string[]) {
    const data = categoryIds.map((categoryId) => ({
      issueId,
      categoryId,
    }));

    return prisma.issueCategory.createMany({
      data,
      skipDuplicates: true, // skip if already assigned
    });
  }

  // ─────────────────────────────────────────────
  // Check if category is assigned to issue
  // ─────────────────────────────────────────────
  async isCategoryAssigned(issueId: string, categoryId: string) {
    const record = await prisma.issueCategory.findFirst({
      where: { issueId, categoryId },
    });
    return !!record;
  }

  // ─────────────────────────────────────────────
  // Remove single category from issue
  // ─────────────────────────────────────────────
  async removeCategoryFromIssue(issueId: string, categoryId: string) {
    return prisma.issueCategory.deleteMany({
      where: { issueId, categoryId },
    });
  }
}
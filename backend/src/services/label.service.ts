/**
 * Label Service
 * Business logic for label management
 */

import prisma from '../config/prisma';
import axios from 'axios';
import {
  Label,
  LabelWithStats,
  CreateLabelInput,
  UpdateLabelInput,
  LabelQueryParams,
  GitHubLabel,
  isValidHexColor,
  isValidLabelName,
} from '../models/label.model';

/**
 * Get all labels with optional filtering and pagination
 */
export const getLabels = async (
  userId: string,
  params: LabelQueryParams
): Promise<{ labels: LabelWithStats[]; total: number }> => {
  const {
    repositoryId,
    search,
    page = 1,
    pageSize = 50,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  // Build where clause
  const where: any = {};

  if (repositoryId) {
    where.repositoryId = repositoryId;
  } else {
    // Get all repositories the user has access to
    const userRepos = await prisma.userRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    where.repositoryId = { in: userRepos.map((ur) => ur.repositoryId) };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.label.count({ where });

  // Build order by
  const orderBy: any = {};
  if (sortBy === 'issueCount') {
    // For issue count, we'll sort in memory after fetching
    orderBy.name = sortOrder;
  } else {
    orderBy[sortBy] = sortOrder;
  }

  // Fetch labels with issue counts
  const labels = await prisma.label.findMany({
    where,
    include: {
      repository: {
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      },
      _count: {
        select: {
          issues: true,
        },
      },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Transform to LabelWithStats
  let labelsWithStats: LabelWithStats[] = labels.map((label) => ({
    id: label.id,
    githubId: label.githubId,
    name: label.name,
    color: label.color,
    description: label.description,
    repositoryId: label.repositoryId,
    createdAt: label.createdAt,
    issueCount: label._count.issues,
    repository: label.repository,
  }));

  // Sort by issue count if requested
  if (sortBy === 'issueCount') {
    labelsWithStats.sort((a, b) => {
      return sortOrder === 'asc'
        ? a.issueCount - b.issueCount
        : b.issueCount - a.issueCount;
    });
  }

  return { labels: labelsWithStats, total };
};

/**
 * Get label by ID
 */
export const getLabelById = async (
  labelId: string,
  userId: string
): Promise<LabelWithStats | null> => {
  // Check if user has access to the repository
  const label = await prisma.label.findUnique({
    where: { id: labelId },
    include: {
      repository: {
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      },
      _count: {
        select: {
          issues: true,
        },
      },
    },
  });

  if (!label) {
    return null;
  }

  // Verify user has access to this repository
  const hasAccess = await prisma.userRepository.findUnique({
    where: {
      userId_repositoryId: {
        userId,
        repositoryId: label.repositoryId,
      },
    },
  });

  if (!hasAccess) {
    return null;
  }

  return {
    id: label.id,
    githubId: label.githubId,
    name: label.name,
    color: label.color,
    description: label.description,
    repositoryId: label.repositoryId,
    createdAt: label.createdAt,
    issueCount: label._count.issues,
    repository: label.repository,
  };
};

/**
 * Create a new label
 */
export const createLabel = async (
  input: CreateLabelInput,
  userId: string
): Promise<Label> => {
  // Validate inputs
  if (!isValidLabelName(input.name)) {
    throw new Error('Label name must be between 1 and 100 characters');
  }

  if (!isValidHexColor(input.color)) {
    throw new Error('Invalid hex color code. Must be 6 characters (e.g., FF0000)');
  }

  // Check if user has access to the repository
  const hasAccess = await prisma.userRepository.findUnique({
    where: {
      userId_repositoryId: {
        userId,
        repositoryId: input.repositoryId,
      },
    },
  });

  if (!hasAccess) {
    throw new Error('Repository not found or access denied');
  }

  // Check if label with same name exists in this repository
  const existingLabel = await prisma.label.findUnique({
    where: {
      repositoryId_name: {
        repositoryId: input.repositoryId,
        name: input.name,
      },
    },
  });

  if (existingLabel) {
    throw new Error('Label with this name already exists in this repository');
  }

  // Create label
  const label = await prisma.label.create({
    data: {
      name: input.name,
      color: input.color,
      description: input.description || null,
      repositoryId: input.repositoryId,
    },
  });

  return label;
};

/**
 * Update a label
 */
export const updateLabel = async (
  labelId: string,
  input: UpdateLabelInput,
  userId: string
): Promise<Label> => {
  // Check if label exists and user has access
  const existingLabel = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!existingLabel) {
    throw new Error('Label not found');
  }

  // Check user access to repository
  const hasAccess = await prisma.userRepository.findUnique({
    where: {
      userId_repositoryId: {
        userId,
        repositoryId: existingLabel.repositoryId,
      },
    },
  });

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  // Validate inputs
  if (input.name && !isValidLabelName(input.name)) {
    throw new Error('Label name must be between 1 and 100 characters');
  }

  if (input.color && !isValidHexColor(input.color)) {
    throw new Error('Invalid hex color code. Must be 6 characters (e.g., FF0000)');
  }

  // Check if new name conflicts with existing label
  if (input.name && input.name !== existingLabel.name) {
    const conflictingLabel = await prisma.label.findUnique({
      where: {
        repositoryId_name: {
          repositoryId: existingLabel.repositoryId,
          name: input.name,
        },
      },
    });

    if (conflictingLabel) {
      throw new Error('Label with this name already exists in this repository');
    }
  }

  // Update label
  const label = await prisma.label.update({
    where: { id: labelId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.color && { color: input.color }),
      ...(input.description !== undefined && { description: input.description }),
    },
  });

  return label;
};

/**
 * Delete a label
 */
export const deleteLabel = async (
  labelId: string,
  userId: string
): Promise<void> => {
  // Check if label exists and user has access
  const existingLabel = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!existingLabel) {
    throw new Error('Label not found');
  }

  // Check user access to repository
  const hasAccess = await prisma.userRepository.findUnique({
    where: {
      userId_repositoryId: {
        userId,
        repositoryId: existingLabel.repositoryId,
      },
    },
  });

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  // Delete label (cascade will remove IssueLabel relationships)
  await prisma.label.delete({
    where: { id: labelId },
  });
};

/**
 * Sync labels from GitHub repository
 */
export const syncLabelsFromGitHub = async (
  repositoryId: string,
  userId: string
): Promise<{
  synced: number;
  created: number;
  updated: number;
  labels: Label[];
}> => {
  // Get repository and check access
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repository) {
    throw new Error('Repository not found');
  }

  const hasAccess = await prisma.userRepository.findUnique({
    where: {
      userId_repositoryId: {
        userId,
        repositoryId,
      },
    },
  });

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  // Get user's GitHub access token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true },
  });

  if (!user || !user.accessToken) {
    throw new Error('GitHub access token not found');
  }

  // Fetch labels from GitHub
  try {
    const response = await axios.get<GitHubLabel[]>(
      `https://api.github.com/repos/${repository.fullName}/labels`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const githubLabels = response.data;
    let created = 0;
    let updated = 0;
    const labels: Label[] = [];

    // Sync each label
    for (const ghLabel of githubLabels) {
      const existingLabel = await prisma.label.findUnique({
        where: { githubId: BigInt(ghLabel.id) },
      });

      if (existingLabel) {
        // Update existing label
        const label = await prisma.label.update({
          where: { id: existingLabel.id },
          data: {
            name: ghLabel.name,
            color: ghLabel.color,
            description: ghLabel.description,
          },
        });
        labels.push(label);
        updated++;
      } else {
        // Create new label
        try {
          const label = await prisma.label.create({
            data: {
              githubId: BigInt(ghLabel.id),
              name: ghLabel.name,
              color: ghLabel.color,
              description: ghLabel.description,
              repositoryId,
            },
          });
          labels.push(label);
          created++;
        } catch (error: any) {
          // Handle unique constraint violation (label name conflict)
          if (error.code === 'P2002') {
            // Try updating by repository and name
            const label = await prisma.label.update({
              where: {
                repositoryId_name: {
                  repositoryId,
                  name: ghLabel.name,
                },
              },
              data: {
                githubId: BigInt(ghLabel.id),
                color: ghLabel.color,
                description: ghLabel.description,
              },
            });
            labels.push(label);
            updated++;
          } else {
            throw error;
          }
        }
      }
    }

    // Update repository lastSyncedAt
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { lastSyncedAt: new Date() },
    });

    return {
      synced: githubLabels.length,
      created,
      updated,
      labels,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Repository not found on GitHub');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied to GitHub repository');
    }
    throw new Error(`Failed to sync labels from GitHub: ${error.message}`);
  }
};

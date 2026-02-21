/**
 * Label Model
 * TypeScript interfaces and types for Label management
 */

// ============= Database Models =============

export interface Label {
  id: string;
  githubId: bigint | null;
  name: string;
  color: string; // Hex color code
  description: string | null;
  repositoryId: string;
  createdAt: Date;
}

export interface LabelWithRepository extends Label {
  repository: {
    id: string;
    name: string;
    fullName: string;
  };
}

export interface LabelWithStats extends Label {
  issueCount: number;
  repository?: {
    id: string;
    name: string;
    fullName: string;
  };
}

// ============= Request DTOs =============

export interface CreateLabelInput {
  name: string;
  color: string;
  description?: string;
  repositoryId: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  description?: string;
}

export interface SyncLabelsInput {
  repositoryId: string;
  force?: boolean; // Force re-sync even if recently synced
}

// ============= Response DTOs =============

export interface LabelResponse {
  success: boolean;
  label: Label;
}

export interface LabelsListResponse {
  success: boolean;
  labels: LabelWithStats[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface LabelSyncResponse {
  success: boolean;
  message: string;
  synced: number;
  created: number;
  updated: number;
  deleted?: number;
  labels: Label[];
}

export interface DeleteLabelResponse {
  success: boolean;
  message: string;
}

// ============= GitHub API Types =============

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

// ============= Query Parameters =============

export interface LabelQueryParams {
  repositoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'issueCount';
  sortOrder?: 'asc' | 'desc';
}

// ============= Helper Functions =============

/**
 * Convert Prisma Label to LabelResponse
 */
export function toLabelResponse(label: any): Label {
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
export function isValidHexColor(color: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Generate random hex color
 */
export function generateRandomColor(): string {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Validate label name
 */
export function isValidLabelName(name: string): boolean {
  return name.length > 0 && name.length <= 100;
}

import { User as PrismaUser } from '@prisma/client';

/**
 * User model - Represents an authenticated user in the system
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  githubId: bigint;
  githubLogin: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public user profile - Safe to expose to clients
 * Excludes sensitive fields like tokens
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  githubLogin: string;
  githubId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data stored in JWT token
 */
export interface JWTPayload {
  id: string;
  email: string;
  githubId: number;
  iat?: number;  // Issued at
  exp?: number;  // Expiry
}

/**
 * GitHub user data from OAuth
 */
export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url: string;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  blog?: string | null;
  html_url: string;
}

/**
 * GitHub OAuth token response
 */
export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * User creation input
 */
export interface CreateUserInput {
  githubId: number;
  email: string;
  name: string;
  avatar: string;
  githubLogin: string;
  accessToken: string;
  tokenExpiry: Date;
}

/**
 * User update input
 */
export interface UpdateUserInput {
  email?: string;
  name?: string;
  avatar?: string;
  githubLogin?: string;
  accessToken?: string;
  tokenExpiry?: Date;
}

/**
 * Convert Prisma User to UserProfile (removes sensitive data)
 */
export function toUserProfile(user: PrismaUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    githubLogin: user.githubLogin,
    githubId: Number(user.githubId),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Authentication request user (attached by middleware)
 */
export interface AuthUser {
  id: string;
  email: string;
  githubId: bigint;
  accessToken: string;
}

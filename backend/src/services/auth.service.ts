import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { 
  GitHubUser, 
  GitHubTokenResponse, 
  JWTPayload,
  UserProfile,
  toUserProfile 
} from '../models';

export class AuthService {
  /**
   * Generate GitHub OAuth URL
   */
  static getGitHubAuthUrl(): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    const scope = 'user:email,repo,read:org';

    if (!clientId || !redirectUri) {
      throw new Error('GitHub OAuth credentials not configured');
    }

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  /**
   * Exchange GitHub OAuth code for access token
   */
  static async getGitHubAccessToken(code: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured');
    }

    try {
      const response = await axios.post<GitHubTokenResponse>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.data.access_token) {
        throw new Error('Failed to get access token from GitHub');
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting GitHub access token:', error);
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  /**
   * Get GitHub user profile
   */
  static async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get<GitHubUser>('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      // If email is not public, fetch from emails endpoint
      if (!response.data.email) {
        const emailsResponse = await axios.get<Array<{ email: string; primary: boolean; verified: boolean }>>(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        const primaryEmail = emailsResponse.data.find((email) => email.primary && email.verified);
        if (primaryEmail) {
          response.data.email = primaryEmail.email;
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error getting GitHub user:', error);
      throw new Error('Failed to fetch user profile from GitHub');
    }
  }

  /**
   * Create or update user in database
   */
  static async createOrUpdateUser(githubUser: GitHubUser, accessToken: string) {
    try {
      // Calculate token expiry (GitHub tokens don't expire, but we'll set a reasonable date)
      const tokenExpiry = new Date();
      tokenExpiry.setFullYear(tokenExpiry.getFullYear() + 1); // 1 year from now

      // Convert GitHub user ID to BigInt for Prisma
      const githubIdBigInt = BigInt(githubUser.id);

      const user = await prisma.user.upsert({
        where: { githubId: githubIdBigInt },
        update: {
          email: githubUser.email,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
          githubLogin: githubUser.login,
          accessToken: accessToken, // In production, encrypt this
          tokenExpiry: tokenExpiry,
        },
        create: {
          githubId: githubIdBigInt,
          email: githubUser.email,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
          githubLogin: githubUser.login,
          accessToken: accessToken, // In production, encrypt this
          tokenExpiry: tokenExpiry,
        },
      });

      return user;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Generate JWT token
   */
  static generateJWT(userId: string, email: string, githubId: bigint): string {
    const jwtSecret = process.env.JWT_SECRET || '';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const payload = {
      id: userId,
      email,
      githubId: Number(githubId),
    };

    try {
      return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as any);
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verify JWT token
   */
  static verifyJWT(token: string): { id: string; email: string; githubId: number } {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    return jwt.verify(token, jwtSecret) as { id: string; email: string; githubId: number };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return toUserProfile(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }
}

"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
class AuthService {
    /**
     * Generate GitHub OAuth URL
     */
    static getGitHubAuthUrl() {
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
    static async getGitHubAccessToken(code) {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error('GitHub OAuth credentials not configured');
        }
        try {
            const response = await axios_1.default.post('https://github.com/login/oauth/access_token', {
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.data.access_token) {
                throw new Error('Failed to get access token from GitHub');
            }
            return response.data.access_token;
        }
        catch (error) {
            console.error('Error getting GitHub access token:', error);
            throw new Error('Failed to authenticate with GitHub');
        }
    }
    /**
     * Get GitHub user profile
     */
    static async getGitHubUser(accessToken) {
        try {
            const response = await axios_1.default.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            // If email is not public, fetch from emails endpoint
            if (!response.data.email) {
                const emailsResponse = await axios_1.default.get('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                });
                const primaryEmail = emailsResponse.data.find((email) => email.primary && email.verified);
                if (primaryEmail) {
                    response.data.email = primaryEmail.email;
                }
            }
            return response.data;
        }
        catch (error) {
            console.error('Error getting GitHub user:', error);
            throw new Error('Failed to fetch user profile from GitHub');
        }
    }
    /**
     * Create or update user in database
     */
    static async createOrUpdateUser(githubUser, accessToken) {
        try {
            // Calculate token expiry (GitHub tokens don't expire, but we'll set a reasonable date)
            const tokenExpiry = new Date();
            tokenExpiry.setFullYear(tokenExpiry.getFullYear() + 1); // 1 year from now
            const user = await prisma_1.default.user.upsert({
                where: { githubId: githubUser.id },
                update: {
                    email: githubUser.email,
                    name: githubUser.name,
                    avatar: githubUser.avatar_url,
                    githubLogin: githubUser.login,
                    accessToken: accessToken, // In production, encrypt this
                    tokenExpiry: tokenExpiry,
                },
                create: {
                    githubId: githubUser.id,
                    email: githubUser.email,
                    name: githubUser.name,
                    avatar: githubUser.avatar_url,
                    githubLogin: githubUser.login,
                    accessToken: accessToken, // In production, encrypt this
                    tokenExpiry: tokenExpiry,
                },
            });
            return user;
        }
        catch (error) {
            console.error('Error creating/updating user:', error);
            throw new Error('Failed to create or update user');
        }
    }
    /**
     * Generate JWT token
     */
    static generateJWT(userId, email, githubId) {
        const jwtSecret = process.env.JWT_SECRET || '';
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        const payload = {
            id: userId,
            email,
            githubId,
        };
        try {
            return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
        }
        catch (error) {
            throw new Error('Failed to generate JWT token');
        }
    }
    /**
     * Verify JWT token
     */
    static verifyJWT(token) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        return jwt.verify(token, jwtSecret);
    }
    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    githubLogin: true,
                    githubId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return user;
        }
        catch (error) {
            console.error('Error getting user by ID:', error);
            throw new Error('Failed to fetch user');
        }
    }
}
exports.AuthService = AuthService;

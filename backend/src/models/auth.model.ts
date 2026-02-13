/**
 * Authentication models and types
 */

/**
 * GitHub OAuth authorization response
 */
export interface GitHubAuthResponse {
  success: boolean;
  redirectUrl: string;
}

/**
 * Login response with JWT token
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    githubLogin: string;
  };
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  success: boolean;
  token: string;
  expiresIn: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Current user response
 */
export interface CurrentUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    githubLogin: string;
    githubId: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

/**
 * OAuth callback query parameters
 */
export interface OAuthCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

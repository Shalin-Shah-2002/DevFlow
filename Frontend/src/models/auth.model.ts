export type AuthUser = {
  id: number;
  githubId: string;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type GithubInitResponse = {
  success: boolean;
  redirectUrl?: string;
  data?: {
    redirectUrl: string;
  };
  message?: string;
};

export type BackendAuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  githubLogin: string;
  githubId: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthMeResponse = {
  success: boolean;
  user?: BackendAuthUser;
  data?: AuthUser;
  message?: string;
};

export type AuthRefreshResponse = {
  success: boolean;
  token?: string;
  data?: {
    token: string;
  };
  message?: string;
};

export const initialAuthState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

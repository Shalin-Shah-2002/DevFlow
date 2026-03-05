import type {
  AuthMeResponse,
  AuthRefreshResponse,
  AuthUser,
  BackendAuthUser,
  GithubInitResponse
} from '../models/auth.model';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (window.location.hostname === 'devfloww.tech' ? 'https://api.devfloww.tech/api' : 'http://localhost:3001/api');

const requestJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !data) {
    throw new Error(`Request failed (${response.status})`);
  }

  return data;
};

const extractRedirectUrl = (payload: GithubInitResponse): string | null => {
  if (payload.redirectUrl) {
    return payload.redirectUrl;
  }

  if (payload.data?.redirectUrl) {
    return payload.data.redirectUrl;
  }

  return null;
};

const mapBackendUser = (user: BackendAuthUser): AuthUser => {
  return {
    id: Number(user.id),
    githubId: String(user.githubId),
    login: user.githubLogin,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar
  };
};

export const initiateGithubAuth = async (): Promise<string> => {
  const authPath = `${API_BASE_URL}/auth/github`;

  try {
    const postResult = await requestJson<GithubInitResponse>(authPath, { method: 'POST' });
    const postRedirectUrl = extractRedirectUrl(postResult);

    if (postResult.success && postRedirectUrl) {
      return postRedirectUrl;
    }
  } catch {
    // fallback to GET for backend implementations where docs and route method differ
  }

  const getUrl = `${authPath}?_ts=${Date.now()}`;
  const getResult = await requestJson<GithubInitResponse>(getUrl, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  });
  const getRedirectUrl = extractRedirectUrl(getResult);

  if (!getResult.success || !getRedirectUrl) {
    throw new Error(getResult.message || 'Could not start GitHub login');
  }

  return getRedirectUrl;
};

export const getMyProfile = async (token: string): Promise<AuthUser> => {
  const response = await requestJson<AuthMeResponse>(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.success && response.user) {
    return mapBackendUser(response.user);
  }

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Could not fetch profile');
  }

  return response.data;
};

export const refreshToken = async (refreshTokenValue: string): Promise<string> => {
  const response = await requestJson<AuthRefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshTokenValue}`
    }
  });

  const nextToken = response.token || response.data?.token;

  if (!response.success || !nextToken) {
    throw new Error(response.message || 'Could not refresh token');
  }

  return nextToken;
};

export const logoutRequest = async (token: string): Promise<void> => {
  await requestJson(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

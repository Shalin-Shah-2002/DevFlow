import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { getMyProfile, initiateGithubAuth, logoutRequest, refreshToken } from '../../controllers/auth.controller';
import { initialAuthState, type AuthState } from '../../models/auth.model';
import { AuthContext } from './AuthContext';

const AUTH_TOKEN_STORAGE_KEY = 'devflow.auth.token';
const AUTH_USER_STORAGE_KEY = 'devflow.auth.user';

const loadStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const saveStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // no-op
  }
};

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthState['user'];
  } catch {
    return null;
  }
};

const saveStoredUser = (user: AuthState['user']) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  } catch {
    // no-op
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    ...initialAuthState,
    isLoading: true,
    token: loadStoredToken(),
    user: loadStoredUser()
  });

  useEffect(() => {
    const token = loadStoredToken();

    if (!token) {
      setState((prev) => ({
        ...prev,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      token,
      isLoading: true,
      isAuthenticated: Boolean(prev.user)
    }));

    getMyProfile(token)
      .then((user) => {
        setState({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        saveStoredToken(token);
        saveStoredUser(user);
      })
      .catch(() => {
        saveStoredToken(null);
        saveStoredUser(null);
        setState({
          ...initialAuthState,
          isLoading: false
        });
      });
  }, []);

  useEffect(() => {
    if (!state.token || !state.isAuthenticated) {
      return;
    }

    const refreshIntervalMs = 6 * 24 * 60 * 60 * 1000;

    const timer = window.setInterval(() => {
      refreshToken(state.token!)
        .then((nextToken) => {
          saveStoredToken(nextToken);
          setState((prev) => ({
            ...prev,
            token: nextToken,
            isAuthenticated: true
          }));
        })
        .catch(() => {
          saveStoredToken(null);
          saveStoredUser(null);
          setState(initialAuthState);
        });
    }, refreshIntervalMs);

    return () => window.clearInterval(timer);
  }, [state.token, state.isAuthenticated]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const startGithubLogin = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const redirectUrl = await initiateGithubAuth();
      window.location.assign(redirectUrl);
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Unable to start GitHub login. Please try again.'
      }));
    }
  }, []);

  const completeLogin = useCallback(async (token: string) => {
    setState((prev) => ({ ...prev, token, isLoading: true, error: null }));

    try {
      const user = await getMyProfile(token);
      saveStoredToken(token);
      saveStoredUser(user);
      setState({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch {
      saveStoredToken(null);
      saveStoredUser(null);
      setState({
        ...initialAuthState,
        error: 'Login completed, but profile could not be loaded.'
      });
      throw new Error('profile-load-failed');
    }
  }, []);

  const logout = useCallback(async () => {
    const token = state.token;

    if (!token) {
      setState(initialAuthState);
      return;
    }

    try {
      await logoutRequest(token);
    } finally {
      saveStoredToken(null);
      saveStoredUser(null);
      setState(initialAuthState);
    }
  }, [state.token]);

  const value = useMemo(
    () => ({
      state,
      startGithubLogin,
      completeLogin,
      logout,
      clearError
    }),
    [state, startGithubLogin, completeLogin, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

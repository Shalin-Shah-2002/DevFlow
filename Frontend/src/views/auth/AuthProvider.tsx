import {
  useCallback,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { getMyProfile, initiateGithubAuth, logoutRequest } from '../../controllers/auth.controller';
import { initialAuthState, type AuthState } from '../../models/auth.model';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialAuthState);

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
      setState({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch {
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

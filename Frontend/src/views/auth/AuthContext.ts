import { createContext } from 'react';
import type { AuthState } from '../../models/auth.model';

export type AuthContextValue = {
  state: AuthState;
  startGithubLogin: () => Promise<void>;
  completeLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

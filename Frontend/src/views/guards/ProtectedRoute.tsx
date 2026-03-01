import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <div className="auth-status">Checking your session...</div>;
  }

  if (!state.isAuthenticated || !state.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

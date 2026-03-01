import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';

export const AuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/auth/error?message=Token%20missing%20from%20callback', { replace: true });
      return;
    }

    completeLogin(token)
      .then(() => {
        navigate('/app', { replace: true });
      })
      .catch(() => {
        navigate('/auth/error?message=Could%20not%20complete%20login', { replace: true });
      });
  }, [searchParams, navigate, completeLogin]);

  return <div className="auth-status">Completing your login...</div>;
};

import { Link, useSearchParams } from 'react-router-dom';

export const AuthErrorPage = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed. Please try again.';

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Authentication error</h1>
        <p>{message}</p>
        <Link to="/login" className="btn btn-primary login-button">
          Back to Login
        </Link>
      </section>
    </main>
  );
};

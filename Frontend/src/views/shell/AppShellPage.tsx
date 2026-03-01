import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const AppShellPage = () => {
  const { state, logout } = useAuth();

  return (
    <main className="app-shell">
      <header className="app-shell-header">
        <div>
          <h1>DevFlow Workspace</h1>
          <p>Welcome back, {state.user?.name || state.user?.login || 'Engineer'}.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void logout()}>
          Sign Out
        </button>
      </header>

      <section className="app-shell-body">
        <h2>You are authenticated</h2>
        <p>
          Login is connected to real auth APIs. Use this protected shell as the next step for your dashboard.
        </p>
        <Link to="/" className="btn btn-primary btn-sm">
          Go to Landing
        </Link>
      </section>
    </main>
  );
};

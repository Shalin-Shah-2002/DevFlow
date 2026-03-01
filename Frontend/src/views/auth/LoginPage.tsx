import { getLandingPageData } from '../../controllers/landing.controller';
import { Link } from 'react-router-dom';
import { useAuth } from './useAuth';

const brand = getLandingPageData().nav;

export const LoginPage = () => {
  const { state, startGithubLogin, clearError } = useAuth();

  return (
    <main className="login-page login-variant-1-page">
      <section className="login-v1-shell">
        <aside className="login-v1-panel">
          <div className="logo-wrap login-v1-logo-wrap">
            <img src={brand.logoIcon} alt="DevFlow logo" className="logo-icon" />
            <span className="logo-text">{brand.logoText}</span>
          </div>

          <p className="login-v1-badge">Login Variant 1</p>
          <h1>Welcome back to DevFlow</h1>
          <p className="login-v1-copy">
            Track issues, collaborate faster, and keep your engineering workflow focused.
          </p>

          <ul className="login-v1-points">
            <li>Secure GitHub OAuth sign-in</li>
            <li>Unified repo and issue dashboard</li>
            <li>Fast setup in under 2 minutes</li>
          </ul>
        </aside>

        <div className="login-card login-v1-card">
          <h2>Sign in</h2>
          <p className="login-v1-subtitle">Use your GitHub account to continue.</p>

          <button
            type="button"
            className="btn btn-primary login-button"
            onClick={() => void startGithubLogin()}
            disabled={state.isLoading}
          >
            {state.isLoading ? 'Redirecting...' : 'Continue with GitHub'}
          </button>

          {state.error && (
            <div className="login-error">
              <span>{state.error}</span>
              <button type="button" onClick={clearError}>
                Dismiss
              </button>
            </div>
          )}

          <p className="login-v1-footer-text">
            Need to check homepage first? <Link to="/">Back to Landing</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

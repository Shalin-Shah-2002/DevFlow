import { getLandingPageData } from '../../controllers/landing.controller';
import { Link } from 'react-router-dom';
import { useAuth } from './useAuth';

const brand = getLandingPageData().nav;

export const LoginPage = () => {
  const { state, startGithubLogin, clearError } = useAuth();

  return (
    <main className="login-page login-variant-2-page">
      <section className="login-v2-shell">
        <aside className="login-v2-left">
          <div className="login-v2-glow login-v2-glow-large" />
          <div className="login-v2-glow login-v2-glow-small" />

          <div className="login-v2-brand">
            <span className="login-v2-brand-icon">
              <img src={brand.logoIcon} alt="DevFlow logo" className="logo-icon" />
            </span>
            <span className="logo-text">{brand.logoText}</span>
          </div>

          <div className="login-v2-visual" aria-hidden="true">
            <div className="login-v2-line" />
            <div className="login-v2-line" />
            <div className="login-v2-line login-v2-line-short" />
            <span className="login-v2-point login-v2-point-a" />
            <span className="login-v2-point login-v2-point-b" />
            <span className="login-v2-point login-v2-point-c" />
            <div className="login-v2-chip login-v2-chip-left">main</div>
            <div className="login-v2-chip login-v2-chip-right">v2.4.0</div>
          </div>

          <p className="login-v2-tagline">Streamline your GitHub issue workflow.</p>
        </aside>

        <section className="login-v2-right">
          <div className="login-v2-card">
            <div className="login-v2-heading">
              <h1>Welcome back</h1>
              <p>Sign in with your GitHub account to continue</p>
            </div>

            <button
              type="button"
              className="btn login-v2-button"
              onClick={() => void startGithubLogin()}
              disabled={state.isLoading}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.22.72-.5 0-.24-.01-1.04-.01-1.88-2.65.49-3.34-.65-3.56-1.25-.12-.31-.63-1.25-1.08-1.5-.37-.2-.9-.7-.01-.72.84-.01 1.44.77 1.64 1.08.96 1.61 2.5 1.16 3.11.88.1-.7.38-1.16.68-1.43-2.35-.26-4.81-1.18-4.81-5.22 0-1.15.41-2.1 1.08-2.84-.11-.26-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a9.84 9.84 0 0 1 5.26 0c2-1.37 2.88-1.08 2.88-1.08.58 1.45.22 2.53.11 2.79.67.74 1.08 1.68 1.08 2.84 0 4.05-2.48 4.95-4.83 5.22.39.33.73.96.73 1.95 0 1.41-.01 2.54-.01 2.89 0 .29.19.62.72.5A10.5 10.5 0 0 0 12 1.5Z"
                />
              </svg>
              <span>{state.isLoading ? 'Redirecting...' : 'Continue with GitHub'}</span>
            </button>

            {state.error && (
              <div className="login-error">
                <span>{state.error}</span>
                <button type="button" onClick={clearError}>
                  Dismiss
                </button>
              </div>
            )}

            <div className="login-v2-separator" />

            <div className="login-v2-security">
              <div className="login-v2-security-head">
                <span className="login-v2-lock" aria-hidden="true">
                  🔒
                </span>
                <strong>Secure Access</strong>
              </div>
              <p>OAuth 2.0 Encryption · No passwords stored · Encrypted Session</p>
            </div>

            <p className="login-v2-home-link">
              Need homepage? <Link to="/">Back to Landing</Link>
            </p>
          </div>

          <footer className="login-v2-footer">
            <div className="login-v2-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Support</a>
            </div>
            <div className="login-v2-status">
              <span className="login-v2-status-dot" />
              <span>System Operational</span>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
};

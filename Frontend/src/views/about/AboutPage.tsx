import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container about-shell">
          <p className="about-kicker">About DevFlow</p>
          <h1>
            One dashboard to tame issue chaos,
            <span>without taming your personality.</span>
          </h1>
          <p className="about-summary">
            DevFlow is built for teams that want signal over noise. Connect repositories, track issue flow,
            and move from backlog panic to shipping rhythm.
          </p>
          <div className="about-badges" aria-label="Highlights">
            <span>Signal over noise</span>
            <span>Built for GitHub teams</span>
            <span>Workflow clarity first</span>
          </div>

          <div className="about-hero-actions">
            <Link className="btn btn-primary" to="/login">
              Connect GitHub
            </Link>
            <Link className="btn btn-secondary" to="/">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="about-content-section">
        <div className="container about-grid">
          <article className="about-card">
            <h2>DevFlow Information</h2>
            <p>
              DevFlow helps teams organize GitHub work with clear views, smarter filtering, analytics, and
              faster collaboration loops.
            </p>
            <ul>
              <li>Unified issue visibility across repositories</li>
              <li>Track velocity, bottlenecks, and workflow health</li>
              <li>Save focused views for different team roles</li>
              <li>Spend less time searching and more time shipping</li>
            </ul>
            <p className="about-funny-line">
              Raise an issue and it shows up in DevFlow like a productivity side quest - no XP points, but
              way fewer blockers.
            </p>
          </article>

          <article className="about-card">
            <h2>Developer Info</h2>
            <p>
              Built by <strong>Shalin Shah</strong>.
            </p>
            <ul>
              <li>Bachelor of Technology in Computer Science</li>
              <li>CGPA: 7.28</li>
              <li>Jun 2023 - Aug 2026</li>
            </ul>
            <div className="developer-highlights" aria-label="Developer highlights">
              <div>
                <strong>2026</strong>
                <span>Graduation timeline</span>
              </div>
              <div>
                <strong>CS</strong>
                <span>Core engineering focus</span>
              </div>
              <div>
                <strong>Open</strong>
                <span>To contributions and feedback</span>
              </div>
            </div>
            <div className="about-links">
              <a href="https://www.linkedin.com/in/shalin-shah-379193247/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="https://github.com/Shalin-Shah-2002" target="_blank" rel="noreferrer">
                GitHub Profile
              </a>
            </div>
          </article>

          <article className="about-card about-card-wide">
            <h2>Contribute and Report</h2>
            <p>If you want to contribute, jump in here:</p>
            <a href="https://github.com/Shalin-Shah-2002/DevFlow" target="_blank" rel="noreferrer">
              github.com/Shalin-Shah-2002/DevFlow
            </a>
            <p>If you hit any issue, submit it here:</p>
            <a
              href="https://github.com/Shalin-Shah-2002/DevFlow/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              github.com/Shalin-Shah-2002/DevFlow/issues/new
            </a>
          </article>
        </div>
      </section>
    </main>
  );
};

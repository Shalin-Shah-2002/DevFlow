import type { LandingPageData } from '../../models/landing.model';
import { Link } from 'react-router-dom';

type NavbarProps = {
  nav: LandingPageData['nav'];
};

export const Navbar = ({ nav }: NavbarProps) => {
  return (
    <header className="nav-wrapper">
      <div className="container nav-bar">
        <div className="logo-wrap">
          <img src={nav.logoIcon} alt="DevFlow logo" className="logo-icon" />
          <span className="logo-text">{nav.logoText}</span>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          {nav.items.map((item) => (
            <a key={item.label} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-ghost" to="/login">
            {nav.signInText}
          </Link>
          <Link className="btn btn-primary btn-sm" to="/login">
            {nav.ctaText}
          </Link>
        </div>
      </div>
    </header>
  );
};

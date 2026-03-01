import { Link, useLocation } from 'react-router-dom';
import { getLandingPageData } from '../../../controllers/landing.controller';
import type { AuthState } from '../../../models/auth.model';

const brand = getLandingPageData().nav;

type SidebarProps = {
  unreadCount?: number;
  authState: AuthState;
};

const isActive = (pathname: string, target: string): boolean => {
  if (target === '/app') {
    return pathname === '/app';
  }

  return pathname.startsWith(target);
};

export const DashboardSidebar = ({ unreadCount = 0, authState }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="dv3-sidebar">
      <div className="dv3-brand">
        <div className="dv3-brand-icon-wrap">
          <img src={brand.logoIcon} alt="DevFlow logo" className="dv3-brand-icon" />
        </div>
        <div>
          <h1>DevFlow</h1>
          <p>Issue Management</p>
        </div>
      </div>

      <nav className="dv3-nav">
        <Link className={isActive(location.pathname, '/app') ? 'active' : ''} to="/app">
          Dashboard
        </Link>
        <Link className={isActive(location.pathname, '/app/issues') ? 'active' : ''} to="/app/issues">
          Issues
        </Link>
        <Link className={isActive(location.pathname, '/app/repositories') ? 'active' : ''} to="/app/repositories">
          Repos
        </Link>
        <Link className={isActive(location.pathname, '/app/labels') ? 'active' : ''} to="/app/labels">
          Labels
        </Link>
        <Link className={isActive(location.pathname, '/app/categories') ? 'active' : ''} to="/app/categories">
          Categories
        </Link>

        <span className="dv3-nav-title">Insights</span>
        <Link className={isActive(location.pathname, '/app/views') ? 'active' : ''} to="/app/views">
          Saved Views
        </Link>
        <Link className={isActive(location.pathname, '/app/analytics') ? 'active' : ''} to="/app/analytics">
          Analytics
        </Link>
        <Link className={isActive(location.pathname, '/app/notifications') ? 'active notify-link' : 'notify-link'} to="/app/notifications">
          Notifications
          <span>{unreadCount}</span>
        </Link>
        <Link className={isActive(location.pathname, '/app/ops') ? 'active' : ''} to="/app/ops">
          Ops Tools
        </Link>
      </nav>

      <div className="dv3-profile">
        <div className="dv3-avatar">{(authState.user?.name || authState.user?.login || 'U')[0]}</div>
        <div>
          <strong>{authState.user?.name || authState.user?.login || 'Alex Johnson'}</strong>
          <small>Lead Developer</small>
        </div>
      </div>
    </aside>
  );
};

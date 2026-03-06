import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getLandingPageData } from '../../../controllers/landing.controller';
import { getUnreadCount } from '../../../controllers/notifications.controller';
import type { AuthState } from '../../../models/auth.model';
import { useAuth } from '../../auth/useAuth';

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
  const { logout } = useAuth();
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!authState.token) {
      return;
    }

    const syncUnread = () => {
      getUnreadCount(authState.token!)
        .then((count) => setLiveUnreadCount(count))
        .catch(() => setLiveUnreadCount(unreadCount));
    };

    syncUnread();
    const timer = window.setInterval(syncUnread, 30_000);

    return () => window.clearInterval(timer);
  }, [authState.token, unreadCount]);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  const closeDrawer = () => setIsMobileDrawerOpen(false);
  const openDrawer = () => setIsMobileDrawerOpen(true);

  return (
    <>
      <button
        type="button"
        className="dv3-mobile-menu-btn"
        onClick={openDrawer}
        aria-label="Open navigation menu"
        aria-expanded={isMobileDrawerOpen}
      >
        Menu
      </button>

      {isMobileDrawerOpen && (
        <button
          type="button"
          className="dv3-drawer-backdrop"
          aria-label="Close navigation menu"
          onClick={closeDrawer}
        />
      )}

      <aside className={`dv3-sidebar ${isMobileDrawerOpen ? 'mobile-open' : ''}`}>
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
        <Link className={isActive(location.pathname, '/app') ? 'active' : ''} to="/app" onClick={closeDrawer}>
          Dashboard
        </Link>
        <Link className={isActive(location.pathname, '/app/issues') ? 'active' : ''} to="/app/issues" onClick={closeDrawer}>
          Issues
        </Link>
        <Link className={isActive(location.pathname, '/app/repositories') ? 'active' : ''} to="/app/repositories" onClick={closeDrawer}>
          Repos
        </Link>
        <Link className={isActive(location.pathname, '/app/taxonomy') ? 'active' : ''} to="/app/taxonomy" onClick={closeDrawer}>
          Taxonomy
        </Link>
        <Link className={isActive(location.pathname, '/app/milestones') ? 'active' : ''} to="/app/milestones" onClick={closeDrawer}>
          Milestones
        </Link>

        <span className="dv3-nav-title">Insights</span>
        <Link className={isActive(location.pathname, '/app/views') ? 'active' : ''} to="/app/views" onClick={closeDrawer}>
          Saved Views
        </Link>
        <Link className={isActive(location.pathname, '/app/analytics') ? 'active' : ''} to="/app/analytics" onClick={closeDrawer}>
          Analytics
        </Link>
        <Link
          className={isActive(location.pathname, '/app/notifications') ? 'active notify-link' : 'notify-link'}
          to="/app/notifications"
          onClick={closeDrawer}
        >
          Notifications
          <span>{liveUnreadCount}</span>
        </Link>
        <Link className={isActive(location.pathname, '/app/ops') ? 'active' : ''} to="/app/ops" onClick={closeDrawer}>
          Ops Tools
        </Link>
        <Link className={isActive(location.pathname, '/app/activity') ? 'active' : ''} to="/app/activity" onClick={closeDrawer}>
          Activity Log
        </Link>
        <Link className={isActive(location.pathname, '/app/settings') ? 'active' : ''} to="/app/settings" onClick={closeDrawer}>
          Settings
        </Link>
      </nav>

      <div className="dv3-profile">
        <div className="dv3-avatar">{(authState.user?.name || authState.user?.login || 'U')[0]}</div>
        <div className="dv3-profile-content">
          <strong>{authState.user?.name || authState.user?.login || 'Alex Johnson'}</strong>
          <small>Lead Developer</small>
          <button
            type="button"
            className="dv3-logout-btn"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

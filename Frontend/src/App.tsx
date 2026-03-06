import { getLandingPageData } from './controllers/landing.controller';
import { LandingPageView } from './views/LandingPageView';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './views/auth/LoginPage';
import { AuthSuccessPage } from './views/auth/AuthSuccessPage';
import { AuthErrorPage } from './views/auth/AuthErrorPage';
import { ProtectedRoute } from './views/guards/ProtectedRoute';
import { PublicOnlyRoute } from './views/guards/PublicOnlyRoute';
import { DashboardVariant3Page } from './views/dashboard/DashboardVariant3Page';
import { IssuesListPage } from './views/issues/IssuesListPage';
import { IssueDetailPage } from './views/issues/IssueDetailPage';
import { RepositoriesOverviewPage } from './views/repositories/RepositoriesOverviewPage';
import { TaxonomyPage } from './views/taxonomy/TaxonomyPage';
import { NotificationsPage } from './views/notifications/NotificationsPage';
import { SavedViewsPage } from './views/views/SavedViewsPage';
import { AnalyticsPage } from './views/analytics/AnalyticsPage';
import { OpsToolsPage } from './views/ops/OpsToolsPage';
import { MilestonesPage } from './views/milestones/MilestonesPage';
import { ActivityLogPage } from './views/activity/ActivityLogPage';
import { SettingsProfilePage } from './views/settings/SettingsProfilePage';
import { AboutPage } from './views/about/AboutPage';
import './styles/landing.css';
import './styles/auth.css';
import './styles/dashboard.css';

function App() {
  const pageData = getLandingPageData();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LandingPageView data={pageData} />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/auth/success" element={<AuthSuccessPage />} />
      <Route path="/auth/error" element={<AuthErrorPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardVariant3Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/issues"
        element={
          <ProtectedRoute>
            <IssuesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/issues/:issueId"
        element={
          <ProtectedRoute>
            <IssueDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/repositories"
        element={
          <ProtectedRoute>
            <RepositoriesOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/taxonomy"
        element={
          <ProtectedRoute>
            <TaxonomyPage />
          </ProtectedRoute>
        }
      />
      <Route path="/app/labels" element={<Navigate to="/app/taxonomy" replace />} />
      <Route path="/app/categories" element={<Navigate to="/app/taxonomy" replace />} />
      <Route
        path="/app/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/views"
        element={
          <ProtectedRoute>
            <SavedViewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/ops"
        element={
          <ProtectedRoute>
            <OpsToolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/milestones"
        element={
          <ProtectedRoute>
            <MilestonesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/activity"
        element={
          <ProtectedRoute>
            <ActivityLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <SettingsProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App

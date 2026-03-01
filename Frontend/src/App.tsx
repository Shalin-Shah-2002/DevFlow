import { getLandingPageData } from './controllers/landing.controller';
import { LandingPageView } from './views/LandingPageView';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './views/auth/LoginPage';
import { AuthSuccessPage } from './views/auth/AuthSuccessPage';
import { AuthErrorPage } from './views/auth/AuthErrorPage';
import { ProtectedRoute } from './views/guards/ProtectedRoute';
import { DashboardVariant3Page } from './views/dashboard/DashboardVariant3Page';
import { IssuesListPage } from './views/issues/IssuesListPage';
import { IssueDetailPage } from './views/issues/IssueDetailPage';
import { RepositoriesOverviewPage } from './views/repositories/RepositoriesOverviewPage';
import { LabelsManagementPage } from './views/labels/LabelsManagementPage';
import { CategoriesManagementPage } from './views/categories/CategoriesManagementPage';
import './styles/landing.css';
import './styles/auth.css';
import './styles/dashboard.css';

function App() {
  const pageData = getLandingPageData();

  return (
    <Routes>
      <Route path="/" element={<LandingPageView data={pageData} />} />
      <Route path="/login" element={<LoginPage />} />
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
        path="/app/labels"
        element={
          <ProtectedRoute>
            <LabelsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/categories"
        element={
          <ProtectedRoute>
            <CategoriesManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App

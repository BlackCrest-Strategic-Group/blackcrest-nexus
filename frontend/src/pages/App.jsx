import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AppShell from '../layouts/AppShell';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import SupplierPage from './SupplierPage';
import OpportunityPage from './OpportunityPage';
import IntelligencePage from './IntelligencePage';
import CategoryPage from './CategoryPage';
import SettingsPage from './SettingsPage';
import PrivacyPage from './PrivacyPage';
import LoginPage from './LoginPage';
import MFASettingsPage from '../components/MFASettingsPage';
import MFASetupPage from '../components/MFASetupPage';
import ResetPasswordPage from '../components/ResetPasswordPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import SeoContentPage from './SeoContentPage';

function AuthLoadingScreen() {
  return <div className="auth-page"><div className="auth-card"><h2>Validating session…</h2></div></div>;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <main className="auth-page"><section className="auth-card"><h1>Something went wrong</h1><p>Please refresh and try again.</p></section></main>;
    }
    return this.props.children;
  }
}

function ProtectedLayout() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell><Outlet /></AppShell>;
}

function PublicOnlyRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/opportunities" element={<OpportunityPage />} />
              <Route path="/suppliers" element={<SupplierPage />} />
              <Route path="/intelligence" element={<IntelligencePage />} />
              <Route path="/analytics" element={<CategoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/mfa-settings" element={<MFASettingsPage />} />
              <Route path="/mfa-setup" element={<MFASetupPage />} />
            </Route>

            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/procurement-intelligence" element={<SeoContentPage slug="procurement-intelligence" />} />
            <Route path="/supplier-intelligence" element={<SeoContentPage slug="supplier-intelligence" />} />
            <Route path="/strategic-sourcing-software" element={<SeoContentPage slug="strategic-sourcing-software" />} />
            <Route path="/govcon-opportunity-analysis" element={<SeoContentPage slug="govcon-opportunity-analysis" />} />
            <Route path="/procurement-operating-system" element={<SeoContentPage slug="procurement-operating-system" />} />
            <Route path="/supplier-risk-monitoring" element={<SeoContentPage slug="supplier-risk-monitoring" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AppShell from '../layouts/AppShell';
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
import BlanketPOBuilderPage from './BlanketPOBuilder';
import SeoHead from '../components/SeoHead';
import HomePage from './marketing/HomePage';
import ModulePage from './marketing/ModulePage';
import ContactPage from './marketing/ContactPage';
import InsightsPage from './marketing/InsightsPage';
import InsightArticlePage from './marketing/InsightArticlePage';
import TermsPage from './marketing/TermsPage';
import SecurityPage from './marketing/SecurityPage';
import { hasPermission } from '../config/roleConfig';

function AuthLoadingScreen() {
  return <div className="auth-page"><div className="auth-card"><h2>Validating session…</h2></div></div>;
}

function NoIndex() {
  return <SeoHead robots="noindex, nofollow" />;
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
  return <><NoIndex /><AppShell><Outlet /></AppShell></>;
}

function RoleProtectedRoute({ permissions = [], children }) {
  const { user } = useAuth();
  if (!permissions.length || permissions.some((permission) => hasPermission(user, permission))) return children;
  return <Navigate to="/dashboard" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <><NoIndex />{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<ModulePage pageKey="features" />} />
            <Route path="/supplier-intelligence" element={<ModulePage pageKey="supplier" />} />
            <Route path="/opportunity-intelligence" element={<ModulePage pageKey="opportunity" />} />
            <Route path="/sourcing-intelligence" element={<ModulePage pageKey="sourcing" />} />
            <Route path="/proposal-intelligence" element={<ModulePage pageKey="proposal" />} />
            <Route path="/government-contracting" element={<ModulePage pageKey="govcon" />} />
            <Route path="/about" element={<ModulePage pageKey="about" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/what-is-procurement-intelligence" element={<InsightArticlePage slug="what-is-procurement-intelligence" />} />
            <Route path="/insights/procurement-intelligence-vs-spend-analytics" element={<InsightArticlePage slug="procurement-intelligence-vs-spend-analytics" />} />
            <Route path="/insights/how-ai-improves-supplier-intelligence" element={<InsightArticlePage slug="how-ai-improves-supplier-intelligence" />} />
            <Route path="/insights/how-to-evaluate-procurement-opportunities-faster" element={<InsightArticlePage slug="how-to-evaluate-procurement-opportunities-faster" />} />

            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<><NoIndex /><ForgotPasswordPage /></>} />
            <Route path="/reset-password" element={<><NoIndex /><ResetPasswordPage /></>} />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<RoleProtectedRoute permissions={['dashboard:view']}><DashboardPage /></RoleProtectedRoute>} />
              <Route path="/opportunities" element={<RoleProtectedRoute permissions={['briefings:view', 'tasks:view', 'rfq:manage', 'ops_visibility:view']}><OpportunityPage /></RoleProtectedRoute>} />
              <Route path="/suppliers" element={<RoleProtectedRoute permissions={['alerts:view', 'suppliers:view', 'purchase_orders:view', 'kpis:view']}><SupplierPage /></RoleProtectedRoute>} />
              <Route path="/intelligence" element={<RoleProtectedRoute permissions={['briefings:view', 'tasks:view', 'rfq:manage', 'ops_visibility:view']}><IntelligencePage /></RoleProtectedRoute>} />
              <Route path="/analytics" element={<RoleProtectedRoute permissions={['kpis:view', 'category_intelligence:view', 'audit_logs:view', 'compliance:view']}><CategoryPage /></RoleProtectedRoute>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/blanket-po-builder" element={<RoleProtectedRoute permissions={['purchase_orders:view', 'suppliers:view', 'rfq:manage']}><BlanketPOBuilderPage /></RoleProtectedRoute>} />
              <Route path="/mfa-settings" element={<MFASettingsPage />} />
              <Route path="/mfa-setup" element={<MFASetupPage />} />
            </Route>

            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AppShell from '../layouts/AppShell';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import SupplierPage from './SupplierPage';
import OpportunityPage from './OpportunityPage';
import IntelligencePage from './IntelligencePage';
import GlobalIntelligencePage from './GlobalIntelligencePage';
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
import SentinelLandingPage from './marketing/SentinelLandingPage';
import InsightArticlePage from './marketing/InsightArticlePage';
import TermsPage from './marketing/TermsPage';
import SecurityPage from './marketing/SecurityPage';
import PricingPage from './marketing/PricingPage';
import TrustCenterPage from './marketing/TrustCenterPage';
import GovernancePage from './GovernancePage';
import GovernancePolicyPage from './GovernancePolicyPage';
import InvestorDemoPage from './InvestorDemoPage';
import AcquisitionRoomPage from './AcquisitionRoomPage';
import StrategicDemoPage from './StrategicDemoPage';
import CapitalReadinessPage from './CapitalReadinessPage';
import ReportCenterPage from './ReportCenterPage';
import ErpConnectorCenterPage from './ErpConnectorCenterPage';
import DataBoundaryPage from './DataBoundaryPage';
import MarketplaceHomePage from './MarketplaceHomePage';
import MarketplaceCategoryPage from './MarketplaceCategoryPage';
import MarketplaceSupplierPage from './MarketplaceSupplierPage';
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
            <Route path="/procurement-intelligence" element={<ModulePage pageKey="procurement" />} />
            <Route path="/truth-serum" element={<ModulePage pageKey="truthserum" />} />
            <Route path="/about" element={<ModulePage pageKey="about" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/investor-demo" element={<InvestorDemoPage />} />
            <Route path="/acquisition-room" element={<AcquisitionRoomPage />} />
            <Route path="/strategic-demo" element={<StrategicDemoPage />} />
            <Route path="/capital-readiness" element={<CapitalReadinessPage />} />
            <Route path="/data-boundary" element={<DataBoundaryPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/trust-center" element={<TrustCenterPage />} />
            <Route path="/ai-governance-principles" element={<GovernancePolicyPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/sentinel" element={<SentinelLandingPage />} />
            <Route path="/global-intelligence" element={<GlobalIntelligencePage />} />
            <Route path="/insights/industrial-intelligence-for-modern-manufacturing" element={<InsightArticlePage slug="industrial-intelligence-for-modern-manufacturing" />} />
            <Route path="/insights/how-ai-improves-supplier-intelligence" element={<InsightArticlePage slug="how-ai-improves-supplier-intelligence" />} />
            <Route path="/insights/how-to-evaluate-procurement-opportunities-faster" element={<InsightArticlePage slug="how-to-evaluate-procurement-opportunities-faster" />} />
            <Route path="/insights/procurement-intelligence-vs-spend-analytics" element={<InsightArticlePage slug="procurement-intelligence-vs-spend-analytics" />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<><NoIndex /><ForgotPasswordPage /></>} />
            <Route path="/reset-password" element={<><NoIndex /><ResetPasswordPage /></>} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<RoleProtectedRoute permissions={['dashboard:view']}><DashboardPage /></RoleProtectedRoute>} />
              <Route path="/opportunities" element={<RoleProtectedRoute permissions={['recommendations:view']}><OpportunityPage /></RoleProtectedRoute>} />
              <Route path="/suppliers" element={<RoleProtectedRoute permissions={['supplier_risk:view']}><SupplierPage /></RoleProtectedRoute>} />
              <Route path="/intelligence" element={<RoleProtectedRoute permissions={['recommendations:view']}><IntelligencePage /></RoleProtectedRoute>} />
              <Route path="/global-intelligence-platform" element={<RoleProtectedRoute permissions={['recommendations:view']}><GlobalIntelligencePage /></RoleProtectedRoute>} />
              <Route path="/analytics" element={<RoleProtectedRoute permissions={['governance:reporting:view', 'compliance:review', 'audit_logs:view']}><CategoryPage /></RoleProtectedRoute>} />
              <Route path="/governance" element={<RoleProtectedRoute permissions={['governance:dashboard:view']}><GovernancePage /></RoleProtectedRoute>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/report-center" element={<ReportCenterPage />} />
              <Route path="/erp-connector-center" element={<ErpConnectorCenterPage />} />
              <Route path="/blanket-po-builder" element={<RoleProtectedRoute permissions={['recommendations:view', 'supplier_risk:view']}><BlanketPOBuilderPage /></RoleProtectedRoute>} />
              <Route path="/mfa-settings" element={<MFASettingsPage />} />
              <Route path="/mfa-setup" element={<MFASetupPage />} />
              <Route path="/marketplace" element={<MarketplaceHomePage />} />
              <Route path="/marketplace/category/:slug" element={<MarketplaceCategoryPage />} />
              <Route path="/marketplace/supplier/:id" element={<MarketplaceSupplierPage />} />
            </Route>
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

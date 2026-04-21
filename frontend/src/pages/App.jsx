import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AppShell from '../layouts/AppShell';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import CategoryPage from './CategoryPage';
import SupplierPage from './SupplierPage';
import OpportunityPage from './OpportunityPage';
import WatchlistPage from './WatchlistPage';
import HistoryPage from './HistoryPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import PrivacyPage from './PrivacyPage';
import LoginPage from '../components/LoginPage';
import MFASettingsPage from '../components/MFASettingsPage';
import MFASetupPage from '../components/MFASetupPage';


function CleanRoomDisclosure() {
  return (
    <>
      <div className="cleanroom-banner">
        This platform operates exclusively on publicly available data and user-provided inputs. No proprietary or confidential employer data is accessed, stored, or processed.
      </div>
      <div className="cleanroom-watermark" aria-hidden="true">NON-CLASSIFIED USE ONLY</div>
    </>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 320 }}>
        <p style={{ marginBottom: 8 }}>Checking your secure session…</p>
        <small className="muted">Please wait</small>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AuthEntryRedirect() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  return <Navigate to={user ? '/dashboard' : '/'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CleanRoomDisclosure />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/category-intelligence" element={<CategoryPage />} />
            <Route path="/supplier-intelligence" element={<SupplierPage />} />
            <Route path="/opportunity-intelligence" element={<OpportunityPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/security" element={<MFASettingsPage />} />
            <Route path="/mfa-settings" element={<MFASettingsPage />} />
            <Route path="/mfa-setup" element={<MFASetupPage />} />
          </Route>

          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<AuthEntryRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

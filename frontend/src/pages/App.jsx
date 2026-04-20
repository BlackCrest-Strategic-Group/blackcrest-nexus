import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AppShell from '../layouts/AppShell';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
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

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/category-intelligence" element={<Protected><CategoryPage /></Protected>} />
          <Route path="/supplier-intelligence" element={<Protected><SupplierPage /></Protected>} />
          <Route path="/opportunity-intelligence" element={<Protected><OpportunityPage /></Protected>} />
          <Route path="/watchlist" element={<Protected><WatchlistPage /></Protected>} />
          <Route path="/history" element={<Protected><HistoryPage /></Protected>} />
          <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

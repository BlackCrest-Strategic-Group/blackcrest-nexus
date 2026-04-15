import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage.jsx";
import LandingPage from "../components/LandingPage.jsx";
import Dashboard from "../components/Dashboard.jsx";
import ResetPasswordPage from "../components/ResetPasswordPage.jsx";
import MFASetupPage from "../components/MFASetupPage.jsx";
import MFASettingsPage from "../components/MFASettingsPage.jsx";
import { getToken } from "../utils/auth.js";
import HomePage from "../marketing/pages/HomePage.jsx";
import BlackCrestAIPage from "../marketing/pages/BlackCrestAIPage.jsx";
import GovConAIPage from "../marketing/pages/GovConAIPage.jsx";
import TruthSerumAIPage from "../marketing/pages/TruthSerumAIPage.jsx";
import LabsPage from "../marketing/pages/LabsPage.jsx";
import BlanketPOBuilderPage from "./BlanketPOBuilder.jsx";

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Marketing site routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/blackcrest-ai" element={<BlackCrestAIPage />} />
        <Route path="/blackcrest-ai/govcon-ai" element={<GovConAIPage />} />
        <Route path="/blackcrest-ai/truth-serum-ai" element={<TruthSerumAIPage />} />
        <Route path="/labs" element={<LabsPage />} />

        {/* ── Scanner app entry point ── */}
        <Route path="/app" element={<LandingPage />} />

        {/* ── Auth routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Protected routes */}
        <Route
          path="/mfa-setup"
          element={
            <ProtectedRoute>
              <MFASetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mfa-settings"
          element={
            <ProtectedRoute>
              <MFASettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/blanket-po-builder"
          element={
            <ProtectedRoute>
              <BlanketPOBuilderPage />
            </ProtectedRoute>
          }
        />
        {/* Legacy catch-all: redirects unauthenticated users to login */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

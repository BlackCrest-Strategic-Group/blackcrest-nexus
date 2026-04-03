import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage.jsx";
import LandingPage from "../components/LandingPage.jsx";
import Dashboard from "../components/Dashboard.jsx";
import ResetPasswordPage from "../components/ResetPasswordPage.jsx";
import MFASetupPage from "../components/MFASetupPage.jsx";
import MFASettingsPage from "../components/MFASettingsPage.jsx";
import { getToken } from "../utils/auth.js";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
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

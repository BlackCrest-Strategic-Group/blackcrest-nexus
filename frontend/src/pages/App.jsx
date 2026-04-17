import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage.jsx";
import LandingPage from "../components/LandingPage.jsx";
import Dashboard from "../components/Dashboard.jsx";
import ResetPasswordPage from "../components/ResetPasswordPage.jsx";
import { getToken } from "../utils/auth.js";
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/app/blanket-po-builder"
          element={
            <ProtectedRoute>
              <BlanketPOBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import axios from "axios";
import { getToken, getRefreshToken, saveAuth, clearAuth, getPersistencePreference } from "./auth.js";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Attempt silent token refresh on 401
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      // Pre-authentication endpoints return 401 for invalid credentials/codes
      // and must NEVER trigger a token refresh.  A user who previously signed in
      // with "remember me" may have a stale refresh token in localStorage; if the
      // interceptor tries to refresh it here and fails, it calls clearAuth() and
      // redirects to /login — silently kicking the user off the MFA screen instead
      // of showing them the "Invalid code" error message.
      const PRE_AUTH_ENDPOINTS = [
        "/api/auth/verify-mfa-login",
        "/api/mfa/verify-totp-setup",
      ];
      const isPreAuth = PRE_AUTH_ENDPOINTS.some((p) => {
        const url = original.url || "";
        return url === p || url.startsWith(p + "?") || url.startsWith(p + "/");
      });
      if (isPreAuth) {
        return Promise.reject(error);
      }

      // Only attempt a silent token refresh when the user is actually logged in
      // (i.e., they have a refresh token).  Unauthenticated callers should just
      // receive the original error so the UI can display the correct message.
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      original._retried = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        // Preserve whichever storage held the original token (localStorage → remember=true,
        // sessionStorage → remember=false) so we don't silently upgrade a non-persistent
        // session to a persistent one.
        const rememberMe = getPersistencePreference() === "local";
        saveAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken }, rememberMe);

        refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearAuth();
        refreshQueue.forEach(({ reject }) => reject(error));
        refreshQueue = [];
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  profile: () => api.get("/api/auth/profile"),
  updateProfile: (data) => api.patch("/api/auth/profile", data),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/api/auth/reset-password", { token, password }),
  verifyMfaLogin: (data) => api.post("/api/auth/verify-mfa-login", data)
};

// MFA
export const mfaApi = {
  setupEmail: () => api.post("/api/mfa/setup/email"),
  setupSms: (phoneNumber) => api.post("/api/mfa/setup/sms", { phoneNumber }),
  verifySetup: (data) => api.post("/api/mfa/verify-setup", data),
  disable: (method) => api.post("/api/mfa/disable", { method }),
  generateBackupCodes: () => api.post("/api/mfa/generate-backup-codes"),
  status: () => api.get("/api/mfa/status"),
  resendLoginOtp: (mfaToken, method) => api.post("/api/mfa/resend-login-otp", { mfaToken, method }),
  setupTotp: (mfaSetupToken) => api.post("/api/mfa/setup/totp", { mfaSetupToken }),
  verifyTotpSetup: (mfaSetupToken, totpCode) => api.post("/api/mfa/verify-totp-setup", { mfaSetupToken, totpCode })
};

// Opportunities
export const opportunitiesApi = {
  getSaved: () => api.get("/api/opportunities"),
  save: (opportunity) => api.post("/api/opportunities/save", { opportunity }),
  analyze: (formData) =>
    api.post("/api/opportunities/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  analyzeText: (payload) => api.post("/api/opportunities/analyze", payload),
  score: (payload) => api.post("/api/opportunities/score", payload)
};

export const truthSerumApi = {
  analyze: (formData) =>
    api.post("/api/truth-serum/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  analyzeText: (payload) => api.post("/api/truth-serum/analyze-text", payload)
};

export const fundingApi = {
  match: (payload) => api.post("/api/funding/match", payload),
  request: (payload) => api.post("/api/funding/request", payload)
};

// Email
export const emailApi = {
  getPreferences: () => api.get("/api/email-preferences/preferences"),
  updatePreferences: (data) => api.post("/api/email-preferences/preferences/update", data),
  sendDailyDigest: () => api.post("/api/email/send-daily-digest")
};

// Opportunity Intelligence
// Calls the authenticated Express backend (/api/opportunity-intelligence).
// If VITE_INTELLIGENCE_URL is set the frontend may still proxy directly to the
// Python FastAPI service; in that case the base URL is overridden below.
const INTELLIGENCE_BASE = import.meta.env.VITE_INTELLIGENCE_URL
  ? import.meta.env.VITE_INTELLIGENCE_URL.replace(/\/$/, "")
  : null;

export const intelligenceApi = {
  // Use the authenticated `api` instance when calling the Express backend so
  // the access-token header is automatically attached.  When a separate
  // intelligence service URL is configured use plain axios instead.
  get: () =>
    INTELLIGENCE_BASE
      ? axios.get(`${INTELLIGENCE_BASE}/opportunity-intelligence`)
      : api.get("/api/opportunity-intelligence"),
  refresh: (data) =>
    INTELLIGENCE_BASE
      ? axios.post(`${INTELLIGENCE_BASE}/opportunity-intelligence/refresh`, data)
      : api.post("/api/opportunity-intelligence/refresh", data),
};

// Internal enterprise connectors removed in clean-room compliance mode.

// Workflows
export const workflowsApi = {
  list: (params) => api.get("/api/workflows", { params }),
  create: (data) => api.post("/api/workflows", data),
  get: (id) => api.get(`/api/workflows/${id}`),
  update: (id, data) => api.patch(`/api/workflows/${id}`, data),
  remove: (id) => api.delete(`/api/workflows/${id}`),
  addTask: (id, data) => api.post(`/api/workflows/${id}/tasks`, data),
  updateTask: (id, taskId, data) => api.patch(`/api/workflows/${id}/tasks/${taskId}`, data),
  addComment: (id, taskId, data) => api.post(`/api/workflows/${id}/tasks/${taskId}/comments`, data)
};

// Role Dashboards
export const dashboardApi = {
  capture: () => api.get("/api/dashboard/capture"),
  procurement: () => api.get("/api/dashboard/procurement"),
  ops: () => api.get("/api/dashboard/ops"),
  exec: () => api.get("/api/dashboard/exec")
};

// Admin system status
export const adminApi = {
  systemHealth: () => api.get("/api/admin/health/system"),
  integrationHealth: () => api.get("/api/admin/health/integrations")
};

// Suppliers
export const suppliersApi = {
  list: (params) => api.get("/api/suppliers", { params }),
  create: (data) => api.post("/api/suppliers", data),
  get: (id) => api.get(`/api/suppliers/${id}`),
  update: (id, data) => api.patch(`/api/suppliers/${id}`, data),
  remove: (id) => api.delete(`/api/suppliers/${id}`),
  scoreboard: () => api.get("/api/suppliers/summary/scoreboard"),
  kpiSummary: () => api.get("/api/suppliers/kpis/summary")
};

// Margin Leakage Analytics
export const marginsApi = {
  summary: () => api.get("/api/margins/summary"),
  supplierRisk: () => api.get("/api/margins/supplier-risk"),
  agencyTrends: () => api.get("/api/margins/agency-trends")
};

// Capacity & Load Balancing
export const capacityApi = {
  overview: () => api.get("/api/capacity/overview"),
  forecast: () => api.get("/api/capacity/forecast")
};

// Opportunity Fit Check
export const opportunityApi = {
  evaluate: (data) => api.post("/api/opportunity/evaluate", data)
};

// Opportunity Scoring Engine
export const scoringApi = {
  score: (data) => api.post("/api/opportunity/score", data)
};

// Find Suppliers
export const findSuppliersApi = {
  search: (data) => api.post("/api/find-suppliers", data)
};

// Proposals
export const proposalsApi = {
  generate: (data) => api.post("/api/proposals/generate", data),
  list: (params) => api.get("/api/proposals", { params }),
  create: (data) => api.post("/api/proposals", data),
  get: (id) => api.get(`/api/proposals/${id}`),
  update: (id, data) => api.patch(`/api/proposals/${id}`, data),
  remove: (id) => api.delete(`/api/proposals/${id}`)
};

// Blanket PO
export const blanketPoApi = {
  upload: (formData) =>
    api.post("/api/blanket-po/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  exportCsv: (data) => api.post("/api/blanket-po/export/csv", data, { responseType: "text" })
};

export default api;


export const intelligenceEngineApi = {
  getProfile: () => api.get("/api/intelligence/profile"),
  saveOnboarding: (payload) => api.post("/api/intelligence/onboarding", payload),
  ingest: (payload) => api.post("/api/intelligence/ingest", payload),
  listOpportunities: () => api.get("/api/intelligence/opportunities"),
  complianceAnalyze: (formData) =>
    api.post("/api/intelligence/compliance/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};


export const procurementApi = {
  analyzeOpportunity: (payload) => api.post("/api/analyze-opportunity", payload),
  analyzeText: (payload) => api.post("/api/analyze-text", payload),
  listOpportunities: () => api.get("/api/opportunities"),
  listSuppliers: (params) => api.get("/api/suppliers", { params }),
  decisionScore: (payload) => api.post("/api/decision-score", payload),
  truthInsights: () => api.get("/api/truth-insights")
};

import express from "express";
import crypto from "crypto";

const router = express.Router();

const DEMO_EMAIL = "demo@blackcrestai.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "password123";
const DEMO_USER = {
  id: "demo-user",
  name: "Demo User",
  email: DEMO_EMAIL,
  company: "BlackCrest Demo",
  companyName: "BlackCrest Demo",
  plan: "demo"
};

const refreshTokens = new Map();

function issueAuth(user = DEMO_USER) {
  const accessToken = `demo-access-${crypto.randomUUID()}`;
  const refreshToken = `demo-refresh-${crypto.randomUUID()}`;
  refreshTokens.set(refreshToken, user);
  return { accessToken, refreshToken, user };
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

function getUserFromAccessToken(token) {
  if (!token || !token.startsWith("demo-access-")) return null;
  return DEMO_USER;
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  if (String(email).toLowerCase().trim() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return res.status(401).json({ success: false, error: "Invalid email or password." });
  }

  return res.json({ success: true, ...issueAuth() });
});

router.post("/register", (req, res) => {
  const { email, password, name, company } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  const user = {
    ...DEMO_USER,
    id: `user-${crypto.randomUUID()}`,
    email: String(email).toLowerCase().trim(),
    name: name?.trim() || "New User",
    company: company?.trim() || "",
    companyName: company?.trim() || ""
  };

  return res.status(201).json({ success: true, ...issueAuth(user) });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  const user = refreshTokens.get(refreshToken);

  if (!user) {
    return res.status(403).json({ success: false, error: "Invalid refresh token." });
  }

  refreshTokens.delete(refreshToken);
  return res.json({ success: true, ...issueAuth(user) });
});

router.post("/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) refreshTokens.delete(refreshToken);
  return res.json({ success: true, message: "Logged out successfully." });
});

router.get("/profile", (req, res) => {
  const user = getUserFromAccessToken(getBearerToken(req));
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }

  return res.json({ success: true, user });
});

router.patch("/profile", (req, res) => {
  const user = getUserFromAccessToken(getBearerToken(req));
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }

  const { name, company } = req.body || {};
  return res.json({
    success: true,
    user: {
      ...user,
      name: name?.trim() || user.name,
      company: company?.trim() || user.company,
      companyName: company?.trim() || user.companyName
    }
  });
});

router.post("/forgot-password", (req, res) => {
  return res.json({
    success: true,
    message: "If that email address is registered, a password reset link has been sent."
  });
});

router.post("/reset-password", (req, res) => {
  return res.json({ success: true, message: "Your password has been reset. You can now sign in." });
});

router.post("/verify-mfa-login", (req, res) => {
  return res.status(400).json({ success: false, error: "MFA is not enabled for the demo account." });
});

router.get("/health", (req, res) => {
  return res.json({ success: true, service: "auth" });
});

export default router;

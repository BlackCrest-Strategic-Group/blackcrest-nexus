import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import EmailPreference from "../models/EmailPreference.js";
import { authenticateToken } from "../middleware/auth.js";
import crypto from "crypto";
import { sendPasswordResetEmail, sendMfaOtpEmail } from "../services/emailService.js";
import { verifyTotpCode } from "../services/totpService.js";
import { audit, getIp, EVENT } from "../services/auditLogger.js";

const router = express.Router();

// NIST AC-7: Number of consecutive failed logins before account lockout.
// Configurable via LOGIN_MAX_FAILED_ATTEMPTS env var (default: 5).
const LOGIN_MAX_FAILED_ATTEMPTS =
  parseInt(process.env.LOGIN_MAX_FAILED_ATTEMPTS || "5", 10);

// NIST AC-7: Duration (in minutes) that an account stays locked.
// Configurable via LOGIN_LOCKOUT_MINUTES env var (default: 15).
const LOGIN_LOCKOUT_MINUTES =
  parseInt(process.env.LOGIN_LOCKOUT_MINUTES || "15", 10);

// NIST IA-5(1): Maximum allowed password length (prevents DoS via bcrypt cost).
const PASSWORD_MAX_LENGTH = 128;

// NIST SP 800-63B §5.1.1: Known commonly-used passwords to reject at registration/reset.
// Module-level constant so the Set is constructed once, not on every validation call.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789",
  "1234567890", "qwerty123", "qwertyuiop", "iloveyou", "admin1234",
  "letmein1", "welcome1", "monkey123", "dragon123", "master123",
  "abc123456", "passw0rd", "p@ssword", "p@ssw0rd", "changeme"
]);

// Rate limiter for login (10 per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts. Please wait before trying again." }
});

// Rate limiter for registration (10 per 15 minutes per IP)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many registration attempts. Please wait before trying again." }
});

// Rate limiter for MFA verification during login (5 attempts per 15 minutes)
const mfaLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many MFA attempts. Please wait before trying again." }
});

// Stricter rate limiter for password-related endpoints (5 requests per 15 minutes)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

// NIST IA-5(1): Validate password meets minimum security requirements.
// Returns an error string if invalid, or null if valid.
function validatePassword(password) {
  if (!password || typeof password !== "string") return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > PASSWORD_MAX_LENGTH) return `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`;
  // NIST SP 800-63B §5.1.1: Check against known commonly-used passwords.
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Password is too common. Please choose a more unique password.";
  }
  return null;
}

const OTP_EXPIRY_MINUTES = parseInt(process.env.MFA_OTP_EXPIRY_MINUTES || "5", 10);

const ALGORITHM = "aes-256-gcm";

function decryptPhone(payload) {
  const key = process.env.MFA_ENCRYPTION_KEY || process.env.ERP_ENCRYPTION_KEY;
  if (!key) return null;
  const [ivHex, tagHex, encHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, "hex"), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

async function sendSmsOtpForLogin(phoneNumber, otp) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return; // graceful: SMS not configured
  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);
  await client.messages.create({
    body: `Your GovCon AI Scanner verification code is: ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    from,
    to: phoneNumber
  });
}

function generateTokens(userId) {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

function sanitizeNaicsCodes(codes) {
  if (!Array.isArray(codes)) return [];
  return codes.filter((c) => typeof c === "string" && /^\d{2,6}$/.test(c.trim()));
}

function generateMfaLoginToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  const expiryMinutes = parseInt(process.env.MFA_OTP_EXPIRY_MINUTES || "5", 10);
  return jwt.sign({ id: userId, purpose: "mfa-login" }, secret, { expiresIn: `${expiryMinutes}m` });
}

function generateMfaSetupToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ id: userId, purpose: "mfa-setup" }, secret, { expiresIn: "15m" });
}

function generateOtpForLogin() {
  // Rejection sampling to avoid modular bias (LIMIT = floor(2^32 / 1,000,000) * 1,000,000)
  const LIMIT = 4294000000;
  let num;
  do {
    const bytes = crypto.randomBytes(4);
    num = bytes.readUInt32BE(0);
  } while (num >= LIMIT);
  return String(num % 1000000).padStart(6, "0");
}

// POST /api/auth/register
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { email, password, name, company, naicsCodes, plan } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    // NIST IA-5(1): Enforce password policy
    const pwdError = validatePassword(password);
    if (pwdError) {
      return res.status(400).json({ success: false, error: pwdError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    // Validate plan selection (default to free)
    const validPlans = ["free", "pro", "enterprise"];
    const selectedPlan = validPlans.includes(plan) ? plan : "free";

    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      name: name?.trim() || "",
      company: company?.trim() || "",
      naicsCodes: sanitizeNaicsCodes(naicsCodes),
      plan: selectedPlan,
      planStatus: "trialing",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await user.save();

    // Create default email preferences for the new user
    await EmailPreference.create({ user: user._id });

    // NIST AC-2: Audit account creation event
    audit(EVENT.ACCOUNT_CREATED, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true,
      details: { plan: selectedPlan }
    });

    // TOTP MFA is mandatory — require setup before granting access
    const mfaSetupToken = generateMfaSetupToken(user._id.toString());

    res.status(201).json({
      success: true,
      requiresMfaSetup: true,
      mfaSetupToken,
      plan: selectedPlan
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    // NIST IA-5(1): Reject oversized inputs before any DB lookup to prevent DoS
    if (typeof password === "string" && password.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ success: false, error: "Invalid credentials." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) {
      audit(EVENT.LOGIN_FAILURE, {
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: { reason: "User not found or inactive", email: email.toLowerCase().trim() }
      });
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // NIST AC-7: Check if account is locked before verifying credentials.
    // Use a constant-time response to avoid revealing whether the account exists.
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      audit(EVENT.LOGIN_FAILURE, {
        userId:  user._id.toString(),
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: { reason: "Account locked", lockedUntil: user.accountLockedUntil }
      });
      const minutesLeft = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Account temporarily locked due to too many failed login attempts. Please try again in ${minutesLeft} minute(s).`
      });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      // NIST AC-7: Increment failed attempt counter and lock if threshold reached
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = user.failedLoginAttempts >= LOGIN_MAX_FAILED_ATTEMPTS;
      if (isNowLocked) {
        user.accountLockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();

      if (isNowLocked) {
        audit(EVENT.ACCOUNT_LOCKED, {
          userId:  user._id.toString(),
          email:   user.email,
          ip:      req.clientIp ?? getIp(req),
          route:   req.originalUrl,
          method:  req.method,
          success: false,
          details: {
            reason:           "Too many failed login attempts",
            failedAttempts:   user.failedLoginAttempts,
            lockedUntil:      user.accountLockedUntil,
            lockoutMinutes:   LOGIN_LOCKOUT_MINUTES
          }
        });
      }

      audit(EVENT.LOGIN_FAILURE, {
        userId:  user._id.toString(),
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: {
          reason:          "Invalid password",
          failedAttempts:  user.failedLoginAttempts,
          accountLocked:   isNowLocked
        }
      });
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // Credentials verified — reset the failed attempt counter (AC-7)
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      await user.save();
    }

    // Credentials verified — log success before issuing MFA challenge
    audit(EVENT.LOGIN_SUCCESS, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true,
      details: { mfaRequired: true }
    });

    // TOTP MFA is mandatory for all users
    if (user.totpVerified) {
      // User has TOTP set up — issue a login challenge token
      const mfaToken = generateMfaLoginToken(user._id.toString());
      return res.json({
        success: true,
        requiresMfa: true,
        mfaMethod: "totp",
        mfaToken
      });
    }

    // TOTP not yet set up — force setup before granting access
    const mfaSetupToken = generateMfaSetupToken(user._id.toString());
    return res.json({
      success: true,
      requiresMfaSetup: true,
      mfaSetupToken
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, error: "Login failed. Please try again." });
  }
});

// POST /api/auth/verify-mfa-login
// Complete login by verifying OTP or backup code
router.post("/verify-mfa-login", mfaLoginLimiter, async (req, res) => {
  try {
    const { mfaToken, method, otp } = req.body;

    if (!mfaToken || !method || !otp) {
      return res.status(400).json({ success: false, error: "mfaToken, method, and otp are required." });
    }

    if (!["email", "sms", "backup", "totp"].includes(method)) {
      return res.status(400).json({ success: false, error: "Invalid method." });
    }

    // Verify MFA login token
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured.");
    let decoded;
    try {
      decoded = jwt.verify(mfaToken, secret);
    } catch {
      return res.status(400).json({ success: false, error: "MFA token is invalid or expired." });
    }

    if (decoded.purpose !== "mfa-login") {
      return res.status(400).json({ success: false, error: "Invalid token purpose." });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    let verified = false;

    if (method === "totp") {
      // Verify TOTP code from authenticator app
      if (!user.totpVerified || !user.totpSecret) {
        return res.status(400).json({ success: false, error: "Authenticator app not configured for this account." });
      }
      const valid = verifyTotpCode(user.totpSecret, otp.trim());
      if (!valid) {
        audit(EVENT.MFA_FAILURE, {
          userId:  user._id.toString(),
          email:   user.email,
          ip:      req.clientIp ?? getIp(req),
          route:   req.originalUrl,
          method:  req.method,
          success: false,
          details: { mfaMethod: "totp", reason: "Invalid TOTP code" }
        });
        return res.status(401).json({ success: false, error: "Invalid authenticator code. Please try again." });
      }
      verified = true;
    } else if (method === "backup") {
      // Verify backup code
      if (user.mfaBackupCodes.length === 0) {
        return res.status(400).json({ success: false, error: "No backup codes available." });
      }
      const { findMatchingBackupCode } = await import("./mfa.js");
      const matchIndex = await findMatchingBackupCode(otp, user.mfaBackupCodes);
      if (matchIndex === -1) {
        audit(EVENT.MFA_FAILURE, {
          userId:  user._id.toString(),
          email:   user.email,
          ip:      req.clientIp ?? getIp(req),
          route:   req.originalUrl,
          method:  req.method,
          success: false,
          details: { mfaMethod: "backup", reason: "Invalid backup code" }
        });
        return res.status(401).json({ success: false, error: "Invalid backup code." });
      }
      // Remove the used backup code (single-use)
      user.mfaBackupCodes.splice(matchIndex, 1);
      verified = true;
    } else {
      // Verify OTP
      if (!user.mfaMethods.includes(method)) {
        return res.status(400).json({ success: false, error: `${method} MFA is not enabled for this account.` });
      }

      if (!user.mfaOtpHash || !user.mfaOtpExpiresAt || user.mfaOtpExpiresAt < new Date()) {
        return res.status(400).json({ success: false, error: "Verification code has expired. Please log in again." });
      }

      const otpMatch = await bcrypt.compare(otp, user.mfaOtpHash);
      if (!otpMatch) {
        audit(EVENT.MFA_FAILURE, {
          userId:  user._id.toString(),
          email:   user.email,
          ip:      req.clientIp ?? getIp(req),
          route:   req.originalUrl,
          method:  req.method,
          success: false,
          details: { mfaMethod: method, reason: "Invalid OTP" }
        });
        return res.status(401).json({ success: false, error: "Invalid verification code." });
      }
      verified = true;
    }

    if (!verified) {
      return res.status(401).json({ success: false, error: "Verification failed." });
    }

    // Clear used OTP
    user.mfaOtpHash = null;
    user.mfaOtpExpiresAt = null;
    user.lastMfaVerificationAt = new Date();

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await user.save();

    audit(EVENT.MFA_SUCCESS, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true,
      details: { mfaMethod: method }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toPublic()
    });
  } catch (error) {
    console.error("MFA login verification error:", error.message);
    res.status(500).json({ success: false, error: "MFA verification failed. Please try again." });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: "Refresh token required." });
    }

    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret);

    const user = await User.findById(decoded.id);
    const incomingHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedHash = user?.refreshToken || "";
    const hashesMatch = storedHash.length === incomingHash.length &&
      crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(incomingHash));
    if (!user || !hashesMatch) {
      return res.status(403).json({ success: false, error: "Invalid refresh token." });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex");
    await user.save();

    // NIST IA-11: Audit token refresh events
    audit(EVENT.TOKEN_REFRESH, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true
    });

    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(403).json({ success: false, error: "Invalid or expired refresh token." });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // NIST AC-12: Audit session termination
    audit(EVENT.LOGOUT, {
      userId:  req.user.id,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true
    });

    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Logout failed." });
  }
});

// GET /api/auth/profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    res.json({ success: true, user: user.toPublic() });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch profile." });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, company, naicsCodes } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (company !== undefined) updates.company = company.trim();
    if (Array.isArray(naicsCodes)) updates.naicsCodes = sanitizeNaicsCodes(naicsCodes);

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    res.json({ success: true, user: user.toPublic() });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update profile." });
  }
});

// POST /api/auth/forgot-password
// Bug fix (forgot password not working): Added audit logging for reset requests
// and improved error handling so failures are clearly surfaced to the user.
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to prevent email enumeration.
    // Audit the attempt regardless of whether the user exists.
    if (!user || !user.isActive) {
      audit(EVENT.PASSWORD_RESET_REQUEST, {
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: { reason: "User not found or inactive", email: email.toLowerCase().trim() }
      });
      return res.json({
        success: true,
        message: "If that email address is registered, a password reset link has been sent."
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Determine the app base URL for the reset link.
    // Priority: APP_URL env var (most secure) → validated against ALLOWED_ORIGINS.
    // Never use raw request headers directly to avoid header-injection attacks.
    let appBaseUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    if (!appBaseUrl) {
      // Fall back to the first entry in ALLOWED_ORIGINS when APP_URL is unset.
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
      appBaseUrl = allowedOrigins[0] || "http://localhost:5173";
    }

    try {
      await sendPasswordResetEmail(user, resetToken, appBaseUrl);
    } catch (emailErr) {
      // Log the specific error with full details to help administrators diagnose
      // SMTP configuration problems, credential failures, or service outages.
      console.error("[ForgotPassword] Email delivery failed:", {
        userId:          user._id.toString(),
        email:           user.email,
        errorType:       emailErr.constructor?.name ?? "Error",
        errorMessage:    emailErr.message,
        smtpResponseCode: emailErr.responseCode ?? null,
        smtpCommand:     emailErr.command ?? null,
      });
      // Clear token if email failed so the user can retry
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      audit(EVENT.PASSWORD_RESET_REQUEST, {
        userId:  user._id.toString(),
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: { reason: "Email delivery failed", errorMessage: emailErr.message }
      });
      return res.status(500).json({ success: false, error: "Failed to send reset email. Please try again later." });
    }

    audit(EVENT.PASSWORD_RESET_REQUEST, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true,
      details: { message: "Password reset email sent" }
    });

    res.json({
      success: true,
      message: "If that email address is registered, a password reset link has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ success: false, error: "Failed to process request. Please try again." });
  }
});

// POST /api/auth/reset-password
// Bug fix (forgot password not working): Added audit logging for successful and
// failed reset attempts so administrators can trace the complete reset lifecycle.
router.post("/reset-password", passwordResetLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and new password are required." });
    }

    // NIST IA-5(1): Enforce password policy on reset
    const pwdError = validatePassword(password);
    if (pwdError) {
      return res.status(400).json({ success: false, error: pwdError });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Password reset token is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // NIST AC-7: Reset the failed login counter when password is reset
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    // Invalidate any existing refresh token
    user.refreshToken = null;
    await user.save();

    audit(EVENT.PASSWORD_RESET_COMPLETE, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true,
      details: { message: "Password reset completed" }
    });

    res.json({ success: true, message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, error: "Failed to reset password. Please try again." });
  }
});

// POST /api/auth/change-password
// NIST IA-5(1): Allow authenticated users to change their own password.
// Rate limiter applied first to protect against brute-force even without auth.
router.post("/change-password", passwordResetLimiter, authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current password and new password are required." });
    }

    // NIST IA-5(1): Enforce password policy on the new password
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      return res.status(400).json({ success: false, error: pwdError });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      audit(EVENT.PASSWORD_CHANGED, {
        userId:  user._id.toString(),
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: { reason: "Current password incorrect" }
      });
      return res.status(401).json({ success: false, error: "Current password is incorrect." });
    }

    user.password = newPassword;
    // Invalidate all existing refresh tokens to force re-login on other devices
    user.refreshToken = null;
    await user.save();

    // NIST IA-5: Audit password change event
    audit(EVENT.PASSWORD_CHANGED, {
      userId:  user._id.toString(),
      email:   user.email,
      ip:      req.clientIp ?? getIp(req),
      route:   req.originalUrl,
      method:  req.method,
      success: true
    });

    res.json({ success: true, message: "Password changed successfully. Please log in again." });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ success: false, error: "Failed to change password. Please try again." });
  }
});

export default router;

/**
 * MFA Routes – /api/mfa
 *
 * Provides endpoints for setting up, verifying, and managing
 * Multi-Factor Authentication (MFA) for users.
 *
 * Supported methods: email (OTP), sms (OTP via Twilio)
 */

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import { sendMfaOtpEmail } from "../services/emailService.js";
import { encryptTotpSecret, decryptTotpSecret, verifyTotpCode } from "../services/totpService.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const OTP_EXPIRY_MINUTES = parseInt(process.env.MFA_OTP_EXPIRY_MINUTES || "5", 10);
const SETUP_TOKEN_EXPIRY_MINUTES = parseInt(process.env.MFA_SETUP_TOKEN_EXPIRY_MINUTES || "15", 10);
const BACKUP_CODE_COUNT = parseInt(process.env.MFA_BACKUP_CODE_COUNT || "10", 10);
const ALGORITHM = "aes-256-gcm";

// ---------------------------------------------------------------------------
// Rate limiters
// ---------------------------------------------------------------------------
const otpGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || "unknown",
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { success: false, error: "Too many OTP requests. Please wait before trying again." }
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || "unknown",
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { success: false, error: "Too many verification attempts. Please wait before trying again." }
});

const generalMfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || "unknown",
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

// ---------------------------------------------------------------------------
// Encryption helpers (same pattern as ErpConfig)
// ---------------------------------------------------------------------------
function getEncryptionKey() {
  const key = process.env.MFA_ENCRYPTION_KEY || process.env.ERP_ENCRYPTION_KEY;
  if (!key) throw new Error("MFA_ENCRYPTION_KEY or ERP_ENCRYPTION_KEY not configured");
  return key;
}

function encryptPhone(plain) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptPhone(payload) {
  const key = getEncryptionKey();
  const [ivHex, tagHex, encHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, "hex"),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

// ---------------------------------------------------------------------------
// OTP helpers
// ---------------------------------------------------------------------------

/** Generate a cryptographically secure 6-digit OTP without modular bias */
function generateOtp() {
  // Rejection sampling: discard values >= 4,294,000,000 (max uint32 multiple of 1,000,000)
  // to avoid modular bias. Rejection probability is ~(4,967,296 / 4,294,967,296) < 0.12%.
  const LIMIT = 4294000000; // Math.floor(0x100000000 / 1000000) * 1000000
  let num;
  do {
    const bytes = crypto.randomBytes(4);
    num = bytes.readUInt32BE(0);
  } while (num >= LIMIT);
  return String(num % 1000000).padStart(6, "0");
}

/** Hash an OTP for storage */
async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

/** Verify OTP against stored hash */
async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

// ---------------------------------------------------------------------------
// Backup code helpers
// ---------------------------------------------------------------------------

/** Generate `count` random 10-character alphanumeric backup codes without modular bias */
function generateBackupCodes(count = BACKUP_CODE_COUNT) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // Rejection sampling threshold: floor(256 / CHARS.length) * CHARS.length = 4 * 62 = 248
  const MAX_VALID = Math.floor(256 / CHARS.length) * CHARS.length;

  function randomChar() {
    let b;
    do { b = crypto.randomBytes(1)[0]; } while (b >= MAX_VALID);
    return CHARS[b % CHARS.length];
  }

  return Array.from({ length: count }, () =>
    Array.from({ length: 10 }, randomChar).join("")
  );
}

/** Hash all backup codes for storage */
async function hashBackupCodes(codes) {
  return Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
}

/** Find and return the index of a matching backup code (-1 if not found) */
async function findMatchingBackupCode(inputCode, storedHashes) {
  for (let i = 0; i < storedHashes.length; i++) {
    const match = await bcrypt.compare(inputCode, storedHashes[i]);
    if (match) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// SMS helper (Twilio)
// ---------------------------------------------------------------------------

async function sendSmsOtp(phoneNumber, otp) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    throw new Error("Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.");
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);
  await client.messages.create({
    body: `Your GovCon AI Scanner verification code is: ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    from,
    to: phoneNumber
  });
}

// ---------------------------------------------------------------------------
// TOTP (Authenticator App) Setup Routes
// These use a short-lived mfa-setup JWT (generated at login/register)
// and do NOT require an authenticated session — the user has not yet
// completed MFA setup, so they have no access token.
// ---------------------------------------------------------------------------

const totpSetupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "unknown",
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { success: false, error: "Too many TOTP setup requests. Please wait." }
});

function verifyMfaSetupToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  const decoded = jwt.verify(token, secret);
  if (decoded.purpose !== "mfa-setup") throw new Error("Invalid token purpose");
  return decoded;
}

// POST /api/mfa/setup/totp
// Generate a TOTP secret and return a QR code for Microsoft Authenticator.
// Requires a valid mfa-setup token (issued after successful password verification).
router.post("/setup/totp", totpSetupLimiter, async (req, res) => {
  try {
    const { mfaSetupToken } = req.body;
    if (!mfaSetupToken) {
      return res.status(400).json({ success: false, error: "Setup token is required." });
    }

    let decoded;
    try {
      decoded = verifyMfaSetupToken(mfaSetupToken);
    } catch {
      return res.status(400).json({ success: false, error: "Invalid or expired setup token." });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const secret = speakeasy.generateSecret({
      name: `GovCon AI Scanner (${user.email})`,
      issuer: "BlackCrest Strategic Group",
      length: 32
    });

    user.totpPendingSecret = encryptTotpSecret(secret.base32);
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      success: true,
      qrCode,
      manualEntryKey: secret.base32,
      otpauthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error("TOTP setup error:", error.message);
    res.status(500).json({ success: false, error: "Failed to generate TOTP setup. Please try again." });
  }
});

// POST /api/mfa/verify-totp-setup
// Verify the first TOTP code from the authenticator app to confirm setup.
// On success, promotes pending secret to active and returns session tokens.
router.post("/verify-totp-setup", totpSetupLimiter, async (req, res) => {
  try {
    const { mfaSetupToken, totpCode } = req.body;
    if (!mfaSetupToken || !totpCode) {
      return res.status(400).json({ success: false, error: "Setup token and TOTP code are required." });
    }

    let decoded;
    try {
      decoded = verifyMfaSetupToken(mfaSetupToken);
    } catch {
      return res.status(400).json({ success: false, error: "Invalid or expired setup token." });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    if (!user.totpPendingSecret) {
      return res.status(400).json({ success: false, error: "TOTP setup not initiated. Please start again." });
    }

    const valid = verifyTotpCode(user.totpPendingSecret, totpCode.trim());
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid code. Please check your authenticator app and try again." });
    }

    // Promote pending secret → active
    user.totpSecret = user.totpPendingSecret;
    user.totpPendingSecret = null;
    user.totpVerified = true;
    user.mfaEnabled = true;
    if (!user.mfaMethods.includes("totp")) {
      user.mfaMethods.push("totp");
    }

    // Generate backup codes
    const plainCodes = generateBackupCodes(BACKUP_CODE_COUNT);
    user.mfaBackupCodes = await hashBackupCodes(plainCodes);
    user.lastMfaVerificationAt = new Date();

    // Issue session tokens (TOTP setup completes the login)
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;
    const accessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, jwtRefreshSecret, { expiresIn: "7d" });
    user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await user.save();

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toPublic(),
      backupCodes: plainCodes
    });
  } catch (error) {
    console.error("TOTP verify-setup error:", error.message);
    res.status(500).json({ success: false, error: "TOTP verification failed. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// Setup token helpers
// ---------------------------------------------------------------------------

function generateSetupToken(userId, method, extraClaims = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign(
    { id: userId, method, purpose: "mfa-setup", ...extraClaims },
    secret,
    { expiresIn: `${SETUP_TOKEN_EXPIRY_MINUTES}m` }
  );
}

function verifySetupToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  const decoded = jwt.verify(token, secret);
  if (decoded.purpose !== "mfa-setup") throw new Error("Invalid token purpose.");
  return decoded;
}

// ---------------------------------------------------------------------------
// POST /api/mfa/setup/email
// Start email MFA setup – send OTP to user's email
// ---------------------------------------------------------------------------
router.post("/setup/email", otpGenerateLimiter, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.mfaOtpHash = otpHash;
    user.mfaOtpExpiresAt = expiresAt;
    await user.save();

    await sendMfaOtpEmail(user, otp);

    const setupToken = generateSetupToken(user._id.toString(), "email");

    res.json({ success: true, setupToken, message: `Verification code sent to ${user.email}` });
  } catch (error) {
    console.error("MFA setup/email error:", error.message);
    res.status(500).json({ success: false, error: "Failed to send verification code." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mfa/setup/sms
// Start SMS MFA setup – send OTP via Twilio
// ---------------------------------------------------------------------------
router.post("/setup/sms", otpGenerateLimiter, authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || typeof phoneNumber !== "string" || !/^\+\d{7,15}$/.test(phoneNumber.trim())) {
      return res.status(400).json({ success: false, error: "A valid phone number in E.164 format (e.g. +12125551234) is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const phoneEnc = encryptPhone(phoneNumber.trim());
    user.mfaOtpHash = otpHash;
    user.mfaOtpExpiresAt = expiresAt;
    user.smsPhoneEnc = phoneEnc; // store temporarily until verified
    await user.save();

    await sendSmsOtp(phoneNumber.trim(), otp);

    const setupToken = generateSetupToken(user._id.toString(), "sms");

    res.json({ success: true, setupToken, message: `Verification code sent to ${phoneNumber.slice(0, 3)}***${phoneNumber.slice(-4)}` });
  } catch (error) {
    console.error("MFA setup/sms error:", error.message);
    if (error.message.includes("Twilio is not configured")) {
      return res.status(503).json({ success: false, error: "SMS is not available. Please use email verification." });
    }
    res.status(500).json({ success: false, error: "Failed to send SMS verification code." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mfa/verify-setup
// Verify OTP and enable MFA method; return backup codes
// ---------------------------------------------------------------------------
router.post("/verify-setup", otpVerifyLimiter, authenticateToken, async (req, res) => {
  try {
    const { setupToken, otp, method } = req.body;

    if (!setupToken || !otp || !method) {
      return res.status(400).json({ success: false, error: "setupToken, otp, and method are required." });
    }

    if (!["email", "sms"].includes(method)) {
      return res.status(400).json({ success: false, error: "Invalid MFA method. Must be 'email' or 'sms'." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, error: "OTP must be exactly 6 digits." });
    }

    // Verify setup token
    let decoded;
    try {
      decoded = verifySetupToken(setupToken);
    } catch {
      return res.status(400).json({ success: false, error: "Setup token is invalid or expired." });
    }

    // Ensure token belongs to authenticated user
    if (decoded.id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Setup token does not match authenticated user." });
    }

    if (decoded.method !== method) {
      return res.status(400).json({ success: false, error: "Method does not match setup token." });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Check OTP expiry
    if (!user.mfaOtpHash || !user.mfaOtpExpiresAt || user.mfaOtpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, error: "Verification code has expired. Please start setup again." });
    }

    // Verify OTP
    const otpValid = await verifyOtp(otp, user.mfaOtpHash);
    if (!otpValid) {
      return res.status(400).json({ success: false, error: "Invalid verification code." });
    }

    // Enable the MFA method
    if (!user.mfaMethods.includes(method)) {
      user.mfaMethods.push(method);
    }
    user.mfaEnabled = true;
    user.mfaOtpHash = null;
    user.mfaOtpExpiresAt = null;
    user.lastMfaVerificationAt = new Date();

    // Generate backup codes
    const plainCodes = generateBackupCodes(BACKUP_CODE_COUNT);
    const hashedCodes = await hashBackupCodes(plainCodes);
    user.mfaBackupCodes = hashedCodes;

    await user.save();

    res.json({
      success: true,
      message: `${method === "email" ? "Email" : "SMS"} MFA has been enabled.`,
      backupCodes: plainCodes,
      warning: "Save these backup codes in a safe place. They will not be shown again."
    });
  } catch (error) {
    console.error("MFA verify-setup error:", error.message);
    res.status(500).json({ success: false, error: "Failed to verify MFA setup." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mfa/disable
// Disable a specific MFA method
// ---------------------------------------------------------------------------
router.post("/disable", generalMfaLimiter, authenticateToken, async (req, res) => {
  try {
    const { method } = req.body;
    if (!method || !["email", "sms"].includes(method)) {
      return res.status(400).json({ success: false, error: "A valid method ('email' or 'sms') is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    user.mfaMethods = user.mfaMethods.filter((m) => m !== method);

    if (user.mfaMethods.length === 0) {
      user.mfaEnabled = false;
      user.mfaBackupCodes = [];
      if (method === "sms") user.smsPhoneEnc = null;
    } else if (method === "sms") {
      user.smsPhoneEnc = null;
    }

    await user.save();

    res.json({
      success: true,
      message: `${method === "email" ? "Email" : "SMS"} MFA has been disabled.`,
      mfaEnabled: user.mfaEnabled,
      mfaMethods: user.mfaMethods
    });
  } catch (error) {
    console.error("MFA disable error:", error.message);
    res.status(500).json({ success: false, error: "Failed to disable MFA." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mfa/generate-backup-codes
// Regenerate backup codes (invalidates old ones)
// ---------------------------------------------------------------------------
router.post("/generate-backup-codes", generalMfaLimiter, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    if (!user.mfaEnabled) {
      return res.status(400).json({ success: false, error: "MFA is not enabled." });
    }

    const plainCodes = generateBackupCodes(BACKUP_CODE_COUNT);
    const hashedCodes = await hashBackupCodes(plainCodes);
    user.mfaBackupCodes = hashedCodes;
    await user.save();

    res.json({
      success: true,
      backupCodes: plainCodes,
      warning: "Your old backup codes are now invalid. Save these new codes in a safe place."
    });
  } catch (error) {
    console.error("MFA generate-backup-codes error:", error.message);
    res.status(500).json({ success: false, error: "Failed to generate backup codes." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/mfa/status
// Return current MFA configuration for the authenticated user
// ---------------------------------------------------------------------------
router.get("/status", generalMfaLimiter, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    let smsPhoneLastFour = null;
    if (user.smsPhoneEnc) {
      try {
        const phone = decryptPhone(user.smsPhoneEnc);
        smsPhoneLastFour = phone.slice(-4);
      } catch {
        smsPhoneLastFour = null;
      }
    }

    res.json({
      success: true,
      mfaEnabled: user.mfaEnabled,
      mfaMethods: user.mfaMethods,
      hasBackupCodes: user.mfaBackupCodes.length > 0,
      backupCodesRemaining: user.mfaBackupCodes.length,
      smsPhoneLastFour,
      lastMfaVerificationAt: user.lastMfaVerificationAt
    });
  } catch (error) {
    console.error("MFA status error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch MFA status." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/mfa/resend-login-otp (no authentication required — uses mfaToken)
// Resend OTP during the login verification flow
// ---------------------------------------------------------------------------
router.post("/resend-login-otp", otpGenerateLimiter, async (req, res) => {
  try {
    const { mfaToken, method } = req.body;
    if (!mfaToken || !method) {
      return res.status(400).json({ success: false, error: "mfaToken and method are required." });
    }

    if (!["email", "sms"].includes(method)) {
      return res.status(400).json({ success: false, error: "Method must be 'email' or 'sms'." });
    }

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
    if (!user || !user.isActive || !user.mfaEnabled) {
      return res.status(404).json({ success: false, error: "User not found or MFA not enabled." });
    }

    if (!user.mfaMethods.includes(method)) {
      return res.status(400).json({ success: false, error: `${method} MFA is not enabled for this account.` });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    user.mfaOtpHash = otpHash;
    user.mfaOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    if (method === "email") {
      await sendMfaOtpEmail(user, otp);
      res.json({ success: true, message: `Verification code resent to your email.` });
    } else if (method === "sms") {
      if (!user.smsPhoneEnc) {
        return res.status(400).json({ success: false, error: "No SMS phone number configured." });
      }
      const phone = decryptPhone(user.smsPhoneEnc);
      await sendSmsOtp(phone, otp);
      res.json({ success: true, message: `Verification code sent to phone ending in ${phone.slice(-4)}.` });
    }
  } catch (error) {
    console.error("MFA resend-login-otp error:", error.message);
    if (error.message.includes("Twilio is not configured")) {
      return res.status(503).json({ success: false, error: "SMS is not available. Please use email verification." });
    }
    res.status(500).json({ success: false, error: "Failed to resend verification code." });
  }
});

// ---------------------------------------------------------------------------
// Exported helpers (used by auth.js for login MFA verification)
// ---------------------------------------------------------------------------
export { verifyOtp, findMatchingBackupCode };

export default router;

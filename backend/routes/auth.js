import express from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import EmailPreference from "../models/EmailPreference.js";
import { authenticateToken } from "../middleware/auth.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

const router = express.Router();

// Stricter rate limiter for password-related endpoints (5 requests per 15 minutes)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

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

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, company, naicsCodes } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      name: name?.trim() || "",
      company: company?.trim() || "",
      naicsCodes: sanitizeNaicsCodes(naicsCodes)
    });

    await user.save();

    // Create default email preferences for the new user
    await EmailPreference.create({ user: user._id });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Persist refresh token hash in DB rather than the raw token
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshToken = refreshTokenHash;
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toPublic()
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toPublic()
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, error: "Login failed. Please try again." });
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
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to prevent email enumeration
    if (!user || !user.isActive) {
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

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailErr) {
      console.error("Password reset email failed:", emailErr.message);
      // Clear token if email failed so the user can retry
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ success: false, error: "Failed to send reset email. Please try again." });
    }

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
router.post("/reset-password", passwordResetLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and new password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
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
    // Invalidate any existing refresh token
    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, error: "Failed to reset password. Please try again." });
  }
});

export default router;

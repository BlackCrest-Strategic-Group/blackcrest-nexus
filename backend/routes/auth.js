import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required"
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "User already exists"
      });
    }

    const user = new User({
      email: email.toLowerCase(),
      password
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Registration failed"
    });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // MFA FLOW
    if (!user.totpVerified) {
      return res.json({
        success: true,
        requiresMfaSetup: true
      });
    }

    return res.json({
      success: true,
      requiresMfa: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});

/* =========================
   PROFILE
========================= */
router.get("/profile", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user
  });
});

export default router;
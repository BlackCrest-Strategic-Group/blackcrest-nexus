/**
 * opportunityIntelligence.js — Express routes for opportunity intelligence.
 *
 * Endpoints
 * ---------
 * GET  /api/opportunity-intelligence
 *   Returns the latest cached intelligence report (score, summary, analysis).
 *   If no cache exists yet, triggers a fresh collection automatically.
 *
 * POST /api/opportunity-intelligence/refresh
 *   Re-fetches from all federal opportunity databases and returns updated results.
 *   Accepts an optional JSON body:
 *     { "naicsCodes": ["541511", "541512"], "daysBack": 30 }
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import { collectAndAnalyze, getCached } from "../services/intelligenceService.js";
import { extractNaicsCodesFromText } from "../services/naicsIdentificationService.js";

const router = express.Router();

// Rate limiter: the intelligence routes hit external APIs and the DB.
// Allow 10 requests per 5 minutes per IP to prevent abuse.
const intelligenceLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many intelligence requests. Please wait before trying again." }
});

// GET /api/opportunity-intelligence
// Returns the latest cached intelligence data, or performs a broad refresh.
router.get("/", intelligenceLimiter, authenticateToken, async (req, res) => {
  try {
    const cached = getCached();
    if (cached) {
      return res.json({ success: true, ...cached });
    }

    const result = await collectAndAnalyze([], 30);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[opportunity-intelligence] GET error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve opportunity intelligence.",
    });
  }
});

// POST /api/opportunity-intelligence/refresh
// Re-fetches data. Uses explicit naicsCodes when provided; otherwise attempts
// to identify NAICS codes from caller-provided rfpText/rfiText.
router.post("/refresh", intelligenceLimiter, authenticateToken, async (req, res) => {
  try {
    const { naicsCodes, daysBack = 30, rfpText, rfiText } = req.body || {};

    if (naicsCodes !== undefined && !Array.isArray(naicsCodes)) {
      return res.status(400).json({
        success: false,
        error: "naicsCodes must be an array of strings.",
      });
    }

    let codesToUse = Array.isArray(naicsCodes) ? naicsCodes.map(String) : [];
    if (!codesToUse.length) {
      codesToUse = extractNaicsCodesFromText(rfpText || rfiText || "");
    }

    const result = await collectAndAnalyze(codesToUse, Number(daysBack) || 30);
    res.json({
      success: true,
      naicsCodesUsed: codesToUse,
      naicsSource: Array.isArray(naicsCodes) && naicsCodes.length ? "explicit" : (codesToUse.length ? "rfp_rfi_text" : "none"),
      ...result,
    });
  } catch (error) {
    console.error("[opportunity-intelligence] POST /refresh error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to refresh opportunity intelligence.",
    });
  }
});

export default router;

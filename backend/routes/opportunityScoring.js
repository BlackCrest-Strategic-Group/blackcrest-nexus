/**
 * Opportunity Scoring Route  –  POST /api/opportunity/score
 *
 * Accepts a solicitation object and an optional company profile, then runs
 * the Opportunity Scoring Engine and returns a structured JSON result:
 *
 *   {
 *     bidScore:       number (0–100),
 *     recommendation: "BID" | "CONSIDER" | "NO-BID",
 *     confidence:     number (0–100, based on data completeness),
 *     reasoning:      Array<{ factor, impact, explanation }>
 *   }
 *
 * If no companyProfile is supplied in the request body the route falls back
 * to the built-in mock profile so callers can test the engine without a DB.
 */

import express from "express";
import { scoreOpportunity } from "../services/opportunityScoringEngine.js";
import { mockCompanyProfile } from "../data/mockCompanyProfile.js";

const router = express.Router();

/**
 * POST /api/opportunity/score
 *
 * Body:
 *   solicitation   {Object}  – solicitation data (see opportunityScoringEngine.js for shape)
 *   companyProfile {Object}  – (optional) company profile; falls back to mock if omitted
 *
 * Returns:
 *   { success: true, bidScore, recommendation, confidence, reasoning }
 */
router.post("/score", (req, res) => {
  try {
    const { solicitation, companyProfile } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!solicitation || typeof solicitation !== "object" || Array.isArray(solicitation)) {
      return res.status(400).json({
        success: false,
        error: "solicitation is required and must be a plain object.",
      });
    }

    // Use the caller-supplied profile or fall back to the demo mock profile
    const profile =
      companyProfile && typeof companyProfile === "object" && !Array.isArray(companyProfile)
        ? companyProfile
        : mockCompanyProfile;

    // ── Run the scoring engine ────────────────────────────────────────────
    const result = scoreOpportunity(solicitation, profile);

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[opportunity/score] error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to score opportunity." });
  }
});

export default router;

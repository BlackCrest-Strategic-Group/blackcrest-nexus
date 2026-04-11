/**
 * Find Suppliers Route  –  POST /api/find-suppliers
 *
 * Accepts opportunity details extracted from an analysis result and returns
 * up to 5 ranked suppliers with AI-generated explanations.
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import { findSuppliers } from "../services/findSuppliersService.js";

const router = express.Router();

// Limit supplier search to 20 requests per minute per IP
const findSuppliersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many supplier search requests. Please wait before trying again." }
});

/**
 * POST /api/find-suppliers
 *
 * Body:
 *   summary   {string}  – Requirement summary or scope text
 *   naicsCode {string}  – NAICS code for the opportunity
 *   location  {string}  – Location string (optional)
 *   govReady  {boolean} – Flag indicating gov-ready suppliers only
 *
 * Response:
 *   { success: true, suppliers: [ { name, location, fitScore, govReady, matchReasons, explanation, certifications } ] }
 */
router.post("/", findSuppliersLimiter, authenticateToken, async (req, res) => {
  try {
    const { summary, naicsCode, location, govReady } = req.body;

    if (!summary && !naicsCode) {
      return res.status(400).json({
        success: false,
        error: "At least one of summary or naicsCode is required."
      });
    }

    const suppliers = await findSuppliers({ summary, naicsCode, location, govReady });

    return res.json({ success: true, suppliers });
  } catch (err) {
    console.error("[find-suppliers] error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to find suppliers." });
  }
});

export default router;

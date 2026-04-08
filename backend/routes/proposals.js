/**
 * Proposal Routes  –  /api/proposals
 *
 * CRUD for GovCon proposals plus AI-powered generation.
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import Proposal from "../models/Proposal.js";
import { generateProposalSections } from "../services/proposalService.js";

const router = express.Router();

// Rate limiter for AI generation (expensive endpoint)
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many generation requests. Please wait before trying again." }
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

// ── POST /api/proposals/generate ──────────────────────────────────
// AI-generate proposal sections; does NOT persist — returns draft for review
router.post("/generate", generateLimiter, authenticateToken, async (req, res) => {
  try {
    const {
      opportunityTitle, agency, naicsCode, setAside, requirementSummary,
      companyName, companyCapabilities
    } = req.body;

    if (!opportunityTitle && !requirementSummary) {
      return res.status(400).json({
        success: false,
        error: "opportunityTitle or requirementSummary is required."
      });
    }

    const sections = await generateProposalSections({
      opportunityTitle,
      agency,
      naicsCode,
      setAside,
      requirementSummary,
      companyName,
      companyCapabilities
    });

    return res.json({ success: true, sections });
  } catch (err) {
    console.error("[proposals/generate] error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to generate proposal." });
  }
});

// ── GET /api/proposals ────────────────────────────────────────────
router.get("/", generalLimiter, authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.user.id };
    if (status) filter.status = status;

    const total = await Proposal.countDocuments(filter);
    const proposals = await Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select("-sections -costLineItems"); // lightweight list

    res.json({ success: true, total, page: Number(page), proposals });
  } catch (err) {
    console.error("Proposal list error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch proposals." });
  }
});

// ── POST /api/proposals ───────────────────────────────────────────
router.post("/", generalLimiter, authenticateToken, async (req, res) => {
  try {
    const {
      title, opportunityTitle, solicitationNumber, agency, dueDate,
      naicsCode, setAside, requirementSummary,
      companyName, companyAddress, companyPhone, companyEmail, companyUei, companyCage,
      sections, costLineItems, totalCost, profitMarginPct, totalPrice, status
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Proposal title is required." });
    }

    const proposal = new Proposal({
      title, opportunityTitle, solicitationNumber, agency, dueDate,
      naicsCode, setAside, requirementSummary,
      companyName, companyAddress, companyPhone, companyEmail, companyUei, companyCage,
      sections: sections || [],
      costLineItems: costLineItems || [],
      totalCost: totalCost || 0,
      profitMarginPct: profitMarginPct ?? 10,
      totalPrice: totalPrice || 0,
      status: status || "draft",
      createdBy: req.user.id
    });

    await proposal.save();
    res.status(201).json({ success: true, proposal });
  } catch (err) {
    console.error("Proposal create error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create proposal." });
  }
});

// ── GET /api/proposals/:id ────────────────────────────────────────
router.get("/:id", generalLimiter, authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!proposal) return res.status(404).json({ success: false, error: "Proposal not found." });
    res.json({ success: true, proposal });
  } catch (err) {
    console.error("Proposal get error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch proposal." });
  }
});

// ── PATCH /api/proposals/:id ──────────────────────────────────────
router.patch("/:id", generalLimiter, authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!proposal) return res.status(404).json({ success: false, error: "Proposal not found." });

    const allowed = [
      "title", "opportunityTitle", "solicitationNumber", "agency", "dueDate",
      "naicsCode", "setAside", "requirementSummary",
      "companyName", "companyAddress", "companyPhone", "companyEmail", "companyUei", "companyCage",
      "sections", "costLineItems", "totalCost", "profitMarginPct", "totalPrice", "status"
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) proposal[key] = req.body[key];
    }

    await proposal.save();
    res.json({ success: true, proposal });
  } catch (err) {
    console.error("Proposal update error:", err.message);
    res.status(500).json({ success: false, error: "Failed to update proposal." });
  }
});

// ── DELETE /api/proposals/:id ─────────────────────────────────────
router.delete("/:id", generalLimiter, authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!proposal) return res.status(404).json({ success: false, error: "Proposal not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("Proposal delete error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete proposal." });
  }
});

export default router;

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { buildFundingMatch } from "../services/fundingMatchService.js";
import FundingLead from "../models/FundingLead.js";

const router = express.Router();

router.post("/match", authenticateToken, (req, res) => {
  try {
    const {
      estimatedDealValue,
      timelineMonths,
      riskLevel,
      sector,
      fundingNeedCategory
    } = req.body || {};

    const result = buildFundingMatch({
      estimatedDealValue,
      timelineMonths,
      riskLevel,
      sector,
      fundingNeedCategory
    });

    return res.json({ success: true, ...result });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to calculate lender matches." });
  }
});

router.post("/request", authenticateToken, async (req, res) => {
  try {
    const { name, company, email, phone, requestedHelp, opportunitySummary, matchedLenders, metadata } = req.body || {};

    if (!name || !company || !email) {
      return res.status(400).json({ success: false, error: "name, company, and email are required." });
    }

    const savedLead = await FundingLead.create({
      name,
      company,
      email,
      phone,
      requestedHelp,
      opportunitySummary,
      matchedLenders: Array.isArray(matchedLenders) ? matchedLenders : [],
      metadata: metadata || {}
    });

    return res.status(201).json({ success: true, fundingLead: savedLead });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to submit funding request." });
  }
});

export default router;

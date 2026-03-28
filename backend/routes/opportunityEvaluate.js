/**
 * Opportunity Evaluation Route  –  /api/opportunity/evaluate
 *
 * Runs the full Pursue / Partner / Pass decision pipeline and returns a
 * structured recommendation.
 */

import express from "express";
import { assessCapacity } from "../services/capacityAssessmentService.js";
import { checkCompliance } from "../services/complianceRulesService.js";
import { recommendSuppliers } from "../services/supplierRecommendationService.js";
import { makeDecision } from "../services/decisionEngineService.js";

const router = express.Router();

/**
 * POST /api/opportunity/evaluate
 *
 * Body:
 *   companyProfile  – company data (naicsCodes, setAsideStatus, monthlyCapacityHours,
 *                     currentUtilization, leanSavingsHours, …)
 *   opportunity     – opportunity data (naicsCodes, setAside, …)
 *   suppliers       – array of supplier objects to evaluate
 *
 * Returns:
 *   { decision, confidence, reasons, capacity, compliance, recommendedSuppliers }
 */
router.post("/evaluate", async (req, res) => {
  try {
    const { companyProfile, opportunity, suppliers } = req.body;

    // ── Basic input validation ────────────────────────────────────
    if (!companyProfile || typeof companyProfile !== "object") {
      return res.status(400).json({ success: false, error: "companyProfile is required." });
    }
    if (!opportunity || typeof opportunity !== "object") {
      return res.status(400).json({ success: false, error: "opportunity is required." });
    }

    const supplierList = Array.isArray(suppliers) ? suppliers : [];

    const {
      monthlyCapacityHours = 0,
      currentUtilization = 0,
      leanSavingsHours = 0
    } = companyProfile;

    if (
      typeof monthlyCapacityHours !== "number" ||
      typeof currentUtilization !== "number" ||
      typeof leanSavingsHours !== "number"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "companyProfile.monthlyCapacityHours, currentUtilization, and leanSavingsHours must all be numbers."
        });
    }

    // ── 1. Capacity assessment ─────────────────────────────────────
    const capacity = assessCapacity(monthlyCapacityHours, currentUtilization, leanSavingsHours);

    // ── 2. Compliance check ────────────────────────────────────────
    const compliance = checkCompliance(opportunity, companyProfile);

    // ── 3. Supplier recommendations ────────────────────────────────
    const opportunityNaics = Array.isArray(opportunity.naicsCodes) ? opportunity.naicsCodes : [];
    const recommendedSuppliers = recommendSuppliers(opportunityNaics, supplierList);

    // ── 4. Decision ────────────────────────────────────────────────
    const avgSupplierScore =
      recommendedSuppliers.length > 0
        ? recommendedSuppliers.reduce((sum, s) => sum + s.supplierScore, 0) /
          recommendedSuppliers.length
        : 0;

    const { decision, confidence, reasons } = makeDecision(capacity, compliance, avgSupplierScore);

    return res.json({
      success: true,
      decision,
      confidence,
      reasons,
      capacity,
      compliance,
      recommendedSuppliers
    });
  } catch (err) {
    console.error("[opportunity/evaluate] error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to evaluate opportunity." });
  }
});

export default router;

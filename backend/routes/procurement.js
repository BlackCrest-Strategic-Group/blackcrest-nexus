import express from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { validateOpportunityRequest } from "../middleware/validateInput.js";
import {
  analyzeOpportunity,
  analyzeText,
  decisionScore,
  getOpportunities,
  getTruthInsights,
} from "../controllers/decisionController.js";

const router = express.Router();

const decisionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Rate limit exceeded. Please retry shortly." },
});

router.post("/analyze-opportunity", decisionLimiter, requireAuth, validateOpportunityRequest, analyzeOpportunity);
router.post("/analyze-text", decisionLimiter, requireAuth, validateOpportunityRequest, analyzeText);
router.get("/opportunities", decisionLimiter, requireAuth, getOpportunities);
router.post("/decision-score", decisionLimiter, requireAuth, decisionScore);
router.get("/truth-insights", decisionLimiter, requireAuth, getTruthInsights);

export default router;

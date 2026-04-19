import { getOpportunityContext } from "../services/samService.js";
import { rankSuppliers } from "../services/supplierService.js";
import { buildDecisionScore } from "../services/decisionEngine.js";
import { generateTruthInsights, persistAnalysis } from "../services/truthEngine.js";
import AnalysisRecord from "../models/AnalysisRecord.js";
import Opportunity from "../models/Opportunity.js";

export async function analyzeOpportunity(req, res, next) {
  try {
    const context = await getOpportunityContext(req.body || {});
    const suppliers = await rankSuppliers({ naicsCode: context.naicsCode });
    const topSupplierScore = suppliers[0]?.score || 70;

    const decision = buildDecisionScore({
      ...req.body,
      text: context.text,
      contractValue: context.contractValue,
      supplierScore: topSupplierScore,
    });

    const record = await persistAnalysis({
      userId: req.user.id,
      opportunityId: context.opportunityId || null,
      title: context.title,
      naicsCode: context.naicsCode,
      category: req.body.category || "general",
      contractValue: context.contractValue,
      estimatedCost: decision.estimatedCost,
      expectedMarginPct: decision.expectedMarginPct,
      winProbabilityPct: decision.winProbabilityPct,
      riskScore: decision.riskScore,
      recommendation: decision.recommendation,
      supplierRecommendations: suppliers.map((s) => ({ supplierId: s.supplierId, supplierName: s.supplierName, score: s.score })),
      strategy: decision.strategy,
      risks: [
        decision.riskScore > 70 ? "High execution risk" : "Moderate execution risk",
        decision.expectedMarginPct < 12 ? "Margin pressure" : "Margin viable",
      ],
      outcome: "pending",
    });

    return res.json({ success: true, analysisId: record._id, context, decision, suppliers });
  } catch (err) {
    return next(err);
  }
}

export async function analyzeText(req, res, next) {
  return analyzeOpportunity(req, res, next);
}

export async function getOpportunities(req, res, next) {
  try {
    const opportunities = await Opportunity.find({ savedBy: req.user.id }).sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, opportunities });
  } catch (err) {
    return next(err);
  }
}

export async function decisionScore(req, res, next) {
  try {
    const decision = buildDecisionScore(req.body || {});
    const truthInsights = await generateTruthInsights(req.user.id);
    return res.json({ success: true, decision, truthInsights });
  } catch (err) {
    return next(err);
  }
}

export async function getTruthInsights(req, res, next) {
  try {
    const insights = await generateTruthInsights(req.user.id);
    const latest = await AnalysisRecord.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, insights, latest });
  } catch (err) {
    return next(err);
  }
}

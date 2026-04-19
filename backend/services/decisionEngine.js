import { scoreOpportunityNarrative } from "./aiService.js";

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

export function buildDecisionScore(payload) {
  const {
    text = "",
    contractValue = 0,
    competitorCount = 4,
    teamCapacity = 70,
    internalCostRatio = 0.72,
    riskTolerance = "balanced",
    supplierScore = 70,
  } = payload;

  const ai = scoreOpportunityNarrative(text);
  const competitionPenalty = Math.min(25, Math.max(0, (Number(competitorCount) - 2) * 3));
  const capacityBoost = Math.round((Number(teamCapacity) - 50) * 0.3);
  const toleranceBoost = riskTolerance === "aggressive" ? 6 : riskTolerance === "conservative" ? -6 : 0;

  const winProbabilityPct = clamp(Math.round(ai.aiScore - competitionPenalty + capacityBoost + toleranceBoost));
  const riskScore = clamp(Math.round(ai.executionComplexity * 0.55 + ai.competitiveIntensity * 0.45 - (Number(teamCapacity) - 50) * 0.2));

  const estimatedCost = Math.round(Number(contractValue || 0) * Number(internalCostRatio || 0.72));
  const supplierEffect = (Number(supplierScore) - 65) * 0.0015;
  const expectedMarginPct = clamp(Math.round((1 - Number(internalCostRatio) + supplierEffect) * 100));
  const capitalRequirement = Math.round(estimatedCost * 0.35);

  const recommendation = winProbabilityPct >= 68 && riskScore <= 62 && expectedMarginPct >= 14
    ? "BID"
    : winProbabilityPct < 45 || riskScore >= 75 || expectedMarginPct < 9
      ? "NO_BID"
      : "WATCH";

  const strategy = [
    expectedMarginPct < 15 ? "Re-negotiate BOM and labor assumptions before pricing." : "Defend margin with value-based differentiators, not discounting.",
    winProbabilityPct < 60 ? "Prime with a differentiated teaming strategy and agency relationship map." : "Lead with incumbent displacement strategy and quantified past performance.",
    riskScore > 65 ? "Add schedule reserve and compliance control gates in proposal plan." : "Use phased execution milestones to protect delivery confidence.",
  ];

  return {
    recommendation,
    winProbabilityPct,
    riskScore,
    estimatedCost,
    expectedMarginPct,
    capitalRequirement,
    ai,
    strategy,
  };
}

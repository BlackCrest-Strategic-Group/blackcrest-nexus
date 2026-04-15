import {
  ANALYSIS_MODES,
  normalizeAnalysisMode,
  evaluateRiskRules,
  detectClausesByMode
} from "./ruleEngine/index.js";

export function detectClauses(text = "", analysisMode = ANALYSIS_MODES.FEDERAL) {
  const mode = normalizeAnalysisMode(analysisMode);
  return detectClausesByMode(text, mode);
}

export function calculateBidScore(text = "", analysisMode = ANALYSIS_MODES.FEDERAL) {
  const mode = normalizeAnalysisMode(analysisMode);
  const { positives, negatives, positiveScore, negativeScore } = evaluateRiskRules(text, mode);

  const flags = [
    ...positives.map((signal) => `+ ${signal.label}`),
    ...negatives.map((signal) => `- ${signal.label}`)
  ];

  const score = Math.min(100, Math.max(0, 50 + positiveScore - negativeScore));

  const recommendation =
    score >= 75 ? "Strong Bid"
    : score >= 60 ? "Bid with Review"
    : score >= 40 ? "Borderline"
    : "No-Bid";

  const estimatedHours =
    score >= 75 ? "6-12 hours"
    : score >= 60 ? "12-20 hours"
    : score >= 40 ? "20-35 hours"
    : "35+ hours";

  const estimatedProposalCost =
    score >= 75 ? "$1,500-$4,000"
    : score >= 60 ? "$4,000-$8,000"
    : score >= 40 ? "$8,000-$15,000"
    : "$15,000+";

  const summary =
    score >= 75 ? "Opportunity appears structurally favorable."
    : score >= 60 ? "Opportunity may be viable, but merits leadership review."
    : score >= 40 ? "Opportunity has meaningful friction and should be screened carefully."
    : "Opportunity appears expensive or strategically weak.";

  return {
    bidScore: score,
    recommendation,
    estimatedHours,
    estimatedProposalCost,
    flags,
    analysisMode: mode,
    summary: [summary]
  };
}

export { ANALYSIS_MODES, normalizeAnalysisMode };

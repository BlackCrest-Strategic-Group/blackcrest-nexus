import { normalizeOpportunity } from "./opportunityNormalizer.js";
import { scoreOpportunity } from "../scoring/truthSerumScorer.js";
import { evaluateRisks } from "./riskEngine.js";
import { estimateMargin } from "./marginEstimator.js";
import { recommendAction } from "./actionRecommender.js";
import { refineTruthSerumWithAi } from "./truthSerumAiService.js";

function cap(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildSummary({ decision, winProbability, executionFeasibility, marginBand, topRisks }) {
  const opener =
    decision === "NO_BID"
      ? "Do not chase this deal"
      : decision === "CONDITIONAL BID"
        ? "This is a conditional pursuit"
        : "This is a viable bid";

  const riskLine = topRisks[0] || "Risk profile is manageable.";

  return `${opener}. Win probability sits at ${winProbability}%. Execution Reality is ${executionFeasibility}. Margin outlook is ${marginBand}. ${riskLine}`;
}

export async function analyzeTruthSerumInput({ text, source = "text", metadata = {} }) {
  const normalizedOpportunity = normalizeOpportunity({ text, source, metadata });

  const { weightedScore, complexityPressure, scoreBreakdown } = scoreOpportunity(normalizedOpportunity);
  const riskState = evaluateRisks({ normalizedOpportunity, scoreBreakdown, complexityPressure });
  const marginState = estimateMargin({ normalizedOpportunity, scoreBreakdown, complexityPressure });

  const winProbability = cap(
    weightedScore +
      (marginState.marginBand === "HIGH" ? 5 : marginState.marginBand === "LOW" ? -7 : 0) +
      (riskState.executionFeasibility === "WEAK" ? -12 : riskState.executionFeasibility === "STRONG" ? 6 : 0)
  );

  const recommendation = recommendAction({
    weightedScore,
    executionFeasibility: riskState.executionFeasibility,
    complianceRisk: riskState.complianceRisk,
    marginBand: marginState.marginBand,
    topRisks: riskState.topRisks
  });

  const baseResult = {
    decision: recommendation.decision,
    winProbability,
    marginBand: marginState.marginBand,
    effortLevel: riskState.effortLevel,
    executionFeasibility: riskState.executionFeasibility,
    complianceRisk: riskState.complianceRisk,
    topRisks: riskState.topRisks,
    keyDrivers: recommendation.keyDrivers,
    truthSummary: buildSummary({
      decision: recommendation.decision,
      winProbability,
      executionFeasibility: riskState.executionFeasibility,
      marginBand: marginState.marginBand,
      topRisks: riskState.topRisks
    }),
    recommendedAction: recommendation.recommendedAction,
    scoreBreakdown
  };

  return refineTruthSerumWithAi(baseResult, normalizedOpportunity);
}

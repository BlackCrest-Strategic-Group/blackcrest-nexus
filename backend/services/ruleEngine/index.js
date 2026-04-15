import { ANALYSIS_MODES, POSITIVE_RULES, NEGATIVE_RULES, getClauseRules } from "./rules.js";

export function normalizeAnalysisMode(mode) {
  const candidate = String(mode || "").toLowerCase().trim();
  if (candidate === ANALYSIS_MODES.COMMERCIAL) return ANALYSIS_MODES.COMMERCIAL;
  if (candidate === ANALYSIS_MODES.HYBRID) return ANALYSIS_MODES.HYBRID;
  return ANALYSIS_MODES.FEDERAL;
}

function isRuleActiveForMode(rule, mode) {
  return !rule.modes || rule.modes.includes(mode);
}

export function detectClausesByMode(text = "", mode = ANALYSIS_MODES.FEDERAL) {
  const lower = text.toLowerCase();
  const hasTerm = (term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, "i");
    return regex.test(lower);
  };

  return getClauseRules(mode)
    .filter((clause) => clause.terms.some((term) => hasTerm(term.toLowerCase())))
    .map((clause) => clause.name);
}

export function evaluateRiskRules(text = "", mode = ANALYSIS_MODES.FEDERAL) {
  const lower = text.toLowerCase();

  const positives = POSITIVE_RULES.filter((rule) =>
    isRuleActiveForMode(rule, mode) && rule.tests.some((term) => lower.includes(term))
  );
  const negatives = NEGATIVE_RULES.filter((rule) =>
    isRuleActiveForMode(rule, mode) && rule.tests.some((term) => lower.includes(term))
  );

  return {
    positives,
    negatives,
    positiveScore: positives.reduce((sum, rule) => sum + rule.points, 0),
    negativeScore: negatives.reduce((sum, rule) => sum + rule.points, 0)
  };
}

export { ANALYSIS_MODES };

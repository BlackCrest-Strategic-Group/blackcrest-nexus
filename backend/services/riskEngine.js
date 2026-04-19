function toRiskBand(score, inverse = false) {
  const value = inverse ? 100 - score : score;
  if (value >= 70) return "HIGH";
  if (value >= 45) return "MEDIUM";
  return "LOW";
}

export function evaluateRisks({ normalizedOpportunity, scoreBreakdown, complexityPressure }) {
  const text = normalizedOpportunity.normalizedText.toLowerCase();

  const topRisks = [];

  if (scoreBreakdown.timelineRealism < 50) {
    topRisks.push("Timeline is compressed versus likely delivery complexity.");
  }
  if (scoreBreakdown.complianceBurden >= 65) {
    topRisks.push("Compliance burden is heavy and will consume proposal/execution bandwidth.");
  }
  if (scoreBreakdown.supplierReadiness < 55) {
    topRisks.push("Supplier readiness is weak; sourcing continuity risk is elevated.");
  }
  if (complexityPressure >= 70) {
    topRisks.push("Execution model is complex and likely to create schedule drag.");
  }
  if (/liquidated damages|performance bond|strict sla/.test(text)) {
    topRisks.push("Contract terms include penalty exposure that can erode margin.");
  }

  const complianceRisk = toRiskBand(scoreBreakdown.complianceBurden);
  const effortLevel = complexityPressure >= 75 ? "HIGH" : complexityPressure >= 50 ? "MEDIUM" : "LOW";
  const executionFeasibility =
    scoreBreakdown.timelineRealism >= 70 && scoreBreakdown.supplierReadiness >= 65
      ? "STRONG"
      : scoreBreakdown.timelineRealism >= 50
        ? "MODERATE"
        : "WEAK";

  return {
    effortLevel,
    executionFeasibility,
    complianceRisk,
    topRisks: topRisks.slice(0, 3)
  };
}

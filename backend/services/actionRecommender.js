function pickDecision(score, executionFeasibility, complianceRisk) {
  if (score < 45 || executionFeasibility === "WEAK") return "NO_BID";
  if (score < 63 || complianceRisk === "HIGH") return "CONDITIONAL BID";
  return "BID";
}

export function recommendAction({ weightedScore, executionFeasibility, complianceRisk, marginBand, topRisks }) {
  const decision = pickDecision(weightedScore, executionFeasibility, complianceRisk);

  let recommendedAction = "Run a capture kickoff in 48 hours and start proposal staffing.";
  if (decision === "NO_BID") {
    recommendedAction = "Stand down and redirect BD effort to higher-probability pipeline targets.";
  } else if (decision === "CONDITIONAL BID") {
    recommendedAction = "Bid only if red-team closes the top risks and validates delivery plan this week.";
  }

  const keyDrivers = [
    `Capability Fit is ${weightedScore >= 65 ? "supportive" : "thin"} for this scope.`,
    `Execution Reality is ${executionFeasibility.toLowerCase()} under current timeline assumptions.`,
    `Margin Pressure is ${marginBand === "LOW" ? "elevated" : marginBand === "MEDIUM" ? "moderate" : "contained"}.`
  ];

  if (topRisks[0]) {
    keyDrivers.push(`Hidden Bid Risk: ${topRisks[0]}`);
  }

  return {
    decision,
    recommendedAction,
    keyDrivers: keyDrivers.slice(0, 3)
  };
}

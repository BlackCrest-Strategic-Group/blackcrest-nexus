function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function estimateMargin({ normalizedOpportunity, scoreBreakdown, complexityPressure }) {
  const avgValueSignal = average(normalizedOpportunity.valueSignals);
  let score = scoreBreakdown.marginPotential;

  if (avgValueSignal >= 5_000_000) score += 8;
  if (scoreBreakdown.complianceBurden >= 70) score -= 12;
  if (complexityPressure >= 70) score -= 10;
  if (scoreBreakdown.capabilityFit >= 75) score += 6;

  score = Math.max(5, Math.min(95, Math.round(score)));

  const marginBand = score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";
  const marginPressure =
    marginBand === "LOW"
      ? "HIGH"
      : marginBand === "MEDIUM"
        ? "MEDIUM"
        : "LOW";

  return { marginBand, marginPressure, marginScore: score };
}

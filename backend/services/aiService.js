const POSITIVE_SIGNALS = ["incumbent", "sole source", "follow-on", "past performance", "small business set aside", "idiq"];
const NEGATIVE_SIGNALS = ["unfunded", "classified", "prototype", "short turnaround", "first article", "liquidated damages"];

export function scoreOpportunityNarrative(text = "") {
  const normalized = String(text).toLowerCase();

  const positiveHits = POSITIVE_SIGNALS.filter((k) => normalized.includes(k)).length;
  const negativeHits = NEGATIVE_SIGNALS.filter((k) => normalized.includes(k)).length;

  const competitiveIntensity = Math.min(100, 45 + negativeHits * 12 - positiveHits * 6);
  const executionComplexity = Math.min(100, 40 + (normalized.length > 3500 ? 20 : 10) + negativeHits * 8);
  const aiScore = Math.max(10, Math.min(95, 60 + positiveHits * 7 - negativeHits * 6));

  return {
    aiScore,
    competitiveIntensity,
    executionComplexity,
    positiveSignals: positiveHits,
    negativeSignals: negativeHits,
  };
}

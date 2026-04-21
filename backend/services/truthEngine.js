import AnalysisRecord from "../models/AnalysisRecord.js";

export async function persistAnalysis(record) {
  return AnalysisRecord.create(record);
}

export async function generateTruthInsights(userId) {
  const history = await AnalysisRecord.find({ userId }).sort({ createdAt: -1 }).limit(300);
  if (!history.length) {
    return ["No prior-cycle outcomes yet. Track wins/losses to unlock benchmarking insights."];
  }

  const losses = history.filter((r) => r.outcome === "lost");
  const wins = history.filter((r) => r.outcome === "won");

  const avgWinMargin = wins.length ? wins.reduce((s, w) => s + w.expectedMarginPct, 0) / wins.length : 0;
  const avgLossMargin = losses.length ? losses.reduce((s, w) => s + w.expectedMarginPct, 0) / losses.length : 0;

  const under5mWins541330 = wins.filter((w) => w.naicsCode === "541330" && w.contractValue < 5000000).length;

  const pricingInsight = losses.length && avgLossMargin > avgWinMargin
    ? "You lose contracts in this category due to pricing misalignment and low value differentiation."
    : "Your win/loss spread suggests execution risk, not pricing, is the top loss driver.";

  const naicsInsight = under5mWins541330 > 0
    ? `You win more under $5M contracts in NAICS 541330 (${under5mWins541330} prior-cycle wins).`
    : "NAICS 541330 under-$5M pattern is not yet statistically significant.";

  const riskySupplier = history
    .flatMap((r) => r.supplierRecommendations || [])
    .sort((a, b) => a.score - b.score)[0];

  const supplierInsight = riskySupplier
    ? `Supplier ${riskySupplier.supplierName} has weaker composite delivery/cost performance. Consider alternates.`
    : "Supplier performance data is limited; collect scorecards for stronger guidance.";

  return [pricingInsight, supplierInsight, naicsInsight];
}

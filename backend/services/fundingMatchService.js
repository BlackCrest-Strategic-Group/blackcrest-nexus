import lenders from "../data/lenders.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function inferFundingTypes({ timelineMonths, riskLevel, fundingNeedCategory }) {
  const recs = new Set();

  if (timelineMonths <= 3) {
    recs.add("Invoice Factoring");
    recs.add("Working Capital Line");
  }

  if (["capex", "equipment"].includes(fundingNeedCategory)) {
    recs.add("Equipment Financing");
  }

  if (riskLevel === "Low") {
    recs.add("Term Loan");
    recs.add("SBA 7(a)");
  }

  if (!recs.size) {
    recs.add("Working Capital Line");
    recs.add("Revenue-Based Financing");
  }

  return [...recs];
}

export function buildFundingMatch(input) {
  const {
    estimatedDealValue = { min: 0, max: 0 },
    timelineMonths = 6,
    riskLevel = "Medium",
    sector = "general",
    fundingNeedCategory = "working-capital"
  } = input || {};

  const valueCenter = (Number(estimatedDealValue.min || 0) + Number(estimatedDealValue.max || 0)) / 2;

  let readiness = 82;
  if (riskLevel === "High") readiness -= 20;
  if (riskLevel === "Medium") readiness -= 10;

  if (timelineMonths <= 2) readiness -= 12;
  if (timelineMonths > 9) readiness += 4;

  const recommendedFundingTypes = inferFundingTypes({ timelineMonths, riskLevel, fundingNeedCategory });

  const scoredLenders = lenders.map((lender) => {
    let score = 0;

    if (valueCenter >= lender.minAmount && valueCenter <= lender.maxAmount) score += 35;
    if (lender.industries.includes("general") || lender.industries.includes(sector)) score += 25;
    if (lender.preferredUseCases.some((useCase) => fundingNeedCategory.includes(useCase) || useCase.includes(fundingNeedCategory))) {
      score += 15;
    }

    const matchingTypeCount = lender.fundingTypes.filter((type) => recommendedFundingTypes.includes(type)).length;
    score += matchingTypeCount * 10;

    return { ...lender, matchScore: score };
  });

  const topLenderMatches = scoredLenders.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return {
    fundingReadinessScore: clamp(Math.round(readiness), 20, 98),
    recommendedFundingTypes,
    topLenderMatches,
    explanation: `Matched using estimated value range, ${riskLevel.toLowerCase()} execution risk, ${timelineMonths}-month timeline, and ${sector} sector fit.`
  };
}

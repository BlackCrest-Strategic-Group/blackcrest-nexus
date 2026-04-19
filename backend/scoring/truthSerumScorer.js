const CAPABILITY_KEYWORDS = [
  "cyber", "cloud", "integration", "logistics", "engineering", "program management", "data", "software",
  "modernization", "security", "training", "operations", "maintenance", "ai", "analytics"
];

const COMPLIANCE_KEYWORDS = [
  "far", "dfars", "cmmc", "nist", "itars", "hipaa", "fedramp", "soc 2", "iso", "clearance",
  "performance bond", "liquidated damages", "flowdown", "small business subcontracting"
];

const COMPLEXITY_KEYWORDS = [
  "multi-site", "24/7", "global", "classified", "legacy", "transition", "surge", "mission critical"
];

function scoreFromKeywordHits(text, keywords, fullScore = 100, floor = 30) {
  const lower = String(text || "").toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  if (hits === 0) return floor;
  return Math.min(fullScore, floor + hits * 12);
}

function computeTimelineRealism({ timelineDays, text }) {
  const lower = String(text || "").toLowerCase();
  const urgencyBoost = /(asap|urgent|immediate|accelerated)/i.test(lower) ? -25 : 0;

  if (!timelineDays) return Math.max(40, 65 + urgencyBoost);
  if (timelineDays <= 30) return Math.max(20, 35 + urgencyBoost);
  if (timelineDays <= 90) return Math.max(30, 55 + urgencyBoost);
  if (timelineDays <= 180) return Math.max(50, 72 + urgencyBoost);
  return Math.max(60, 82 + urgencyBoost);
}

function computeSupplierReadiness(text) {
  const lower = String(text || "").toLowerCase();
  const penalties = ["sole source", "single point of failure", "limited suppliers", "long lead"].filter((k) =>
    lower.includes(k)
  ).length;
  return Math.max(25, 78 - penalties * 14);
}

export function scoreOpportunity(normalizedOpportunity) {
  const { normalizedText, timelineDays, naicsCodes, valueSignals } = normalizedOpportunity;

  const capabilityFit = scoreFromKeywordHits(normalizedText, CAPABILITY_KEYWORDS, 95, 42);
  const pastPerformanceFit = naicsCodes.length > 0 ? 74 : 58;
  const marginPotential = valueSignals.length > 0 ? 68 : 55;
  const timelineRealism = computeTimelineRealism({ timelineDays, text: normalizedText });

  const complianceBurdenRaw = scoreFromKeywordHits(normalizedText, COMPLIANCE_KEYWORDS, 100, 30);
  const complianceBurden = Math.min(100, Math.max(0, 100 - complianceBurdenRaw + 40));

  const supplierReadiness = computeSupplierReadiness(normalizedText);
  const complexityPressure = scoreFromKeywordHits(normalizedText, COMPLEXITY_KEYWORDS, 100, 25);

  const weightedScore = Math.round(
    capabilityFit * 0.22 +
      pastPerformanceFit * 0.16 +
      marginPotential * 0.16 +
      timelineRealism * 0.16 +
      (100 - complianceBurden) * 0.16 +
      supplierReadiness * 0.14
  );

  return {
    weightedScore,
    complexityPressure,
    scoreBreakdown: {
      capabilityFit,
      pastPerformanceFit,
      marginPotential,
      timelineRealism,
      complianceBurden,
      supplierReadiness
    }
  };
}

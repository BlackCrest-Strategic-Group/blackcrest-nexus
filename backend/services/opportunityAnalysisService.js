function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateEstimatedValue(text) {
  const currencyMatches = [...text.matchAll(/\$\s?([\d,]+(?:\.\d+)?)(?:\s*(million|billion|m|bn))?/gi)];

  const values = currencyMatches
    .map(([, amount, scale]) => {
      const base = Number(String(amount).replace(/,/g, ""));
      if (!Number.isFinite(base)) return null;

      if (!scale) return base;
      const normalized = scale.toLowerCase();
      if (normalized === "million" || normalized === "m") return base * 1_000_000;
      if (normalized === "billion" || normalized === "bn") return base * 1_000_000_000;
      return base;
    })
    .filter((v) => Number.isFinite(v));

  if (!values.length) {
    return {
      min: 100_000,
      max: 500_000,
      confidence: "low",
      basis: "No explicit pricing references detected; using default early-stage estimate range."
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spreadAdjustedMax = Math.max(max, min * 1.25);

  return {
    min: Math.round(min),
    max: Math.round(spreadAdjustedMax),
    confidence: values.length > 1 ? "high" : "medium",
    basis: "Estimated from numeric value references detected in the uploaded opportunity text."
  };
}

function detectComplexity(text) {
  const signals = [
    "integration",
    "multi-phase",
    "regulatory",
    "compliance",
    "international",
    "custom",
    "legacy migration",
    "security review",
    "supply chain"
  ];

  const matchCount = signals.reduce((count, signal) => (text.includes(signal) ? count + 1 : count), 0);

  if (matchCount >= 5) return "High";
  if (matchCount >= 2) return "Medium";
  return "Low";
}

function detectTimelineRisk(text) {
  if (/\b(asap|urgent|immediately|within\s+\d+\s+days?)\b/i.test(text)) {
    return "High";
  }
  if (/\b(q[1-4]|within\s+\d+\s+months?|phase\s+\d+)\b/i.test(text)) {
    return "Medium";
  }
  return "Low";
}

function detectExecutionRisk(text) {
  const riskSignals = ["penalty", "liquidated damages", "guarantee", "performance bond", "strict sla", "exclusive"]; 
  const hits = riskSignals.filter((signal) => text.includes(signal)).length;

  if (hits >= 3) return "High";
  if (hits >= 1) return "Medium";
  return "Low";
}

function estimateMarginBand(text) {
  if (/\b(hardware|commodities|resale)\b/i.test(text)) return "8% - 18%";
  if (/\b(services|consulting|implementation|software)\b/i.test(text)) return "18% - 35%";
  return "12% - 25%";
}

function deriveSector(text) {
  const sectors = [
    { key: "healthcare", patterns: ["healthcare", "hospital", "clinical"] },
    { key: "construction", patterns: ["construction", "civil", "build"] },
    { key: "technology", patterns: ["software", "platform", "it", "data"] },
    { key: "logistics", patterns: ["logistics", "distribution", "warehouse", "freight"] },
    { key: "energy", patterns: ["energy", "solar", "utility", "power"] },
    { key: "general", patterns: [] }
  ];

  const lower = text.toLowerCase();
  const found = sectors.find((sector) => sector.patterns.some((pattern) => lower.includes(pattern)));
  return found?.key || "general";
}

function summarize(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 420 ? `${cleaned.slice(0, 417)}...` : cleaned;
}

function scoreGoNoGo({ complexity, timelineRisk, executionRisk }) {
  let score = 78;
  if (complexity === "High") score -= 18;
  if (complexity === "Medium") score -= 9;

  if (timelineRisk === "High") score -= 16;
  if (timelineRisk === "Medium") score -= 8;

  if (executionRisk === "High") score -= 16;
  if (executionRisk === "Medium") score -= 8;

  return Math.max(20, Math.min(95, score));
}

export function analyzeOpportunityText(text, options = {}) {
  const normalizedText = String(text || "").toLowerCase();
  const estimatedValue = calculateEstimatedValue(normalizedText);
  const complexityLevel = detectComplexity(normalizedText);
  const timelineRisk = detectTimelineRisk(normalizedText);
  const executionRisk = detectExecutionRisk(normalizedText);
  const marginPotential = estimateMarginBand(normalizedText);
  const goNoGoScore = scoreGoNoGo({ complexity: complexityLevel, timelineRisk, executionRisk });

  const sector = options.sector || deriveSector(normalizedText);
  const fundingNeedCategory = options.fundingNeedCategory || "working-capital";

  return {
    opportunitySummary: summarize(text),
    estimatedValue,
    complexityLevel,
    timelineRisk,
    executionRisk,
    marginPotential,
    goNoGoScore,
    sector,
    fundingNeedCategory,
    timelineMonths: toNumber(options.timelineMonths, 6)
  };
}

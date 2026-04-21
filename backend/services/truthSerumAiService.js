import OpenAI from "openai";

const TRUTH_SERUM_SYSTEM_PROMPT = `Base analysis only on provided input and publicly available procurement knowledge. Do not infer or assume access to proprietary or internal company data.
You are Truth Serum, an elite procurement decision engine.\nYou do not summarize politely. You make executive procurement calls.\nYou are blunt, evidence-based, and commercially realistic.\n\nRules:\n- You may return BID, NO_BID, or CONDITIONAL BID only.\n- You must be willing to recommend NO_BID when economics or execution reality are weak.\n- Avoid generic AI language and motivational phrasing.\n- Focus on execution reality, margin pressure, and hidden bid risk.\n- Keep outputs concise, direct, and boardroom-ready.\n- Return strict JSON only.`;

function clampScore(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function validateTruthSerumResponse(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;

  const decisions = new Set(["BID", "NO_BID", "CONDITIONAL BID"]);
  const bands = new Set(["LOW", "MEDIUM", "HIGH"]);
  const feasibility = new Set(["WEAK", "MODERATE", "STRONG"]);

  const normalized = {
    ...fallback,
    ...payload,
    decision: decisions.has(payload.decision) ? payload.decision : fallback.decision,
    winProbability: clampScore(payload.winProbability ?? fallback.winProbability),
    marginBand: bands.has(payload.marginBand) ? payload.marginBand : fallback.marginBand,
    effortLevel: bands.has(payload.effortLevel) ? payload.effortLevel : fallback.effortLevel,
    executionFeasibility: feasibility.has(payload.executionFeasibility)
      ? payload.executionFeasibility
      : fallback.executionFeasibility,
    complianceRisk: bands.has(payload.complianceRisk) ? payload.complianceRisk : fallback.complianceRisk,
    topRisks: Array.isArray(payload.topRisks) ? payload.topRisks.slice(0, 3) : fallback.topRisks,
    keyDrivers: Array.isArray(payload.keyDrivers) ? payload.keyDrivers.slice(0, 3) : fallback.keyDrivers,
    truthSummary: String(payload.truthSummary || fallback.truthSummary).slice(0, 400),
    recommendedAction: String(payload.recommendedAction || fallback.recommendedAction).slice(0, 240),
    scoreBreakdown: {
      ...fallback.scoreBreakdown,
      ...(payload.scoreBreakdown || {})
    }
  };

  for (const key of Object.keys(normalized.scoreBreakdown)) {
    normalized.scoreBreakdown[key] = clampScore(normalized.scoreBreakdown[key]);
  }

  return normalized;
}

export async function refineTruthSerumWithAi(baseResult, normalizedOpportunity) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return baseResult;

  const openai = new OpenAI({ apiKey });
  const model = process.env.TRUTH_SERUM_MODEL || "gpt-4o-mini";

  const userPrompt = `Opportunity excerpt:\n${normalizedOpportunity.normalizedText.slice(0, 5000)}\n\nDraft decision payload:\n${JSON.stringify(baseResult, null, 2)}\n\nReturn the same schema, tighten language, and correct weak logic if needed.`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: TRUTH_SERUM_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      });

      const content = completion.choices?.[0]?.message?.content || "{}";
      const parsed = safeJsonParse(content);
      const validated = validateTruthSerumResponse(parsed, baseResult);
      return validated;
    } catch {
      // Retry once then fall back.
    }
  }

  return baseResult;
}

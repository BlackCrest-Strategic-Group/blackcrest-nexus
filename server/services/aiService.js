import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function clampScore(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(number)));
}

function parseStructuredPayload(content) {
  const trimmed = (content || "").trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("AI response did not contain a JSON object.");
  }

  const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));

  return {
    summary: parsed.summary || "Procurement process risk profile generated.",
    scores: {
      urgency: clampScore(parsed?.scores?.urgency),
      scope_volatility: clampScore(parsed?.scores?.scope_volatility),
      post_award_risk: clampScore(parsed?.scores?.post_award_risk),
    },
    insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 6) : [],
    recommendation: parsed.recommendation || "Do NOT bid / High risk engagement",
  };
}

function heuristicFallback(text) {
  const source = text.toLowerCase();
  const urgencyMatches = (source.match(/\b(urgent|immediate|asap|expedite|time-sensitive|rush)\b/g) || []).length;
  const volatilityMatches = (source.match(/\b(change|revised|update|amend|subject to change|tbd|clarification)\b/g) || []).length;
  const postAwardGap = (source.match(/\b(kpi|sla|service level|performance metric|penalty|governance)\b/g) || []).length;

  const urgency = clampScore(Math.min(100, 35 + urgencyMatches * 8));
  const scopeVolatility = clampScore(Math.min(100, 30 + volatilityMatches * 7));
  const postAwardRisk = clampScore(Math.max(20, 90 - postAwardGap * 10));

  return {
    summary: "Risk engines identified structural procurement weaknesses with financial downside exposure.",
    scores: {
      urgency,
      scope_volatility: scopeVolatility,
      post_award_risk: postAwardRisk,
    },
    insights: [
      "Reactive procurement environment detected from urgency-heavy language and compressed deadlines.",
      "High likelihood of mid-process change and delivery failure due to unstable requirement framing.",
      "No post-award management discipline detected; value leakage and margin erosion are likely.",
    ],
    recommendation: postAwardRisk > 70 || scopeVolatility > 70
      ? "Do NOT bid / High risk engagement"
      : "Bid only with strict commercial protections and governance controls",
  };
}

export async function analyzeProcurementRisk(documentText) {
  if (!client) {
    return heuristicFallback(documentText);
  }

  const prompt = `You are a procurement intelligence and risk detection expert advising executives.
You MUST detect procurement failure patterns and business impact.
Do not summarize. Do not use generic language.
Always tie findings to financial or execution impact.

Return STRICT JSON with this schema only:
{
  "summary": "string",
  "scores": {
    "urgency": 0-100,
    "scope_volatility": 0-100,
    "post_award_risk": 0-100
  },
  "insights": ["string", "string", "string"],
  "recommendation": "string"
}

Engine definitions:
1) Urgency Detection Engine: detect overuse of urgency language; insight should indicate reactive procurement behavior.
2) Scope Volatility Engine: detect inconsistent/shifting requirements; insight should indicate high mid-process change risk.
3) Post-Award Risk Engine: detect missing KPIs, SLAs, performance tracking; insight should indicate post-award value leakage risk.

RFP content:
"""
${documentText}
"""`;

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2,
      max_output_tokens: 900,
    });

    const text = response.output_text || "";
    return parseStructuredPayload(text);
  } catch (error) {
    console.error("OpenAI analysis failed, using fallback:", error.message);
    return heuristicFallback(documentText);
  }
}

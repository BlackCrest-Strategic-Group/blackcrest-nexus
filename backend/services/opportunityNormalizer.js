const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "shall", "will", "your", "you",
  "are", "have", "has", "their", "our", "not", "but", "can", "all", "any", "into",
  "must", "may", "per", "including", "within", "require", "required", "requirements"
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function extractNaics(text) {
  const matches = [...String(text || "").matchAll(/\b(?:naics\s*(?:code)?\s*[:#-]?\s*)?(\d{6})\b/gi)];
  const codes = [...new Set(matches.map((m) => m[1]))];
  return codes;
}

function parseDays(text) {
  const lower = String(text || "").toLowerCase();
  const dayMatches = [...lower.matchAll(/within\s+(\d{1,3})\s+days?/g)].map((m) => Number(m[1]));
  const monthMatches = [...lower.matchAll(/within\s+(\d{1,2})\s+months?/g)].map((m) => Number(m[1]) * 30);
  const all = [...dayMatches, ...monthMatches].filter((v) => Number.isFinite(v));
  if (!all.length) return null;
  return Math.min(...all);
}

function extractValueSignals(text) {
  const matches = [...String(text || "").matchAll(/\$\s?([\d,]+(?:\.\d+)?)(?:\s*(m|million|b|bn|billion))?/gi)];
  return matches
    .map(([, amount, scale]) => {
      const base = Number(String(amount).replace(/,/g, ""));
      if (!Number.isFinite(base)) return null;
      const s = String(scale || "").toLowerCase();
      if (s === "m" || s === "million") return base * 1_000_000;
      if (s === "b" || s === "bn" || s === "billion") return base * 1_000_000_000;
      return base;
    })
    .filter((v) => Number.isFinite(v));
}

export function normalizeOpportunity({ text, source = "text", metadata = {} }) {
  const rawText = String(text || "").trim();
  const normalizedText = rawText.replace(/\s+/g, " ").trim();
  const tokens = tokenize(normalizedText);
  const naicsCodes = extractNaics(normalizedText);
  const timelineDays = parseDays(normalizedText);
  const valueSignals = extractValueSignals(normalizedText);

  return {
    source,
    metadata,
    rawText,
    normalizedText,
    tokens,
    tokenCount: tokens.length,
    naicsCodes,
    timelineDays,
    valueSignals,
    analysisMode: metadata.analysisMode || "federal"
  };
}

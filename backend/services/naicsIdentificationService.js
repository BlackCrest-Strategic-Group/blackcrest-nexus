/**
 * NAICS identification helpers.
 *
 * Extracts NAICS codes directly from solicitation / RFP / RFI text so routes
 * can tailor analysis to the specific document instead of static defaults.
 */

const NAICS_CODE_REGEX = /\b(?:naics(?:\s+code)?\s*[:#-]?\s*)?(\d{6})\b/gi;

/**
 * Extract all unique 6-digit NAICS codes from freeform text.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractNaicsCodesFromText(text = "") {
  if (!text || typeof text !== "string") return [];

  const found = new Set();
  let match;
  while ((match = NAICS_CODE_REGEX.exec(text)) !== null) {
    const candidate = String(match[1] || "").trim();
    if (/^\d{6}$/.test(candidate)) {
      found.add(candidate);
    }
  }
  return Array.from(found);
}

/**
 * Extract a single "primary" NAICS code from text.
 * This currently uses first appearance order from the solicitation.
 *
 * @param {string} text
 * @returns {string|null}
 */
export function extractPrimaryNaicsCodeFromText(text = "") {
  const codes = extractNaicsCodesFromText(text);
  return codes.length ? codes[0] : null;
}


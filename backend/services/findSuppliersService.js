/**
 * Find Suppliers Service
 *
 * Ranks mock suppliers against an opportunity using NAICS code match,
 * capability keyword overlap, and optional location relevance.
 * After ranking, calls OpenAI to generate a one-line explanation per supplier.
 */

import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Mock supplier dataset
// ---------------------------------------------------------------------------
const MOCK_SUPPLIERS = [
  {
    id: "s001",
    name: "TechForce Solutions",
    location: "Arlington, VA",
    naicsCodes: ["541511", "541512", "541519"],
    capabilities: ["software development", "IT services", "cybersecurity", "cloud migration"],
    govReady: true,
    certifications: ["ISO 9001", "CMMI Level 3"]
  },
  {
    id: "s002",
    name: "Federal Systems Group",
    location: "Bethesda, MD",
    naicsCodes: ["541511", "541330", "541618"],
    capabilities: ["systems engineering", "IT consulting", "program management", "defense contracting"],
    govReady: true,
    certifications: ["ISO 27001", "CMMI Level 2"]
  },
  {
    id: "s003",
    name: "GovTech Partners",
    location: "Reston, VA",
    naicsCodes: ["541519", "541512", "541690"],
    capabilities: ["data analytics", "cloud services", "network infrastructure", "cybersecurity"],
    govReady: true,
    certifications: ["FedRAMP Ready", "ISO 9001"]
  },
  {
    id: "s004",
    name: "Apex Contract Services",
    location: "McLean, VA",
    naicsCodes: ["541511", "541715", "336413"],
    capabilities: ["software development", "R&D", "aerospace", "engineering services"],
    govReady: true,
    certifications: ["CMMI Level 3", "AS9100"]
  },
  {
    id: "s005",
    name: "BlueRidge IT Solutions",
    location: "Chantilly, VA",
    naicsCodes: ["541512", "541519", "518210"],
    capabilities: ["IT infrastructure", "cloud hosting", "managed services", "cybersecurity"],
    govReady: true,
    certifications: ["ISO 27001", "FedRAMP Authorized"]
  },
  {
    id: "s006",
    name: "Patriot Defense Technologies",
    location: "Huntsville, AL",
    naicsCodes: ["336413", "541715", "336414"],
    capabilities: ["aerospace", "defense manufacturing", "engineering", "testing and evaluation"],
    govReady: true,
    certifications: ["AS9100", "ITAR registered"]
  },
  {
    id: "s007",
    name: "ClearPath Analytics",
    location: "Washington, DC",
    naicsCodes: ["541690", "541511", "519130"],
    capabilities: ["data analytics", "AI/ML", "business intelligence", "program analysis"],
    govReady: true,
    certifications: ["ISO 9001", "SOC 2 Type II"]
  },
  {
    id: "s008",
    name: "Summit Logistics Group",
    location: "Norfolk, VA",
    naicsCodes: ["488510", "541614", "493110"],
    capabilities: ["logistics", "supply chain management", "transportation", "warehousing"],
    govReady: true,
    certifications: ["ISO 9001", "C-TPAT"]
  },
  {
    id: "s009",
    name: "Nexus Engineering LLC",
    location: "San Diego, CA",
    naicsCodes: ["541330", "541310", "236210"],
    capabilities: ["mechanical engineering", "facility design", "construction management", "environmental services"],
    govReady: true,
    certifications: ["PE licensed", "ISO 9001"]
  },
  {
    id: "s010",
    name: "Horizon Cyber Defense",
    location: "Colorado Springs, CO",
    naicsCodes: ["541519", "541511", "561621"],
    capabilities: ["cybersecurity", "penetration testing", "incident response", "security operations"],
    govReady: true,
    certifications: ["CMMC Level 3", "ISO 27001", "FedRAMP Authorized"]
  }
];

// ---------------------------------------------------------------------------
// Ranking helpers
// ---------------------------------------------------------------------------

/** Score NAICS overlap (0–40 points). */
function scoreNaics(supplierCodes, opportunityNaics) {
  if (!opportunityNaics) return 0;
  const target = opportunityNaics.trim();
  if (!target) return 0;

  // Exact match
  if (supplierCodes.includes(target)) return 40;

  // 4-digit prefix match (same subsector)
  const prefix4 = target.slice(0, 4);
  if (supplierCodes.some((c) => c.startsWith(prefix4))) return 25;

  // 2-digit sector match
  const prefix2 = target.slice(0, 2);
  if (supplierCodes.some((c) => c.startsWith(prefix2))) return 10;

  return 0;
}

/** Score keyword match against capabilities (0–40 points). */
function scoreKeywords(capabilities, summaryText) {
  if (!summaryText) return 0;
  const lower = summaryText.toLowerCase();
  const matched = capabilities.filter((cap) => lower.includes(cap.toLowerCase()));
  if (matched.length === 0) return 0;
  // Scale: each matched capability worth up to 8 pts, capped at 40
  return Math.min(matched.length * 8, 40);
}

/** Score location proximity (0–20 points). */
function scoreLocation(supplierLocation, opportunityLocation) {
  if (!opportunityLocation || !supplierLocation) return 0;
  const oppLower = opportunityLocation.toLowerCase().trim();
  const supLower = supplierLocation.toLowerCase().trim();

  // Same full location string
  if (oppLower === supLower) return 20;

  // Same city AND state (e.g. "arlington, va" matches "arlington, va")
  const oppParts = oppLower.split(",").map((p) => p.trim());
  const supParts = supLower.split(",").map((p) => p.trim());
  if (
    oppParts.length >= 2 &&
    supParts.length >= 2 &&
    oppParts[0] === supParts[0] &&
    oppParts[oppParts.length - 1] === supParts[supParts.length - 1]
  ) {
    return 20;
  }

  // Same state (last token after comma)
  const oppState = oppParts[oppParts.length - 1];
  const supState = supParts[supParts.length - 1];
  if (oppState && supState && oppState === supState) return 10;

  // DC-Metro proximity heuristic
  const metroStates = ["va", "md", "dc", "virginia", "maryland"];
  if (
    metroStates.some((k) => oppState === k) &&
    metroStates.some((k) => supState === k)
  ) {
    return 5;
  }

  return 0;
}

/** Build a ranked list of up to `topN` suppliers from the given pool. */
function rankSuppliers({ summary, naicsCode, location }, pool = MOCK_SUPPLIERS, topN = 5) {
  const scored = pool.map((s) => {
    const naicsScore = scoreNaics(s.naicsCodes, naicsCode);
    const keywordScore = scoreKeywords(s.capabilities, summary);
    const locationScore = scoreLocation(s.location, location);
    const fitScore = naicsScore + keywordScore + locationScore;

    const matchReasons = [];
    if (naicsScore >= 40) matchReasons.push("Exact NAICS code match");
    else if (naicsScore >= 25) matchReasons.push("NAICS subsector match");
    else if (naicsScore >= 10) matchReasons.push("NAICS sector match");

    const matchedCaps = s.capabilities.filter(
      (cap) => summary && summary.toLowerCase().includes(cap.toLowerCase())
    );
    if (matchedCaps.length > 0) {
      matchReasons.push(`Capability match: ${matchedCaps.slice(0, 3).join(", ")}`);
    }

    if (locationScore >= 20) matchReasons.push("Same city");
    else if (locationScore >= 10) matchReasons.push("Same state");
    else if (locationScore > 0) matchReasons.push("DC-Metro region");

    return { ...s, fitScore, matchReasons };
  });

  return scored
    .filter((s) => s.fitScore > 0)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, topN);
}

// ---------------------------------------------------------------------------
// OpenAI explanation generator
// ---------------------------------------------------------------------------

async function generateExplanations(suppliers, opportunitySummary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Graceful fallback: construct a basic explanation without AI
    return suppliers.map((s) => ({
      ...s,
      explanation: `${s.name} is a gov-ready supplier in ${s.location} with expertise in ${s.capabilities.slice(0, 2).join(" and ")}.`
    }));
  }

  const openai = new OpenAI({ apiKey });

  const results = await Promise.all(
    suppliers.map(async (s) => {
      try {
        const prompt = `You are a GovCon analyst. In one sentence (max 25 words), explain why "${s.name}" located in ${s.location} is a good fit for this government opportunity: "${opportunitySummary || "government services contract"}". Focus on their capabilities: ${s.capabilities.join(", ")}.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 60,
          temperature: 0.4
        });

        const explanation = completion.choices[0]?.message?.content?.trim() || "";
        return { ...s, explanation };
      } catch {
        return {
          ...s,
          explanation: `${s.name} offers strong capabilities in ${s.capabilities.slice(0, 2).join(" and ")} relevant to this opportunity.`
        };
      }
    })
  );

  return results;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Find and rank top suppliers for an opportunity, then enrich with AI explanations.
 *
 * @param {object} params
 * @param {string} params.summary  - Opportunity requirement summary / scope text
 * @param {string} params.naicsCode - NAICS code
 * @param {string} params.location  - Location string (optional)
 * @param {boolean} params.govReady - Filter flag (currently all mock suppliers are govReady)
 * @returns {Promise<Array>} Top-ranked suppliers with fitScore, matchReasons, explanation
 */
export async function findSuppliers({ summary, naicsCode, location, govReady }) {
  // Apply govReady filter if explicitly requested
  const pool = govReady === true
    ? MOCK_SUPPLIERS.filter((s) => s.govReady === true)
    : MOCK_SUPPLIERS;

  const ranked = rankSuppliers({ summary, naicsCode, location }, pool);

  if (ranked.length === 0) return [];

  const enriched = await generateExplanations(ranked, summary);
  return enriched;
}

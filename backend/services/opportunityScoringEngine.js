/**
 * Opportunity Scoring Engine
 *
 * Evaluates a federal contracting solicitation against a company profile
 * and returns a structured score, recommendation, confidence level, and
 * weighted reasoning array.
 *
 * ─── Scoring factors and weights ──────────────────────────────────────────
 *  Factor                     │ Max pts │ Direction │ Notes
 * ────────────────────────────┼─────────┼───────────┼───────────────────────
 *  NAICS match                │   25    │ positive  │ Primary alignment
 *  Set-aside fit              │   20    │ positive  │ Eligibility gate
 *  Contract value fit         │   15    │ positive  │ Within win-range
 *  Agency relevance           │   10    │ positive  │ Prior agency exp.
 *  Overall capability align   │   10    │ positive  │ Keyword/profile match
 *  Geographic fit             │    5    │ positive  │ States served
 *  FAR/DFARS clause burden    │  –15    │ negative  │ Compliance overhead
 *  Delivery/perf. complexity  │  –10    │ negative  │ Timeline/staffing risk
 *  Missing certifications     │  –10    │ negative  │ Required certs absent
 * ─────────────────────────────────────────────────────────────────────────
 *  Baseline                   │   30    │ –         │ Applied before factors
 *
 * Final bidScore is clamped to [0, 100].
 *
 * Recommendation thresholds:
 *   bidScore >= 70  → "BID"
 *   bidScore >= 45  → "CONSIDER"
 *   bidScore <  45  → "NO-BID"
 *
 * Confidence is proportional to how many solicitation fields are present
 * (more data = higher confidence).
 */

// ── Certification / compliance keywords that signal extra burden ─────────────
const CERT_BURDEN_TERMS = [
  "cmmc",
  "nist 800-171",
  "dcma",
  "cybersecurity maturity",
  "iso 9001",
  "as9100",
  "soc 2",
  "fedramp",
  "itar",
  "ear",
];

// ── FAR/DFARS clauses that materially increase proposal / performance burden ──
const HEAVY_FAR_CLAUSES = [
  "252.204-7012", // Safeguarding Covered Defense Information (DFARS)
  "252.204-7020", // NIST SP 800-171 DoD Assessment (DFARS)
  "52.219-14",    // Limitations on Subcontracting (FAR)
  "52.222-26",    // Equal Opportunity (FAR) – minor but adds compliance overhead
  "52.230-2",     // Cost Accounting Standards (FAR)
  "52.215-2",     // Audit and Records – Negotiation (FAR)
  "252.215-7008", // Only One Offer (DFARS)
];

// ── Delivery / performance complexity signals ─────────────────────────────────
const COMPLEXITY_SIGNALS = [
  "24-hour response",
  "within 24 hours",
  "within 48 hours",
  "urgent",
  "expedited",
  "immediate response",
  "key personnel",
  "minimum staffing",
  "staffing plan",
  "on-site",
  "classified",
  "secret clearance",
  "top secret",
  "sci",
  "facility clearance",
];

// ── Agency relevance — agencies that are highly relevant to govcon SMBs ───────
const FRIENDLY_AGENCIES = [
  "small business administration",
  "sba",
  "department of veterans affairs",
  "va ",
  "usda",
  "department of agriculture",
  "gsa",
  "general services administration",
  "hhs",
  "department of health",
  "department of labor",
  "dot",
  "department of transportation",
];

/**
 * Score a single solicitation against a company profile.
 *
 * @param {Object} solicitation
 *   @param {string|string[]} [solicitation.naicsCodes]     – solicitation NAICS code(s)
 *   @param {string}          [solicitation.setAside]       – set-aside type (e.g. "SDVOSB")
 *   @param {number}          [solicitation.contractValue]  – estimated contract value (USD)
 *   @param {string}          [solicitation.agency]         – issuing agency name
 *   @param {string}          [solicitation.description]    – full solicitation text/description
 *   @param {string[]}        [solicitation.farClauses]     – FAR/DFARS clause numbers detected
 *   @param {string[]}        [solicitation.certifications] – certifications explicitly required
 *   @param {string[]}        [solicitation.statesRequired] – delivery state(s)
 *   @param {string}          [solicitation.title]          – solicitation title
 *
 * @param {Object} companyProfile
 *   @param {string[]} [companyProfile.naicsCodes]       – company NAICS codes
 *   @param {string[]} [companyProfile.setAsideStatus]   – company set-aside eligibility
 *   @param {string[]} [companyProfile.capabilities]     – capability keywords
 *   @param {number}   [companyProfile.minContractValue] – min desirable contract value
 *   @param {number}   [companyProfile.maxContractValue] – max desirable contract value
 *   @param {string[]} [companyProfile.preferredAgencies]– preferred agency names
 *   @param {string[]} [companyProfile.statesServed]     – states company can serve
 *   @param {string[]} [companyProfile.certifications]   – certifications the company holds
 *
 * @returns {{
 *   bidScore: number,
 *   recommendation: "BID"|"CONSIDER"|"NO-BID",
 *   confidence: number,
 *   reasoning: Array<{factor: string, impact: number, explanation: string}>
 * }}
 */
export function scoreOpportunity(solicitation = {}, companyProfile = {}) {
  const reasoning = [];
  let score = 30; // baseline — assume a neutral/unknown opportunity

  // Normalize inputs
  const solNaics = normalizeStringArray(solicitation.naicsCodes);
  const coNaics   = normalizeStringArray(companyProfile.naicsCodes);
  const solSetAside = (solicitation.setAside || "").toLowerCase().trim();
  const coSetAsides  = normalizeStringArray(companyProfile.setAsideStatus).map((s) => s.toLowerCase());
  const description  = (solicitation.description || solicitation.title || "").toLowerCase();
  const farClauses   = normalizeStringArray(solicitation.farClauses).map((s) => s.toLowerCase());
  const solCerts     = normalizeStringArray(solicitation.certifications).map((s) => s.toLowerCase());
  const coCerts      = normalizeStringArray(companyProfile.certifications).map((s) => s.toLowerCase());
  const solStates    = normalizeStringArray(solicitation.statesRequired).map((s) => s.toLowerCase());
  const coStates     = normalizeStringArray(companyProfile.statesServed).map((s) => s.toLowerCase());
  const coCapabilities = normalizeStringArray(companyProfile.capabilities).map((s) => s.toLowerCase());
  const coAgencies   = normalizeStringArray(companyProfile.preferredAgencies).map((s) => s.toLowerCase());
  const agency       = (solicitation.agency || "").toLowerCase();

  // ── 1. NAICS match (weight: 25) ──────────────────────────────────────────
  {
    const MAX = 25;
    if (solNaics.length === 0 || coNaics.length === 0) {
      // Not enough data to score — partial neutral
      reasoning.push({
        factor: "NAICS Match",
        impact: 0,
        explanation: "NAICS codes not available for comparison — unable to assess alignment.",
      });
    } else {
      const exactMatches = solNaics.filter((n) => coNaics.includes(n));
      const partialMatches = solNaics.filter(
        (n) => !exactMatches.includes(n) && coNaics.some((c) => n.startsWith(c.slice(0, 4)) || c.startsWith(n.slice(0, 4)))
      );

      if (exactMatches.length > 0) {
        score += MAX;
        reasoning.push({
          factor: "NAICS Match",
          impact: MAX,
          explanation: `Exact NAICS match on ${exactMatches.join(", ")} — strong primary alignment.`,
        });
      } else if (partialMatches.length > 0) {
        const pts = Math.round(MAX * 0.5);
        score += pts;
        reasoning.push({
          factor: "NAICS Match",
          impact: pts,
          explanation: `Partial NAICS match (sector/subsector) on ${partialMatches.join(", ")} — moderate alignment.`,
        });
      } else {
        const penalty = -15;
        score += penalty;
        reasoning.push({
          factor: "NAICS Match",
          impact: penalty,
          explanation: `No NAICS overlap between solicitation (${solNaics.join(", ")}) and company profile (${coNaics.join(", ")}).`,
        });
      }
    }
  }

  // ── 2. Set-aside fit (weight: 20) ────────────────────────────────────────
  {
    const MAX = 20;
    if (!solSetAside || solSetAside === "none" || solSetAside === "unrestricted") {
      // Unrestricted — everyone can bid, no advantage or disadvantage
      const pts = Math.round(MAX * 0.4);
      score += pts;
      reasoning.push({
        factor: "Set-Aside Fit",
        impact: pts,
        explanation: "Opportunity is unrestricted — open competition, no eligibility advantage or restriction.",
      });
    } else if (coSetAsides.length === 0) {
      reasoning.push({
        factor: "Set-Aside Fit",
        impact: 0,
        explanation: `Solicitation requires ${solicitation.setAside} set-aside but company set-aside status is not specified.`,
      });
    } else if (coSetAsides.some((s) => solSetAside.includes(s) || s.includes(solSetAside))) {
      score += MAX;
      reasoning.push({
        factor: "Set-Aside Fit",
        impact: MAX,
        explanation: `Company qualifies for the ${solicitation.setAside} set-aside — significantly narrows competition.`,
      });
    } else {
      const penalty = -20;
      score += penalty;
      reasoning.push({
        factor: "Set-Aside Fit",
        impact: penalty,
        explanation: `Company does not hold the required ${solicitation.setAside} designation — may be ineligible to bid.`,
      });
    }
  }

  // ── 3. Contract value fit (weight: 15) ───────────────────────────────────
  {
    const MAX = 15;
    const val = solicitation.contractValue;
    const minVal = companyProfile.minContractValue;
    const maxVal = companyProfile.maxContractValue;

    if (!val || (!minVal && !maxVal)) {
      reasoning.push({
        factor: "Contract Value Fit",
        impact: 0,
        explanation: "Contract value or company win-range not provided — unable to assess value fit.",
      });
    } else if ((!minVal || val >= minVal) && (!maxVal || val <= maxVal)) {
      score += MAX;
      reasoning.push({
        factor: "Contract Value Fit",
        impact: MAX,
        explanation: `Contract value of $${val.toLocaleString()} falls within company's target range — good fit.`,
      });
    } else if (maxVal && val > maxVal) {
      const overage = val / maxVal;
      const penalty = overage > 3 ? -MAX : -Math.round(MAX * 0.5);
      score += penalty;
      reasoning.push({
        factor: "Contract Value Fit",
        impact: penalty,
        explanation: `Contract value ($${val.toLocaleString()}) exceeds company's maximum target ($${maxVal.toLocaleString()}) — may be beyond capacity.`,
      });
    } else {
      // Below minimum — smaller than preferred
      const pts = Math.round(MAX * 0.3);
      score += pts;
      reasoning.push({
        factor: "Contract Value Fit",
        impact: pts,
        explanation: `Contract value ($${val.toLocaleString()}) is below company's typical minimum ($${minVal?.toLocaleString()}) — may not be worth proposal investment.`,
      });
    }
  }

  // ── 4. Agency relevance (weight: 10) ─────────────────────────────────────
  {
    const MAX = 10;
    if (!agency) {
      reasoning.push({
        factor: "Agency Relevance",
        impact: 0,
        explanation: "Issuing agency not specified — unable to assess relevance.",
      });
    } else if (
      coAgencies.some((a) => agency.includes(a) || a.includes(agency)) ||
      FRIENDLY_AGENCIES.some((a) => agency.includes(a))
    ) {
      score += MAX;
      reasoning.push({
        factor: "Agency Relevance",
        impact: MAX,
        explanation: `Agency (${solicitation.agency}) is a preferred or SMB-friendly contracting agency — favorable history.`,
      });
    } else {
      const pts = Math.round(MAX * 0.4);
      score += pts;
      reasoning.push({
        factor: "Agency Relevance",
        impact: pts,
        explanation: `Agency (${solicitation.agency}) is not in preferred list — neutral relevance.`,
      });
    }
  }

  // ── 5. Geographic fit (weight: 5) ────────────────────────────────────────
  {
    const MAX = 5;
    if (solStates.length === 0 || coStates.length === 0) {
      reasoning.push({
        factor: "Geographic Fit",
        impact: 0,
        explanation: "Geographic requirements or company service area not specified.",
      });
    } else {
      const geoMatch = solStates.some((s) => coStates.includes(s) || coStates.includes("nationwide") || coStates.includes("remote"));
      if (geoMatch) {
        score += MAX;
        reasoning.push({
          factor: "Geographic Fit",
          impact: MAX,
          explanation: `Work location (${solicitation.statesRequired}) matches company service area.`,
        });
      } else {
        const penalty = -5;
        score += penalty;
        reasoning.push({
          factor: "Geographic Fit",
          impact: penalty,
          explanation: `Work location (${solicitation.statesRequired}) is outside company's served states — may require subcontractor or expansion.`,
        });
      }
    }
  }

  // ── 6. Overall capability alignment (weight: 10) ─────────────────────────
  {
    const MAX = 10;
    if (coCapabilities.length === 0 || !description) {
      reasoning.push({
        factor: "Capability Alignment",
        impact: 0,
        explanation: "Company capabilities or solicitation description not provided — alignment unknown.",
      });
    } else {
      const matched = coCapabilities.filter((cap) => description.includes(cap));
      const ratio = matched.length / coCapabilities.length;

      if (ratio >= 0.5) {
        score += MAX;
        reasoning.push({
          factor: "Capability Alignment",
          impact: MAX,
          explanation: `${matched.length} of ${coCapabilities.length} company capabilities match solicitation description — strong profile alignment.`,
        });
      } else if (ratio > 0) {
        const pts = Math.round(MAX * ratio);
        score += pts;
        reasoning.push({
          factor: "Capability Alignment",
          impact: pts,
          explanation: `${matched.length} of ${coCapabilities.length} company capabilities match — partial profile alignment.`,
        });
      } else {
        const penalty = -5;
        score += penalty;
        reasoning.push({
          factor: "Capability Alignment",
          impact: penalty,
          explanation: "No company capabilities detected in solicitation description — potential profile mismatch.",
        });
      }
    }
  }

  // ── 7. FAR/DFARS clause burden (weight: –15) ─────────────────────────────
  {
    // Check both explicit farClauses list and description text
    const allClauseText = [...farClauses, description].join(" ");
    const heavyClauses = HEAVY_FAR_CLAUSES.filter((c) => allClauseText.includes(c.toLowerCase()));

    if (heavyClauses.length === 0) {
      reasoning.push({
        factor: "FAR/DFARS Burden",
        impact: 0,
        explanation: "No high-burden FAR/DFARS clauses detected — standard compliance overhead.",
      });
    } else if (heavyClauses.length <= 2) {
      const penalty = -8;
      score += penalty;
      reasoning.push({
        factor: "FAR/DFARS Burden",
        impact: penalty,
        explanation: `${heavyClauses.length} high-burden clause(s) detected (${heavyClauses.join(", ")}) — elevated compliance overhead.`,
      });
    } else {
      const penalty = -15;
      score += penalty;
      reasoning.push({
        factor: "FAR/DFARS Burden",
        impact: penalty,
        explanation: `${heavyClauses.length} high-burden clauses detected (${heavyClauses.join(", ")}) — significant compliance and cost risk.`,
      });
    }
  }

  // ── 8. Delivery / performance complexity (weight: –10) ───────────────────
  {
    const complexSignals = COMPLEXITY_SIGNALS.filter((s) => description.includes(s));
    if (complexSignals.length === 0) {
      reasoning.push({
        factor: "Delivery Complexity",
        impact: 0,
        explanation: "No high-complexity delivery signals detected — standard performance requirements.",
      });
    } else if (complexSignals.length <= 2) {
      const penalty = -5;
      score += penalty;
      reasoning.push({
        factor: "Delivery Complexity",
        impact: penalty,
        explanation: `${complexSignals.length} complexity signal(s) detected (e.g., "${complexSignals[0]}") — moderate performance risk.`,
      });
    } else {
      const penalty = -10;
      score += penalty;
      reasoning.push({
        factor: "Delivery Complexity",
        impact: penalty,
        explanation: `${complexSignals.length} complexity signals detected — high performance burden (${complexSignals.slice(0, 3).join(", ")}).`,
      });
    }
  }

  // ── 9. Missing certifications / compliance requirements (weight: –10) ─────
  {
    // Combine explicit cert list and description scanning
    const descCertMatches = CERT_BURDEN_TERMS.filter((t) => description.includes(t));
    const allRequired = [...new Set([...solCerts, ...descCertMatches])];

    if (allRequired.length === 0) {
      reasoning.push({
        factor: "Certification Requirements",
        impact: 0,
        explanation: "No special certification requirements detected.",
      });
    } else {
      const missing = allRequired.filter(
        (req) => !coCerts.some((held) => held.includes(req) || req.includes(held))
      );

      if (missing.length === 0) {
        const pts = 5;
        score += pts;
        reasoning.push({
          factor: "Certification Requirements",
          impact: pts,
          explanation: `Company holds all required certifications (${allRequired.join(", ")}) — no compliance gap.`,
        });
      } else {
        const penalty = missing.length >= 2 ? -10 : -5;
        score += penalty;
        reasoning.push({
          factor: "Certification Requirements",
          impact: penalty,
          explanation: `${missing.length} required certification(s) not held: ${missing.join(", ")} — acquisition or teaming needed.`,
        });
      }
    }
  }

  // ── Clamp to [0, 100] ────────────────────────────────────────────────────
  const bidScore = Math.min(100, Math.max(0, Math.round(score)));

  // ── Recommendation ───────────────────────────────────────────────────────
  const recommendation = bidScore >= 70 ? "BID" : bidScore >= 45 ? "CONSIDER" : "NO-BID";

  // ── Confidence (based on data completeness) ──────────────────────────────
  const dataFields = [
    solNaics.length > 0,
    !!solSetAside,
    !!solicitation.contractValue,
    !!agency,
    !!solicitation.description,
    farClauses.length > 0 || HEAVY_FAR_CLAUSES.some((c) => description.includes(c.toLowerCase())),
    solStates.length > 0,
    solCerts.length > 0 || CERT_BURDEN_TERMS.some((t) => description.includes(t)),
  ];
  const filledFields = dataFields.filter(Boolean).length;
  const confidence = Math.round((filledFields / dataFields.length) * 100);

  return {
    bidScore,
    recommendation,
    confidence,
    reasoning,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize a value to an array of non-empty strings.
 * Accepts a string, array of strings, or undefined/null.
 *
 * @param {string|string[]|undefined|null} value
 * @returns {string[]}
 */
function normalizeStringArray(value) {
  if (!value) return [];
  if (typeof value === "string") return value ? [value] : [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim() !== "");
  return [];
}

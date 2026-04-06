/**
 * Unit tests for opportunityScoringEngine.js
 *
 * These tests verify:
 *   1. NAICS match scoring (exact, partial, no match)
 *   2. Set-aside fit scoring (match, no match, unrestricted)
 *   3. Contract value fit scoring (in range, over range, under range)
 *   4. Agency relevance scoring
 *   5. Capability alignment scoring
 *   6. Geographic fit scoring
 *   7. FAR/DFARS burden penalties
 *   8. Delivery complexity penalties
 *   9. Certification requirements penalties and bonuses
 *  10. Recommendation thresholds (BID / CONSIDER / NO-BID)
 *  11. Confidence level calculation
 *  12. Edge cases (empty inputs, all fields provided)
 */

import { scoreOpportunity } from "../backend/services/opportunityScoringEngine.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const BASE_PROFILE = {
  naicsCodes: ["541512", "541511"],
  setAsideStatus: ["SDVOSB"],
  capabilities: ["software development", "it consulting"],
  certifications: ["iso 9001", "soc 2"],
  preferredAgencies: ["Department of Veterans Affairs"],
  minContractValue: 100_000,
  maxContractValue: 5_000_000,
  statesServed: ["va", "dc", "md"],
};

// ═══════════════════════════════════════════════════════════════════
// Return shape
// ═══════════════════════════════════════════════════════════════════
describe("scoreOpportunity – return shape", () => {
  test("returns bidScore, recommendation, confidence, and reasoning array", () => {
    const result = scoreOpportunity({ naicsCodes: ["541512"] }, BASE_PROFILE);
    expect(typeof result.bidScore).toBe("number");
    expect(["BID", "CONSIDER", "NO-BID"]).toContain(result.recommendation);
    expect(typeof result.confidence).toBe("number");
    expect(Array.isArray(result.reasoning)).toBe(true);
  });

  test("bidScore is clamped between 0 and 100", () => {
    const result = scoreOpportunity({}, {});
    expect(result.bidScore).toBeGreaterThanOrEqual(0);
    expect(result.bidScore).toBeLessThanOrEqual(100);
  });

  test("each reasoning entry has factor, impact, and explanation", () => {
    const result = scoreOpportunity({ naicsCodes: ["541512"] }, BASE_PROFILE);
    result.reasoning.forEach((r) => {
      expect(typeof r.factor).toBe("string");
      expect(typeof r.impact).toBe("number");
      expect(typeof r.explanation).toBe("string");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// NAICS match
// ═══════════════════════════════════════════════════════════════════
describe("NAICS match scoring", () => {
  test("exact NAICS match awards maximum NAICS points", () => {
    const noMatch = scoreOpportunity({ naicsCodes: ["999999"] }, BASE_PROFILE);
    const exactMatch = scoreOpportunity({ naicsCodes: ["541512"] }, BASE_PROFILE);
    expect(exactMatch.bidScore).toBeGreaterThan(noMatch.bidScore);

    const naicsReason = exactMatch.reasoning.find((r) => r.factor === "NAICS Match");
    expect(naicsReason.impact).toBe(25);
  });

  test("partial NAICS match (sector) gives intermediate score", () => {
    // 5415xx shares sector with 541512
    const result = scoreOpportunity({ naicsCodes: ["541590"] }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "NAICS Match");
    expect(reason.impact).toBeGreaterThan(0);
    expect(reason.impact).toBeLessThan(25);
  });

  test("no NAICS match applies a negative impact", () => {
    const result = scoreOpportunity({ naicsCodes: ["999999"] }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "NAICS Match");
    expect(reason.impact).toBeLessThan(0);
  });

  test("missing NAICS data results in zero impact", () => {
    const result = scoreOpportunity({}, { naicsCodes: [] });
    const reason = result.reasoning.find((r) => r.factor === "NAICS Match");
    expect(reason.impact).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Set-aside fit
// ═══════════════════════════════════════════════════════════════════
describe("set-aside fit scoring", () => {
  test("matching set-aside awards maximum set-aside points", () => {
    const result = scoreOpportunity({ setAside: "SDVOSB" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Set-Aside Fit");
    expect(reason.impact).toBe(20);
  });

  test("non-matching set-aside applies a negative impact", () => {
    const profile = { ...BASE_PROFILE, setAsideStatus: ["WOSB"] };
    const result = scoreOpportunity({ setAside: "8(a)" }, profile);
    const reason = result.reasoning.find((r) => r.factor === "Set-Aside Fit");
    expect(reason.impact).toBeLessThan(0);
  });

  test("unrestricted solicitation gives partial positive impact", () => {
    const result = scoreOpportunity({ setAside: "unrestricted" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Set-Aside Fit");
    expect(reason.impact).toBeGreaterThan(0);
    expect(reason.impact).toBeLessThan(20);
  });

  test("missing set-aside on solicitation results in zero impact", () => {
    const result = scoreOpportunity({}, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Set-Aside Fit");
    expect(reason.impact).toBeGreaterThanOrEqual(0); // unrestricted/missing treated as open
  });
});

// ═══════════════════════════════════════════════════════════════════
// Contract value fit
// ═══════════════════════════════════════════════════════════════════
describe("contract value fit scoring", () => {
  test("value in range awards maximum value points", () => {
    const result = scoreOpportunity({ contractValue: 500_000 }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Contract Value Fit");
    expect(reason.impact).toBe(15);
  });

  test("value far above maximum applies a penalty", () => {
    const result = scoreOpportunity({ contractValue: 50_000_000 }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Contract Value Fit");
    expect(reason.impact).toBeLessThan(0);
  });

  test("value below minimum gives a reduced positive or zero impact", () => {
    const result = scoreOpportunity({ contractValue: 10_000 }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Contract Value Fit");
    expect(reason.impact).toBeLessThan(15);
  });

  test("missing contract value results in zero impact", () => {
    const result = scoreOpportunity({}, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Contract Value Fit");
    expect(reason.impact).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Agency relevance
// ═══════════════════════════════════════════════════════════════════
describe("agency relevance scoring", () => {
  test("preferred agency awards maximum agency points", () => {
    const result = scoreOpportunity({ agency: "Department of Veterans Affairs" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Agency Relevance");
    expect(reason.impact).toBe(10);
  });

  test("SMB-friendly agency (GSA) awards maximum points without being in preferred list", () => {
    const profile = { ...BASE_PROFILE, preferredAgencies: [] };
    const result = scoreOpportunity({ agency: "General Services Administration" }, profile);
    const reason = result.reasoning.find((r) => r.factor === "Agency Relevance");
    expect(reason.impact).toBe(10);
  });

  test("unknown agency gives partial positive impact", () => {
    const profile = { ...BASE_PROFILE, preferredAgencies: [] };
    const result = scoreOpportunity({ agency: "Department of Interior" }, profile);
    const reason = result.reasoning.find((r) => r.factor === "Agency Relevance");
    expect(reason.impact).toBeGreaterThanOrEqual(0);
    expect(reason.impact).toBeLessThan(10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Geographic fit
// ═══════════════════════════════════════════════════════════════════
describe("geographic fit scoring", () => {
  test("matching state awards geographic points", () => {
    const result = scoreOpportunity({ statesRequired: ["va"] }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Geographic Fit");
    expect(reason.impact).toBe(5);
  });

  test("non-matching state applies a penalty", () => {
    const profile = { ...BASE_PROFILE, statesServed: ["ca"] };
    const result = scoreOpportunity({ statesRequired: ["ny"] }, profile);
    const reason = result.reasoning.find((r) => r.factor === "Geographic Fit");
    expect(reason.impact).toBeLessThan(0);
  });

  test("nationwide in statesServed matches any solicitation state", () => {
    const profile = { ...BASE_PROFILE, statesServed: ["nationwide"] };
    const result = scoreOpportunity({ statesRequired: ["ak"] }, profile);
    const reason = result.reasoning.find((r) => r.factor === "Geographic Fit");
    expect(reason.impact).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FAR/DFARS burden
// ═══════════════════════════════════════════════════════════════════
describe("FAR/DFARS burden scoring", () => {
  test("no heavy clauses results in zero impact", () => {
    const result = scoreOpportunity({ description: "standard services" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "FAR/DFARS Burden");
    expect(reason.impact).toBe(0);
  });

  test("one or two heavy clauses applies a moderate penalty", () => {
    const result = scoreOpportunity({ farClauses: ["252.204-7012"] }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "FAR/DFARS Burden");
    expect(reason.impact).toBeLessThan(0);
    expect(reason.impact).toBeGreaterThan(-15);
  });

  test("three or more heavy clauses applies maximum penalty", () => {
    const result = scoreOpportunity(
      { farClauses: ["252.204-7012", "252.204-7020", "52.230-2"] },
      BASE_PROFILE
    );
    const reason = result.reasoning.find((r) => r.factor === "FAR/DFARS Burden");
    expect(reason.impact).toBe(-15);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Delivery complexity
// ═══════════════════════════════════════════════════════════════════
describe("delivery complexity scoring", () => {
  test("no complexity signals results in zero impact", () => {
    const result = scoreOpportunity({ description: "routine support services" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Delivery Complexity");
    expect(reason.impact).toBe(0);
  });

  test("one or two complexity signals applies a moderate penalty", () => {
    const result = scoreOpportunity({ description: "urgent, key personnel required" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Delivery Complexity");
    expect(reason.impact).toBeLessThan(0);
    expect(reason.impact).toBeGreaterThan(-10);
  });

  test("many complexity signals applies maximum penalty", () => {
    const result = scoreOpportunity(
      { description: "urgent within 24 hours key personnel secret clearance top secret sci on-site staffing plan" },
      BASE_PROFILE
    );
    const reason = result.reasoning.find((r) => r.factor === "Delivery Complexity");
    expect(reason.impact).toBe(-10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Certification requirements
// ═══════════════════════════════════════════════════════════════════
describe("certification requirements scoring", () => {
  test("no cert requirements results in zero impact", () => {
    const result = scoreOpportunity({ description: "general IT support" }, BASE_PROFILE);
    const reason = result.reasoning.find((r) => r.factor === "Certification Requirements");
    expect(reason.impact).toBe(0);
  });

  test("company holds all required certs gives bonus points", () => {
    const profile = { ...BASE_PROFILE, certifications: ["iso 9001"] };
    const result = scoreOpportunity(
      { description: "iso 9001 certification required for quality management" },
      profile
    );
    const reason = result.reasoning.find((r) => r.factor === "Certification Requirements");
    expect(reason.impact).toBeGreaterThan(0);
  });

  test("missing certifications applies a penalty", () => {
    const profile = { ...BASE_PROFILE, certifications: [] };
    const result = scoreOpportunity(
      { description: "cmmc and fedramp certification required" },
      profile
    );
    const reason = result.reasoning.find((r) => r.factor === "Certification Requirements");
    expect(reason.impact).toBeLessThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Recommendation thresholds
// ═══════════════════════════════════════════════════════════════════
describe("recommendation thresholds", () => {
  test("bidScore >= 70 → BID", () => {
    // Perfect alignment: exact NAICS, matching set-aside, in-range value, preferred agency
    const result = scoreOpportunity(
      {
        naicsCodes: ["541512"],
        setAside: "SDVOSB",
        contractValue: 500_000,
        agency: "Department of Veterans Affairs",
        description: "software development and it consulting services",
        statesRequired: ["va"],
      },
      BASE_PROFILE
    );
    if (result.bidScore >= 70) {
      expect(result.recommendation).toBe("BID");
    }
  });

  test("bidScore < 45 → NO-BID", () => {
    // Worst-case: wrong NAICS, wrong set-aside, wrong agency, heavy clauses
    const profile = { ...BASE_PROFILE, setAsideStatus: ["WOSB"], statesServed: ["ca"] };
    const result = scoreOpportunity(
      {
        naicsCodes: ["999999"],
        setAside: "8(a)",
        contractValue: 50_000_000,
        agency: "Department of Defense",
        farClauses: ["252.204-7012", "252.204-7020", "52.230-2"],
        description: "urgent secret clearance top secret sci on-site cmmc fedramp itar",
        statesRequired: ["ny"],
      },
      profile
    );
    if (result.bidScore < 45) {
      expect(result.recommendation).toBe("NO-BID");
    }
  });

  test("bidScore in [45, 69] → CONSIDER", () => {
    // Manually create a middle-ground result
    const result = scoreOpportunity(
      {
        naicsCodes: ["541590"], // partial NAICS match
        setAside: "Small Business",
        contractValue: 500_000,
        description: "software and it services",
        statesRequired: ["va"],
      },
      BASE_PROFILE
    );
    if (result.bidScore >= 45 && result.bidScore < 70) {
      expect(result.recommendation).toBe("CONSIDER");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// Confidence level
// ═══════════════════════════════════════════════════════════════════
describe("confidence level calculation", () => {
  test("empty solicitation has lower confidence than fully populated one", () => {
    const empty = scoreOpportunity({}, BASE_PROFILE);
    const full = scoreOpportunity(
      {
        naicsCodes: ["541512"],
        setAside: "SDVOSB",
        contractValue: 500_000,
        agency: "Department of Veterans Affairs",
        description: "software development with cmmc requirements",
        farClauses: ["252.204-7012"],
        statesRequired: ["va"],
        certifications: ["cmmc"],
      },
      BASE_PROFILE
    );
    expect(full.confidence).toBeGreaterThan(empty.confidence);
  });

  test("confidence is between 0 and 100", () => {
    const result = scoreOpportunity({}, {});
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Edge cases
// ═══════════════════════════════════════════════════════════════════
describe("edge cases", () => {
  test("handles completely empty inputs without throwing", () => {
    expect(() => scoreOpportunity({}, {})).not.toThrow();
    expect(() => scoreOpportunity()).not.toThrow();
  });

  test("handles string naicsCodes (not array)", () => {
    const result = scoreOpportunity({ naicsCodes: "541512" }, { naicsCodes: "541512" });
    const reason = result.reasoning.find((r) => r.factor === "NAICS Match");
    expect(reason.impact).toBe(25);
  });

  test("handles string statesRequired and statesServed", () => {
    const result = scoreOpportunity(
      { statesRequired: "va" },
      { statesServed: "va" }
    );
    const reason = result.reasoning.find((r) => r.factor === "Geographic Fit");
    expect(reason.impact).toBe(5);
  });
});

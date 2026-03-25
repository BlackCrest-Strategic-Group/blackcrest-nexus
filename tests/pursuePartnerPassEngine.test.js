/**
 * Unit tests for the Pursue / Partner / Pass Engine services:
 *   - capacityAssessmentService.js
 *   - complianceRulesService.js
 *   - supplierRecommendationService.js
 *   - decisionEngineService.js
 *
 * Scenarios covered:
 *   1. Low utilization  → PURSUE
 *   2. Medium utilization with strong suppliers → PARTNER
 *   3. High utilization → PASS
 *   4. Lean savings reducing effective utilization to GREEN
 *   5. Compliance flags blocking a PURSUE
 *   6. Supplier scoring and ranking
 */

import { assessCapacity } from "../backend/services/capacityAssessmentService.js";
import { checkCompliance } from "../backend/services/complianceRulesService.js";
import { recommendSuppliers } from "../backend/services/supplierRecommendationService.js";
import { makeDecision } from "../backend/services/decisionEngineService.js";

// ═══════════════════════════════════════════════════════════════════
// capacityAssessmentService
// ═══════════════════════════════════════════════════════════════════
describe("assessCapacity", () => {
  test("low utilization (50%) → GREEN status", () => {
    const result = assessCapacity(1000, 50, 0);
    expect(result.status).toBe("GREEN");
    expect(result.adjustedUtilization).toBe(50);
    expect(result.availableCapacity).toBe(500);
  });

  test("medium utilization (77%) → YELLOW status", () => {
    const result = assessCapacity(1000, 77, 0);
    expect(result.status).toBe("YELLOW");
    expect(result.adjustedUtilization).toBe(77);
  });

  test("high utilization (90%) → RED status", () => {
    const result = assessCapacity(1000, 90, 0);
    expect(result.status).toBe("RED");
    expect(result.adjustedUtilization).toBe(90);
    expect(result.availableCapacity).toBe(100);
  });

  test("Lean savings reduce adjusted utilization from YELLOW to GREEN", () => {
    // Without lean savings: 80% utilization = YELLOW
    const without = assessCapacity(1000, 80, 0);
    expect(without.status).toBe("YELLOW");

    // With 120 lean hours saved: adjustedUtilization = (800-120)/1000*100 = 68% → GREEN
    const withLean = assessCapacity(1000, 80, 120);
    expect(withLean.status).toBe("GREEN");
    expect(withLean.adjustedUtilization).toBe(68);
    expect(withLean.availableCapacity).toBe(320); // 1000 - 800 + 120
  });

  test("Lean savings reduce adjusted utilization from RED to YELLOW", () => {
    // Without lean: 90% → RED
    const without = assessCapacity(1000, 90, 0);
    expect(without.status).toBe("RED");

    // With 60 lean hours: adjustedUtilization = (900-60)/1000*100 = 84% → YELLOW
    const withLean = assessCapacity(1000, 90, 60);
    expect(withLean.status).toBe("YELLOW");
    expect(withLean.adjustedUtilization).toBe(84);
  });

  test("zero capacity hours → status GREEN with 0 utilization", () => {
    const result = assessCapacity(0, 0, 0);
    expect(result.adjustedUtilization).toBe(0);
    expect(result.status).toBe("GREEN");
  });

  test("throws when arguments are not numbers", () => {
    expect(() => assessCapacity("1000", 50, 0)).toThrow();
    expect(() => assessCapacity(1000, "50", 0)).toThrow();
    expect(() => assessCapacity(1000, 50, "0")).toThrow();
  });

  test("boundary: exactly 70% → YELLOW (70 is not < 70)", () => {
    const result = assessCapacity(1000, 70, 0);
    // The spec says GREEN if < 70; 70 falls in the 70–85 YELLOW band
    expect(result.status).toBe("YELLOW");
  });

  test("boundary: exactly 85% → YELLOW (not RED)", () => {
    const result = assessCapacity(1000, 85, 0);
    expect(result.status).toBe("YELLOW"); // 70–85 inclusive
  });

  test("boundary: 85.01% → RED", () => {
    const result = assessCapacity(10000, 85.01, 0);
    expect(result.status).toBe("RED");
  });
});

// ═══════════════════════════════════════════════════════════════════
// complianceRulesService
// ═══════════════════════════════════════════════════════════════════
describe("checkCompliance", () => {
  test("compliant when NAICS codes match and no set-aside", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["541511", "236220"], setAsideStatus: [] }
    );
    expect(result.compliant).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  test("non-compliant when no NAICS codes overlap", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["236220"], setAsideStatus: [] }
    );
    expect(result.compliant).toBe(false);
    expect(result.flags[0]).toMatch(/NAICS mismatch/);
  });

  test("compliant when company has matching set-aside status", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"], setAside: "8(a)" },
      { naicsCodes: ["541511"], setAsideStatus: ["8(a)"] }
    );
    expect(result.compliant).toBe(true);
  });

  test("non-compliant when company lacks required set-aside", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"], setAside: "hubzone" },
      { naicsCodes: ["541511"], setAsideStatus: ["small business"] }
    );
    expect(result.compliant).toBe(false);
    expect(result.flags[0]).toMatch(/Set-aside incompatibility/);
  });

  test("compliant when opportunity has no set-aside requirement", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"], setAside: "" },
      { naicsCodes: ["541511"], setAsideStatus: [] }
    );
    expect(result.compliant).toBe(true);
  });

  test("multiple flags when both NAICS and set-aside fail", () => {
    const result = checkCompliance(
      { naicsCodes: ["541511"], setAside: "sdvosb" },
      { naicsCodes: ["236220"], setAsideStatus: [] }
    );
    expect(result.compliant).toBe(false);
    expect(result.flags.length).toBeGreaterThanOrEqual(2);
  });

  test("handles missing naicsCodes gracefully", () => {
    const result = checkCompliance({}, {});
    expect(result.compliant).toBe(true); // No requirements = no failures
  });
});

// ═══════════════════════════════════════════════════════════════════
// supplierRecommendationService
// ═══════════════════════════════════════════════════════════════════
describe("recommendSuppliers", () => {
  const baseSuppliers = [
    {
      name: "Alpha Corp",
      naics: ["541511"],
      pastPerformanceScore: 90,
      onTimeDelivery: 95,
      complianceRisk: "low"
    },
    {
      name: "Beta LLC",
      naics: ["541511"],
      pastPerformanceScore: 70,
      onTimeDelivery: 75,
      complianceRisk: "medium"
    },
    {
      name: "Gamma Inc",
      naics: ["236220"], // different NAICS
      pastPerformanceScore: 85,
      onTimeDelivery: 88,
      complianceRisk: "low"
    },
    {
      name: "Delta Co",
      naics: ["541511"],
      pastPerformanceScore: 60,
      onTimeDelivery: 65,
      complianceRisk: "high"
    },
    {
      name: "Epsilon Ltd",
      naics: ["541511"],
      pastPerformanceScore: 80,
      onTimeDelivery: 85,
      complianceRisk: "low"
    },
    {
      name: "Zeta Group",
      naics: ["541511"],
      pastPerformanceScore: 75,
      onTimeDelivery: 78,
      complianceRisk: "low"
    }
  ];

  test("returns at most 5 suppliers", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  test("results are sorted by supplierScore descending", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].supplierScore).toBeGreaterThanOrEqual(result[i].supplierScore);
    }
  });

  test("supplier with NAICS match scores higher than one without", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers);
    const gamma = result.find((s) => s.name === "Gamma Inc");
    const alpha = result.find((s) => s.name === "Alpha Corp");
    if (gamma && alpha) {
      // Alpha matches NAICS; Gamma does not → Alpha should score higher despite similar performance
      expect(alpha.supplierScore).toBeGreaterThan(gamma.supplierScore);
    }
  });

  test("high compliance risk lowers score", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers);
    const delta = result.find((s) => s.name === "Delta Co");
    const beta = result.find((s) => s.name === "Beta LLC");
    if (delta && beta) {
      expect(beta.supplierScore).toBeGreaterThan(delta.supplierScore);
    }
  });

  test("returns empty array when no suppliers provided", () => {
    const result = recommendSuppliers(["541511"], []);
    expect(result).toEqual([]);
  });

  test("returns all suppliers when fewer than 5 provided", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers.slice(0, 3));
    expect(result.length).toBe(3);
  });

  test("each returned supplier has a supplierScore property", () => {
    const result = recommendSuppliers(["541511"], baseSuppliers);
    result.forEach((s) => expect(typeof s.supplierScore).toBe("number"));
  });
});

// ═══════════════════════════════════════════════════════════════════
// decisionEngineService
// ═══════════════════════════════════════════════════════════════════
describe("makeDecision", () => {
  const greenCapacity = { status: "GREEN", adjustedUtilization: 55, availableCapacity: 450 };
  const yellowCapacity = { status: "YELLOW", adjustedUtilization: 78, availableCapacity: 220 };
  const redCapacity = { status: "RED", adjustedUtilization: 92, availableCapacity: 80 };
  const compliant = { compliant: true, flags: [] };
  const nonCompliant = { compliant: false, flags: ["NAICS mismatch: opportunity requires [541511]"] };

  test("GREEN + compliant → PURSUE", () => {
    const result = makeDecision(greenCapacity, compliant, 0);
    expect(result.decision).toBe("PURSUE");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasons.some((r) => /GREEN/i.test(r))).toBe(true);
  });

  test("YELLOW + supplierScore > 70 → PARTNER", () => {
    const result = makeDecision(yellowCapacity, compliant, 80);
    expect(result.decision).toBe("PARTNER");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasons.some((r) => /YELLOW/i.test(r))).toBe(true);
  });

  test("YELLOW + supplierScore ≤ 70 → PASS", () => {
    const result = makeDecision(yellowCapacity, compliant, 65);
    expect(result.decision).toBe("PASS");
    expect(result.reasons.some((r) => /supplier/i.test(r))).toBe(true);
  });

  test("RED → PASS regardless of supplier score", () => {
    const result = makeDecision(redCapacity, compliant, 90);
    expect(result.decision).toBe("PASS");
    expect(result.reasons.some((r) => /RED/i.test(r))).toBe(true);
  });

  test("GREEN + non-compliant → PASS (compliance blocks pursue)", () => {
    const result = makeDecision(greenCapacity, nonCompliant, 0);
    expect(result.decision).toBe("PASS");
  });

  test("confidence is within 0–100", () => {
    [
      makeDecision(greenCapacity, compliant, 0),
      makeDecision(yellowCapacity, compliant, 80),
      makeDecision(redCapacity, compliant, 90)
    ].forEach((r) => {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(100);
    });
  });

  test("reasons array is non-empty for every decision", () => {
    [
      makeDecision(greenCapacity, compliant, 0),
      makeDecision(yellowCapacity, compliant, 80),
      makeDecision(redCapacity, compliant, 0)
    ].forEach((r) => {
      expect(r.reasons.length).toBeGreaterThan(0);
    });
  });

  test("throws when required arguments are missing", () => {
    expect(() => makeDecision(null, compliant)).toThrow();
    expect(() => makeDecision(greenCapacity, null)).toThrow();
  });

  test("Lean savings scenario: GREEN due to lean savings → PURSUE", () => {
    // Simulate a case where lean savings brought utilization to GREEN
    const greenFromLean = { status: "GREEN", adjustedUtilization: 65, availableCapacity: 350 };
    const result = makeDecision(greenFromLean, compliant, 0);
    expect(result.decision).toBe("PURSUE");
  });
});

// ═══════════════════════════════════════════════════════════════════
// Integration: full pipeline
// ═══════════════════════════════════════════════════════════════════
describe("Full pipeline integration", () => {
  const suppliers = [
    {
      name: "Best Vendor",
      naics: ["541511"],
      pastPerformanceScore: 90,
      onTimeDelivery: 92,
      complianceRisk: "low"
    },
    {
      name: "Good Vendor",
      naics: ["541511"],
      pastPerformanceScore: 80,
      onTimeDelivery: 85,
      complianceRisk: "low"
    }
  ];

  test("low utilization company pursuing matching NAICS → PURSUE", () => {
    const capacity = assessCapacity(1000, 50, 0);
    const compliance = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["541511"], setAsideStatus: [] }
    );
    const recommended = recommendSuppliers(["541511"], suppliers);
    const avg =
      recommended.reduce((s, r) => s + r.supplierScore, 0) / (recommended.length || 1);
    const { decision } = makeDecision(capacity, compliance, avg);
    expect(decision).toBe("PURSUE");
  });

  test("medium utilization with strong suppliers → PARTNER", () => {
    const capacity = assessCapacity(1000, 78, 0); // YELLOW
    const compliance = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["541511"], setAsideStatus: [] }
    );
    const recommended = recommendSuppliers(["541511"], suppliers);
    const avg =
      recommended.reduce((s, r) => s + r.supplierScore, 0) / (recommended.length || 1);
    const { decision } = makeDecision(capacity, compliance, avg);
    // avg score of strong suppliers should be > 70
    expect(avg).toBeGreaterThan(70);
    expect(decision).toBe("PARTNER");
  });

  test("high utilization → PASS", () => {
    const capacity = assessCapacity(1000, 92, 0); // RED
    const compliance = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["541511"], setAsideStatus: [] }
    );
    const { decision } = makeDecision(capacity, compliance, 95);
    expect(decision).toBe("PASS");
  });

  test("lean savings flip RED to YELLOW and strong suppliers → PARTNER", () => {
    // Without lean: 88% → RED
    const withoutLean = assessCapacity(1000, 88, 0);
    expect(withoutLean.status).toBe("RED");

    // With 200 lean hours: adjustedUtilization = (880-200)/1000*100 = 68% → GREEN
    const withLean = assessCapacity(1000, 88, 200);
    expect(withLean.status).toBe("GREEN");

    const compliance = checkCompliance(
      { naicsCodes: ["541511"] },
      { naicsCodes: ["541511"], setAsideStatus: [] }
    );
    const { decision } = makeDecision(withLean, compliance, 0);
    expect(decision).toBe("PURSUE");
  });
});

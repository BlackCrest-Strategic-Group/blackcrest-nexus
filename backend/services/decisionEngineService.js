/**
 * Decision Engine Service
 *
 * Determines whether a company should PURSUE, PARTNER, or PASS on a
 * government contracting opportunity based on:
 *   - Capacity status (GREEN / YELLOW / RED)
 *   - Compliance result
 *   - Average supplier score (for PARTNER consideration)
 */

/**
 * @param {object}   capacityResult          - Output of capacityAssessmentService.assessCapacity()
 * @param {object}   complianceResult         - Output of complianceRulesService.checkCompliance()
 * @param {number}   [avgSupplierScore=0]     - Average score of recommended suppliers (0–100).
 * @returns {{ decision: string, confidence: number, reasons: string[] }}
 */
export function makeDecision(capacityResult, complianceResult, avgSupplierScore = 0) {
  if (!capacityResult || !complianceResult) {
    throw new Error("makeDecision: capacityResult and complianceResult are required");
  }

  const { status: capacityStatus, adjustedUtilization } = capacityResult;
  const { compliant, flags = [] } = complianceResult;

  const reasons = [];
  let decision;
  let confidence;

  // ── Primary decision logic ────────────────────────────────────────
  if (capacityStatus === "GREEN" && compliant) {
    decision = "PURSUE";
    confidence = 90 - Math.round(adjustedUtilization * 0.3); // Reduce confidence as utilization rises
    reasons.push(`Capacity status is GREEN (${adjustedUtilization}% adjusted utilization).`);
    reasons.push("Company meets all compliance requirements.");
  } else if (capacityStatus === "YELLOW" && avgSupplierScore > 70) {
    decision = "PARTNER";
    confidence = Math.round(40 + avgSupplierScore * 0.5); // Supplier quality drives confidence
    reasons.push(`Capacity status is YELLOW (${adjustedUtilization}% adjusted utilization) — need partner support.`);
    reasons.push(`Average supplier score is ${avgSupplierScore.toFixed(1)}, which exceeds the 70-point threshold.`);
    if (!compliant) {
      reasons.push("Note: compliance flags present — address before pursuing.");
    }
  } else {
    decision = "PASS";
    reasons.push(`Capacity status is ${capacityStatus} (${adjustedUtilization}% adjusted utilization).`);

    if (!compliant && flags.length > 0) {
      flags.forEach((f) => reasons.push(`Compliance issue: ${f}`));
    }
    if (capacityStatus === "YELLOW" && avgSupplierScore <= 70) {
      reasons.push(
        `Supplier bench is insufficient (avg score ${avgSupplierScore.toFixed(1)} ≤ 70) to cover capacity gap.`
      );
    }
    if (capacityStatus === "RED") {
      reasons.push("Capacity is critically over-committed; risk of delivery failure is high.");
    }

    confidence = Math.max(10, 40 - Math.round(adjustedUtilization * 0.2));
  }

  return {
    decision,
    confidence: Math.min(100, Math.max(0, confidence)),
    reasons
  };
}

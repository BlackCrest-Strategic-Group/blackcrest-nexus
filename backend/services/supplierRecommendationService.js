/**
 * Supplier Recommendation Service
 *
 * Scores and ranks suppliers for a given opportunity based on capability fit,
 * on-time delivery, compliance risk, and past performance.
 */

// Map compliance risk labels to numeric scores (higher = better)
const COMPLIANCE_RISK_SCORES = {
  low: 100,
  medium: 50,
  high: 0
};

/**
 * Scores a single supplier against an opportunity.
 *
 * Scoring formula (0–100):
 *   capabilityFit    × 0.30
 *   onTimeDelivery   × 0.20
 *   complianceScore  × 0.20
 *   pastPerformance  × 0.30
 *
 * @param {object}   supplier          - Supplier record.
 * @param {string[]} opportunityNaics  - NAICS codes from the opportunity.
 * @returns {number} Composite score (0–100).
 */
function scoreSupplier(supplier, opportunityNaics) {
  // Capability fit: full score if supplier covers at least one opportunity NAICS
  const supplierNaics = Array.isArray(supplier.naics) ? supplier.naics.map(String) : [];
  const naicsMatch = opportunityNaics.some((code) => supplierNaics.includes(code));
  const capabilityFit = naicsMatch ? 100 : 0;

  const onTimeDelivery = typeof supplier.onTimeDelivery === "number" ? supplier.onTimeDelivery : 0;
  const complianceScore =
    COMPLIANCE_RISK_SCORES[supplier.complianceRisk?.toLowerCase()] ?? 50;
  const pastPerformance =
    typeof supplier.pastPerformanceScore === "number" ? supplier.pastPerformanceScore : 0;

  return (
    capabilityFit * 0.3 +
    onTimeDelivery * 0.2 +
    complianceScore * 0.2 +
    pastPerformance * 0.3
  );
}

/**
 * @param {string[]} opportunityNaics - NAICS codes from the opportunity.
 * @param {object[]} suppliers        - Array of supplier objects.
 * @returns {Array<object & { supplierScore: number }>} Top 5 suppliers, sorted by score descending.
 */
export function recommendSuppliers(opportunityNaics = [], suppliers = []) {
  const oppNaics = Array.isArray(opportunityNaics) ? opportunityNaics.map(String) : [];

  const scored = suppliers
    .map((supplier) => ({
      ...supplier,
      supplierScore: Math.round(scoreSupplier(supplier, oppNaics) * 100) / 100
    }))
    .sort((a, b) => b.supplierScore - a.supplierScore);

  return scored.slice(0, 5);
}

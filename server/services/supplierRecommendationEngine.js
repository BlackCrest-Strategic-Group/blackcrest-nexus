import { CLEAN_ROOM_DISCLAIMER } from './procurementDemoData.js';

export function buildSupplierRecommendations({ item, category, currentSuppliers = [], catalog = [] }) {
  const currentSet = new Set(currentSuppliers);

  const ranked = catalog
    .filter((supplier) => !category || supplier.category.toLowerCase().includes(category.toLowerCase()))
    .map((supplier) => {
      const fitScore = category && supplier.category.toLowerCase().includes(category.toLowerCase()) ? 35 : 15;
      const diversificationBoost = currentSet.has(supplier.supplierName) ? 0 : 20;
      const riskReduction = Math.max(0, 30 - Math.floor(supplier.riskScore / 2));
      const pricingValue = supplier.pricingProfile.includes('minus') ? 20 : 8;
      return {
        supplierName: supplier.supplierName,
        category: supplier.category,
        region: supplier.region,
        capabilities: supplier.capabilities,
        rationale: [
          `Fit score based on ${item || category || 'requested'} alignment`,
          diversificationBoost ? 'Introduces supplier diversification.' : 'Existing supplier retained for continuity.',
          `Risk score: ${supplier.riskScore}`
        ],
        score: fitScore + diversificationBoost + riskReduction + pricingValue
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    disclaimer: CLEAN_ROOM_DISCLAIMER,
    recommendations: ranked
  };
}

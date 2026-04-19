import Supplier from "../models/Supplier.js";
import SupplierPerformance from "../models/SupplierPerformance.js";

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

export async function rankSuppliers({ naicsCode, targetCount = 5 }) {
  const naicsFilter = naicsCode ? { naicsCodes: naicsCode } : {};
  const suppliers = await Supplier.find({ status: "active", ...naicsFilter }).limit(100);

  const scored = await Promise.all(
    suppliers.map(async (supplier) => {
      const perf = await SupplierPerformance.find({ supplierId: supplier._id }).sort({ createdAt: -1 }).limit(20);
      const onTimeRatio = perf.length ? perf.filter((p) => p.onTime).length / perf.length : 0.8;
      const avgDelay = perf.length ? perf.reduce((sum, p) => sum + (p.delayDays || 0), 0) / perf.length : 2;

      const deliveryReliability = clamp(Math.round(onTimeRatio * 100 - avgDelay * 4));
      const costEfficiency = clamp(Math.round((supplier.overallScore ?? 70) * 0.9 + (supplier.activeContracts < 5 ? 10 : 0)));
      const riskRating = clamp(100 - Math.round((supplier.overallScore ?? 70) * 0.7 + deliveryReliability * 0.3));
      const performanceHistory = clamp(Math.round((supplier.overallScore ?? 70) * 0.6 + deliveryReliability * 0.4));

      const score = clamp(Math.round(costEfficiency * 0.35 + deliveryReliability * 0.35 + (100 - riskRating) * 0.15 + performanceHistory * 0.15));

      return {
        supplierId: supplier._id,
        supplierName: supplier.name,
        tier: supplier.tier,
        score,
        costEfficiency,
        deliveryReliability,
        riskRating,
        performanceHistory,
      };
    })
  );

  return scored.sort((a, b) => b.score - a.score).slice(0, targetCount);
}

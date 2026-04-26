function seeded(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const n = x - Math.floor(x);
  return Math.round(min + n * (max - min));
}

function trendFromScore(score) {
  if (score < 55) return 'Deteriorating';
  if (score < 75) return 'Watch';
  return 'Stable';
}

function level(score) {
  if (score < 55) return 'High';
  if (score < 75) return 'Medium';
  return 'Low';
}

export function buildSupplierRiskRadar(suppliers = []) {
  const records = suppliers.map((supplier, idx) => {
    const base = idx + 1;
    const deliveryTrendDeterioration = seeded(base * 17, 20, 95);
    const qualityDegradation = seeded(base * 19, 20, 90);
    const pricingInstability = seeded(base * 23, 15, 92);
    const dependencyConcentration = seeded(base * 29, 25, 96);
    const singleSourceExposure = seeded(base * 31, 0, 100);
    const communicationRisk = seeded(base * 37, 10, 78);
    const geopoliticalRisk = seeded(base * 41, 12, 82);
    const complianceGapRisk = seeded(base * 43, 15, 88);

    const weightedRisk = Math.round(
      deliveryTrendDeterioration * 0.18 +
      qualityDegradation * 0.17 +
      pricingInstability * 0.14 +
      dependencyConcentration * 0.14 +
      singleSourceExposure * 0.13 +
      communicationRisk * 0.08 +
      geopoliticalRisk * 0.08 +
      complianceGapRisk * 0.08
    );

    const healthScore = Math.max(0, 100 - weightedRisk);

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      category: supplier.category,
      supplierHealthScore: healthScore,
      trendDirection: trendFromScore(healthScore),
      riskLevel: level(healthScore),
      explainableReasoning: [
        `Delivery trend deterioration at ${deliveryTrendDeterioration}/100.`,
        `Pricing instability measured at ${pricingInstability}/100.`,
        `Dependency concentration at ${dependencyConcentration}/100.`
      ],
      factors: {
        deliveryTrendDeterioration,
        qualityDegradation,
        pricingInstability,
        dependencyConcentration,
        singleSourceExposure,
        communicationRiskPlaceholder: communicationRisk,
        geopoliticalRiskPlaceholder: geopoliticalRisk,
        complianceDocumentationGap: complianceGapRisk
      },
      mitigationRecommendations: [
        'Qualify a secondary source within the same category within 30 days.',
        'Run weekly supplier quality and OTD governance cadence with documented actions.',
        'Require pricing review and variance approvals for all spot buys.'
      ]
    };
  });

  return records.sort((a, b) => a.supplierHealthScore - b.supplierHealthScore);
}

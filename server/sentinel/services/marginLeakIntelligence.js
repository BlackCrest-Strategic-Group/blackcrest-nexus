const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function severityFromImpact(amount) {
  if (amount >= 150000) return 'Critical';
  if (amount >= 75000) return 'High';
  if (amount >= 25000) return 'Medium';
  return 'Informational';
}

export function buildMarginLeakIntelligence(rows = []) {
  const now = new Date();
  const supplierExposure = new Map();
  const drivers = {
    expeditedFreight: 0,
    premiumShipping: 0,
    moqPenalties: 0,
    supplierCostCreep: 0,
    invoiceVariance: 0,
    excessInventory: 0,
    laborInefficiency: 0,
    qualityRework: 0
  };

  rows.forEach((row) => {
    const supplier = row.supplier || row.supplierName || 'Unknown Supplier';
    const unitPrice = toNumber(row.unitPrice);
    const baselinePrice = toNumber(row.baselinePrice || row.targetUnitPrice || unitPrice * 0.92);
    const quantity = toNumber(row.quantity || row.qty || 0);
    const extendedValue = toNumber(row.extendedValue || row.total || unitPrice * quantity);

    if (row.expediteFlag) drivers.expeditedFreight += extendedValue * 0.12;
    if (row.premiumShippingFlag) drivers.premiumShipping += extendedValue * 0.08;
    if (row.moqPenaltyFlag) drivers.moqPenalties += extendedValue * 0.05;

    if (unitPrice > baselinePrice) {
      drivers.supplierCostCreep += (unitPrice - baselinePrice) * Math.max(quantity, 1);
    }

    const invoiceVariance = toNumber(row.invoiceVarianceAmount || 0);
    if (invoiceVariance > 0) drivers.invoiceVariance += invoiceVariance;

    const excessInventoryCost = toNumber(row.excessInventoryCost || 0);
    if (excessInventoryCost > 0) drivers.excessInventory += excessInventoryCost;

    supplierExposure.set(supplier, (supplierExposure.get(supplier) || 0) + extendedValue);
  });

  drivers.laborInefficiency = Math.round(rows.length * 180);
  drivers.qualityRework = Math.round(rows.length * 140);

  const weeklyLeakageEstimate = Math.round(Object.values(drivers).reduce((sum, v) => sum + v, 0));
  const monthlyLeakageEstimate = Math.round(weeklyLeakageEstimate * 4.33);
  const annualizedLeakageEstimate = monthlyLeakageEstimate * 12;

  const topDrivers = Object.entries(drivers)
    .map(([driver, estimatedLoss]) => ({ driver, estimatedLoss: Math.round(estimatedLoss) }))
    .sort((a, b) => b.estimatedLoss - a.estimatedLoss)
    .slice(0, 5);

  const highestRiskSuppliers = [...supplierExposure.entries()]
    .map(([supplier, spend]) => ({
      supplier,
      exposure: Math.round(spend * 0.11),
      severity: severityFromImpact(spend * 0.11)
    }))
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 5);

  return {
    id: `ml-${now.getTime()}`,
    category: 'Margin Leakage',
    weeklyLeakageEstimate,
    monthlyLeakageEstimate,
    annualizedLeakageEstimate,
    topDrivers,
    highestRiskSuppliers,
    recoveryRecommendations: [
      'Lock expedite approvals behind manager sign-off and root-cause review.',
      'Renegotiate top 3 price-creep suppliers with indexed cost clauses.',
      'Deploy invoice variance reconciliation before payment release.',
      'Shift long-tail SKUs to demand-shaped replenishment to lower excess inventory.'
    ],
    generatedAt: now.toISOString(),
    lookbackWindow: {
      start: new Date(now.getTime() - 30 * DAY_MS).toISOString(),
      end: now.toISOString()
    }
  };
}

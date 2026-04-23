function severity(amount) {
  if (amount >= 100000) return 'critical';
  if (amount >= 50000) return 'high';
  if (amount >= 10000) return 'medium';
  return 'low';
}

export function analyzeMarginLeaks(rows = []) {
  const alerts = [];
  const byItem = new Map();
  const supplierSpend = new Map();

  rows.forEach((row) => {
    if (!byItem.has(row.item)) byItem.set(row.item, []);
    byItem.get(row.item).push(row);
    supplierSpend.set(row.supplier, (supplierSpend.get(row.supplier) || 0) + row.extendedValue);
  });

  byItem.forEach((itemRows, item) => {
    const prices = itemRows.map((row) => row.unitPrice);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    if (max > min) {
      const leakage = (max - min) * itemRows.reduce((sum, row) => sum + row.quantity, 0);
      alerts.push({
        type: 'price_variance',
        severity: severity(leakage),
        estimatedLeakageAmount: Math.round(leakage),
        evidence: `Price spread for ${item}: ${min} to ${max}`,
        affectedSupplier: itemRows.find((row) => row.unitPrice === max)?.supplier,
        affectedItem: item,
        recommendedAction: 'Issue competitive RFQ and enforce catalog price bands.',
        roleOwner: 'Category Manager'
      });
    }

    itemRows.forEach((row) => {
      if (row.sellPrice && row.unitPrice > row.sellPrice) {
        alerts.push({
          type: 'negative_margin',
          severity: 'critical',
          estimatedLeakageAmount: Math.round((row.unitPrice - row.sellPrice) * row.quantity),
          evidence: `Buy ${row.unitPrice} exceeds sell ${row.sellPrice}`,
          affectedSupplier: row.supplier,
          affectedItem: item,
          recommendedAction: 'Block replenishment until pricing corrected.',
          roleOwner: 'CEO'
        });
      }

      if (row.expediteFlag) {
        alerts.push({
          type: 'expedite_spend',
          severity: 'medium',
          estimatedLeakageAmount: Math.round(row.extendedValue * 0.12),
          evidence: 'Expedite flag set on line item.',
          affectedSupplier: row.supplier,
          affectedItem: item,
          recommendedAction: 'Review planning windows to reduce expedite usage.',
          roleOwner: 'Buyer'
        });
      }
    });
  });

  const totalSpend = [...supplierSpend.values()].reduce((sum, value) => sum + value, 0);
  for (const [supplier, spend] of supplierSpend.entries()) {
    if (totalSpend && spend / totalSpend > 0.5) {
      alerts.push({
        type: 'supplier_concentration',
        severity: 'high',
        estimatedLeakageAmount: Math.round(spend * 0.07),
        evidence: `${supplier} controls ${((spend / totalSpend) * 100).toFixed(1)}% of analyzed spend.`,
        affectedSupplier: supplier,
        affectedItem: null,
        recommendedAction: 'Source alternate suppliers and create split award strategy.',
        roleOwner: 'Procurement Director'
      });
    }
  }

  return {
    totalEstimatedLeakage: alerts.reduce((sum, alert) => sum + alert.estimatedLeakageAmount, 0),
    alerts
  };
}

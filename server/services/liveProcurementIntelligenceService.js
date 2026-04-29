const FIELD_ALIASES = {
  supplier: ['supplier', 'suppliername', 'vendor', 'vendorname', 'manufacturer', 'mfr'],
  item: ['item', 'itemnumber', 'part', 'partnumber', 'sku', 'material', 'description'],
  category: ['category', 'commodity', 'family', 'class', 'naics'],
  poNumber: ['po', 'ponumber', 'purchaseorder', 'purchaseordernumber'],
  quantity: ['qty', 'quantity', 'orderqty', 'orderedquantity'],
  unitCost: ['unitcost', 'unitprice', 'cost', 'price', 'pounitprice'],
  sellPrice: ['sellprice', 'saleprice', 'customerprice', 'resaleprice', 'revenueunitprice'],
  extendedCost: ['extendedcost', 'linecost', 'amount', 'spend', 'totalcost', 'extendedprice'],
  dueDate: ['duedate', 'promisedate', 'needbydate', 'requireddate'],
  receiptDate: ['receiptdate', 'receiveddate', 'actualdeliverydate', 'deliverydate'],
  orderDate: ['orderdate', 'podate', 'createddate'],
  status: ['status', 'postatus', 'linestatus']
};

function normalizeKey(key = '') {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/[$,%\s,]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(start, end) {
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function get(row, canonicalField) {
  const aliases = FIELD_ALIASES[canonicalField] || [canonicalField];
  const normalizedRow = Object.entries(row || {}).reduce((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});
  for (const alias of aliases) {
    const value = normalizedRow[normalizeKey(alias)];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

export function parseCsv(bufferOrString) {
  const text = Buffer.isBuffer(bufferOrString) ? bufferOrString.toString('utf8') : String(bufferOrString || '');
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current.trim());
      current = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some((cell) => cell !== '')) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells) => headers.reduce((acc, header, index) => {
    acc[header || `column_${index + 1}`] = cells[index] ?? '';
    return acc;
  }, {}));
}

function normalizeProcurementRow(row, index) {
  const quantity = toNumber(get(row, 'quantity')) || 1;
  const unitCost = toNumber(get(row, 'unitCost'));
  const extendedCost = toNumber(get(row, 'extendedCost')) || quantity * unitCost;
  const sellPrice = toNumber(get(row, 'sellPrice'));
  const orderDate = toDate(get(row, 'orderDate'));
  const dueDate = toDate(get(row, 'dueDate'));
  const receiptDate = toDate(get(row, 'receiptDate'));
  const leadTimeDays = daysBetween(orderDate, receiptDate);
  const daysLate = dueDate && receiptDate ? Math.max(0, daysBetween(dueDate, receiptDate)) : 0;
  const marginPerUnit = sellPrice && unitCost ? sellPrice - unitCost : 0;
  const marginPct = sellPrice ? marginPerUnit / sellPrice : null;

  return {
    id: String(get(row, 'poNumber') || `row-${index + 1}`),
    supplier: String(get(row, 'supplier') || 'Unknown Supplier').trim(),
    item: String(get(row, 'item') || 'Unknown Item').trim(),
    category: String(get(row, 'category') || 'Uncategorized').trim(),
    poNumber: String(get(row, 'poNumber') || '').trim(),
    quantity,
    unitCost,
    sellPrice,
    extendedCost,
    orderDate,
    dueDate,
    receiptDate,
    leadTimeDays,
    daysLate,
    marginPerUnit,
    marginPct,
    status: String(get(row, 'status') || '').trim()
  };
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const groupKey = row[key] || 'Unknown';
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(row);
    return acc;
  }, {});
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + selector(row), 0);
}

function avg(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return null;
  return filtered.reduce((total, value) => total + value, 0) / filtered.length;
}

function buildSupplierScorecards(rows) {
  return Object.entries(groupBy(rows, 'supplier')).map(([supplier, supplierRows]) => {
    const spend = sum(supplierRows, (row) => row.extendedCost);
    const lateRows = supplierRows.filter((row) => row.daysLate > 0);
    const onTimeDelivery = supplierRows.some((row) => row.receiptDate && row.dueDate)
      ? 1 - lateRows.length / supplierRows.filter((row) => row.receiptDate && row.dueDate).length
      : null;
    const avgLeadTimeDays = avg(supplierRows.map((row) => row.leadTimeDays).filter((value) => value !== null));
    const avgMarginPct = avg(supplierRows.map((row) => row.marginPct).filter((value) => value !== null));
    const riskScore = Math.min(100, Math.round(
      (lateRows.length * 14) +
      (avgLeadTimeDays && avgLeadTimeDays > 30 ? 18 : 0) +
      (avgMarginPct !== null && avgMarginPct < 0.18 ? 22 : 0) +
      (supplierRows.length === 1 ? 8 : 0)
    ));

    return {
      supplier,
      lineCount: supplierRows.length,
      spend,
      onTimeDelivery,
      avgLeadTimeDays,
      avgMarginPct,
      lateLineCount: lateRows.length,
      riskScore,
      riskLevel: riskScore >= 55 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low'
    };
  }).sort((a, b) => b.riskScore - a.riskScore || b.spend - a.spend);
}

function buildMarginLeakage(rows) {
  const pricedRows = rows.filter((row) => row.sellPrice > 0 && row.unitCost > 0);
  const lowMarginRows = pricedRows.filter((row) => row.marginPct !== null && row.marginPct < 0.18);
  const negativeMarginRows = pricedRows.filter((row) => row.marginPct !== null && row.marginPct < 0);
  const targetMarginPct = 0.25;
  const recoveryOpportunity = lowMarginRows.reduce((total, row) => {
    const targetSellPrice = row.unitCost / (1 - targetMarginPct);
    return total + Math.max(0, targetSellPrice - row.sellPrice) * row.quantity;
  }, 0);

  return {
    rowsWithSellPrice: pricedRows.length,
    lowMarginLineCount: lowMarginRows.length,
    negativeMarginLineCount: negativeMarginRows.length,
    recoveryOpportunity,
    annualizedRecoveryOpportunity: recoveryOpportunity * 12,
    topDrivers: lowMarginRows
      .sort((a, b) => ((b.unitCost / 0.75 - b.sellPrice) * b.quantity) - ((a.unitCost / 0.75 - a.sellPrice) * a.quantity))
      .slice(0, 10)
      .map((row) => ({
        supplier: row.supplier,
        item: row.item,
        poNumber: row.poNumber,
        marginPct: row.marginPct,
        estimatedRecovery: Math.max(0, (row.unitCost / 0.75 - row.sellPrice) * row.quantity)
      }))
  };
}

function buildAlerts({ rows, supplierScorecards, marginLeakage }) {
  const alerts = [];
  for (const supplier of supplierScorecards.filter((s) => s.riskLevel !== 'Low').slice(0, 8)) {
    alerts.push({
      id: `supplier-${normalizeKey(supplier.supplier)}`,
      type: supplier.riskLevel === 'High' ? 'Critical' : 'High',
      category: 'supplier_risk',
      title: `${supplier.supplier} supplier risk requires review`,
      rootCause: supplier.lateLineCount > 0
        ? `${supplier.lateLineCount} late receipt lines are driving delivery risk.`
        : 'Supplier concentration or lead-time profile is driving risk.',
      financialImpact: supplier.spend,
      confidenceScore: supplier.lineCount >= 5 ? 0.86 : 0.68,
      recommendedAction: 'Review open POs, confirm recovery plan, and qualify backup source if risk remains elevated.',
      sourceSignals: {
        lineCount: supplier.lineCount,
        spend: supplier.spend,
        onTimeDelivery: supplier.onTimeDelivery,
        avgLeadTimeDays: supplier.avgLeadTimeDays,
        riskScore: supplier.riskScore
      }
    });
  }

  if (marginLeakage.lowMarginLineCount > 0) {
    alerts.unshift({
      id: 'margin-leakage-live-upload',
      type: marginLeakage.negativeMarginLineCount > 0 ? 'Critical' : 'High',
      category: 'margin_leakage',
      title: 'Margin leakage detected from uploaded procurement data',
      rootCause: `${marginLeakage.lowMarginLineCount} priced lines are below the 18% margin threshold.`,
      financialImpact: marginLeakage.annualizedRecoveryOpportunity,
      confidenceScore: marginLeakage.rowsWithSellPrice >= 10 ? 0.9 : 0.72,
      recommendedAction: 'Reprice low-margin customer lines, renegotiate supplier cost, or route exceptions to commercial finance.',
      sourceSignals: {
        rowsWithSellPrice: marginLeakage.rowsWithSellPrice,
        lowMarginLineCount: marginLeakage.lowMarginLineCount,
        negativeMarginLineCount: marginLeakage.negativeMarginLineCount,
        recoveryOpportunity: marginLeakage.recoveryOpportunity
      }
    });
  }

  const lateRows = rows.filter((row) => row.daysLate > 0);
  if (lateRows.length) {
    alerts.push({
      id: 'delivery-latency-live-upload',
      type: lateRows.length > rows.length * 0.25 ? 'Critical' : 'High',
      category: 'delivery_risk',
      title: 'Late delivery pattern detected from uploaded procurement data',
      rootCause: `${lateRows.length} lines show receipts after the promised due date.`,
      financialImpact: sum(lateRows, (row) => row.extendedCost),
      confidenceScore: lateRows.length >= 5 ? 0.84 : 0.66,
      recommendedAction: 'Escalate late suppliers, validate promise dates, and separate chronic supplier issues from receiving-process delays.',
      sourceSignals: {
        lateLineCount: lateRows.length,
        lateSpend: sum(lateRows, (row) => row.extendedCost),
        worstDaysLate: Math.max(...lateRows.map((row) => row.daysLate))
      }
    });
  }

  return alerts.sort((a, b) => b.financialImpact - a.financialImpact);
}

export function analyzeOperationalProcurementRows(inputRows = [], options = {}) {
  const normalizedRows = inputRows.map(normalizeProcurementRow).filter((row) => row.supplier || row.item || row.extendedCost);
  if (!normalizedRows.length) {
    return {
      mode: 'live-upload',
      generatedAt: new Date().toISOString(),
      message: 'No usable procurement rows were detected. Upload CSV/JSON rows with supplier, item, quantity, unit cost, and dates.',
      kpis: { rowCount: 0, totalSpend: 0, supplierCount: 0, categoryCount: 0 },
      alerts: [],
      supplierScorecards: [],
      marginLeakage: buildMarginLeakage([]),
      executiveSummary: 'No usable procurement records were available for analysis.'
    };
  }

  const supplierScorecards = buildSupplierScorecards(normalizedRows);
  const marginLeakage = buildMarginLeakage(normalizedRows);
  const alerts = buildAlerts({ rows: normalizedRows, supplierScorecards, marginLeakage });
  const totalSpend = sum(normalizedRows, (row) => row.extendedCost);
  const categories = new Set(normalizedRows.map((row) => row.category));
  const suppliers = new Set(normalizedRows.map((row) => row.supplier));
  const lateRows = normalizedRows.filter((row) => row.daysLate > 0);

  return {
    mode: 'live-upload',
    source: options.source || 'uploaded procurement data',
    generatedAt: new Date().toISOString(),
    kpis: {
      rowCount: normalizedRows.length,
      totalSpend,
      supplierCount: suppliers.size,
      categoryCount: categories.size,
      lateLineCount: lateRows.length,
      lateSpend: sum(lateRows, (row) => row.extendedCost),
      projectedAnnualRecoveryUSD: marginLeakage.annualizedRecoveryOpportunity,
      activeAlertCount: alerts.length
    },
    alerts,
    supplierScorecards,
    marginLeakage,
    categorySpend: Object.entries(groupBy(normalizedRows, 'category'))
      .map(([category, categoryRows]) => ({ category, spend: sum(categoryRows, (row) => row.extendedCost), lineCount: categoryRows.length }))
      .sort((a, b) => b.spend - a.spend),
    executiveSummary: `Analyzed ${normalizedRows.length} live procurement rows across ${suppliers.size} suppliers and ${categories.size} categories. The engine identified ${alerts.length} actionable alerts, ${lateRows.length} late lines, and $${Math.round(marginLeakage.annualizedRecoveryOpportunity).toLocaleString()} in annualized margin recovery opportunity.`,
    buyerActions: alerts.slice(0, 5).map((alert) => ({
      priority: alert.type,
      action: alert.recommendedAction,
      reason: alert.rootCause,
      estimatedImpact: alert.financialImpact
    }))
  };
}

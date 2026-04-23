import xlsx from 'xlsx';

const COLUMN_ALIASES = {
  supplierName: ['vendor', 'supplier', 'suppliername'],
  partNumber: ['part', 'item', 'sku', 'material', 'partnumber'],
  description: ['description'],
  quantity: ['quantity', 'qty'],
  unitPrice: ['unitprice', 'price', 'cost'],
  extendedValue: ['extendedvalue', 'total', 'spend'],
  orderDate: ['orderdate', 'promisedate', 'needdate', 'releasedate'],
  category: ['category', 'commodity'],
  buyer: ['buyer'],
  uom: ['uom']
};

const num = (value) => {
  const n = Number(String(value ?? '').replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

function normalizeKey(key = '') {
  return key.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseUploadFile(file) {
  const fileName = (file?.originalname || '').toLowerCase();
  if (fileName.endsWith('.csv')) {
    const workbook = xlsx.read(file.buffer.toString('utf8'), { type: 'string' });
    return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  }

  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
}

export function normalizeProcurementRows(rows = []) {
  if (!rows.length) return { mappedColumns: {}, unmappedColumns: [], normalizedRows: [], validationErrors: [], warnings: [], summaryMetrics: {} };

  const firstRow = rows[0];
  const rawColumns = Object.keys(firstRow);
  const mappedColumns = {};
  const consumed = new Set();

  rawColumns.forEach((column) => {
    const normalizedColumn = normalizeKey(column);
    Object.entries(COLUMN_ALIASES).forEach(([target, aliases]) => {
      if (!mappedColumns[target] && aliases.includes(normalizedColumn)) {
        mappedColumns[target] = column;
        consumed.add(column);
      }
    });
  });

  const unmappedColumns = rawColumns.filter((column) => !consumed.has(column));
  const validationErrors = [];
  const warnings = [];
  const duplicateParts = new Set();
  const seenPartSupplier = new Set();

  const normalizedRows = rows.map((row, idx) => {
    const normalized = {
      supplier: row[mappedColumns.supplierName] || 'Unknown Supplier',
      item: row[mappedColumns.partNumber] || '',
      description: row[mappedColumns.description] || '',
      quantity: num(row[mappedColumns.quantity]),
      unitPrice: num(row[mappedColumns.unitPrice]),
      extendedValue: num(row[mappedColumns.extendedValue]),
      orderDate: row[mappedColumns.orderDate] || null,
      category: row[mappedColumns.category] || 'Uncategorized',
      buyer: row[mappedColumns.buyer] || 'Unassigned',
      uom: row[mappedColumns.uom] || 'EA'
    };

    if (!normalized.item) validationErrors.push({ rowNumber: idx + 2, field: 'item', message: 'Missing item/part number' });
    if (!normalized.quantity) warnings.push({ rowNumber: idx + 2, field: 'quantity', message: 'Quantity is zero or missing' });
    if (!normalized.unitPrice) warnings.push({ rowNumber: idx + 2, field: 'unitPrice', message: 'Price is zero or missing' });

    const key = `${normalized.item}::${normalized.supplier}`;
    if (seenPartSupplier.has(key)) duplicateParts.add(normalized.item);
    seenPartSupplier.add(key);

    return normalized;
  });

  const itemPrices = new Map();
  normalizedRows.forEach((row) => {
    if (!itemPrices.has(row.item)) itemPrices.set(row.item, []);
    itemPrices.get(row.item).push(row.unitPrice);
  });

  const priceVariance = [...itemPrices.entries()]
    .map(([item, prices]) => ({ item, variance: Math.max(...prices) - Math.min(...prices) }))
    .filter((entry) => entry.variance > 0);

  const supplierSpend = normalizedRows.reduce((acc, row) => {
    acc[row.supplier] = (acc[row.supplier] || 0) + row.extendedValue;
    return acc;
  }, {});

  const totalSpend = Object.values(supplierSpend).reduce((a, b) => a + b, 0);
  const topSupplierShare = totalSpend ? Math.max(...Object.values(supplierSpend)) / totalSpend : 0;

  return {
    mappedColumns,
    unmappedColumns,
    normalizedRows,
    validationErrors,
    warnings,
    summaryMetrics: {
      totalRows: normalizedRows.length,
      totalSpend,
      uniqueSuppliers: Object.keys(supplierSpend).length,
      duplicateParts: [...duplicateParts],
      priceVariance,
      supplierConcentration: Number((topSupplierShare * 100).toFixed(1)),
      recommendedNextActions: [
        topSupplierShare > 0.45 ? 'Launch supplier diversification event for concentrated categories.' : 'Concentration within target range.',
        priceVariance.length ? 'Create RFQ for top variance items.' : 'No cross-supplier price variance detected.',
        validationErrors.length ? 'Route rows with missing fields to Purchasing Assistant queue.' : 'Dataset ready for buyer review.'
      ]
    }
  };
}

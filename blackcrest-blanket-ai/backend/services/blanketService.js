const { buildColumnMap } = require('../utils/columnMapper');
const { parseNumber, parsePercentage, cleanString } = require('../utils/parsers');

const toKey = (...parts) => parts.map((p) => cleanString(p).toLowerCase()).join('|');

const getIssue = (issueType, issueDescription, row) => ({
  rowNumber: row.rowNumber,
  item: row.item,
  vendor: row.vendor,
  project: row.project,
  task: row.task,
  issueType,
  issueDescription
});

const createProjectTaskLabel = (project, task) => {
  if (project && task) return `Project: ${project} | Task: ${task}`;
  if (project) return `Project: ${project}`;
  if (task) return `Task: ${task}`;
  return 'Unassigned';
};

const processDemandRows = (rawRows = []) => {
  if (!rawRows.length) {
    return {
      message: 'Processed successfully',
      demandSummary: {
        totalLinesProcessed: 0,
        totalVendors: 0,
        totalItems: 0,
        totalAdjustedQuantity: 0,
        totalEstimatedSpend: 0,
        totalProjects: 0,
        totalTasks: 0
      },
      vendorSummary: [],
      itemSummary: [],
      financeSummary: [],
      blanketRecommendations: [],
      exceptions: [],
      processedRows: []
    };
  }

  const headers = Object.keys(rawRows[0]);
  const columnMap = buildColumnMap(headers);

  const requiredLogicalColumns = ['item', 'vendor', 'quantityToOrder', 'demand', 'pricing'];
  const missingColumns = requiredLogicalColumns.filter((key) => !columnMap[key]);
  if (missingColumns.length > 0) {
    throw new Error(`Missing expected columns (or aliases): ${missingColumns.join(', ')}`);
  }

  const processedRows = [];
  const exceptions = [];
  const duplicateTracker = new Map();
  const vendorItemTracker = new Map();

  rawRows.forEach((sourceRow, index) => {
    const rowNumber = index + 2;
    const item = cleanString(sourceRow[columnMap.item]);
    const vendor = cleanString(sourceRow[columnMap.vendor]);
    const quantityToOrder = parseNumber(sourceRow[columnMap.quantityToOrder]);
    const scrapPercentage = parsePercentage(sourceRow[columnMap.scrapPercentage], 0);
    const pricing = parseNumber(sourceRow[columnMap.pricing], 0);
    const demand = parseNumber(sourceRow[columnMap.demand]);
    const project = cleanString(sourceRow[columnMap.project]);
    const task = cleanString(sourceRow[columnMap.task]);
    const needDate = cleanString(sourceRow[columnMap.needDate]);
    const uom = cleanString(sourceRow[columnMap.uom]);
    const description = cleanString(sourceRow[columnMap.description]);
    const buyer = cleanString(sourceRow[columnMap.buyer]);
    const leadTime = cleanString(sourceRow[columnMap.leadTime]);

    const baseQuantity = quantityToOrder;
    const scrapFactor = 1 + (scrapPercentage || 0) / 100;
    const adjustedQuantity = baseQuantity === null ? null : Number((baseQuantity * scrapFactor).toFixed(2));
    const roundedAdjustedQuantity = adjustedQuantity === null ? null : Math.round(adjustedQuantity);
    const variance = adjustedQuantity !== null && demand !== null ? Number((adjustedQuantity - demand).toFixed(2)) : null;
    const extendedCost = adjustedQuantity !== null ? Number((adjustedQuantity * (pricing || 0)).toFixed(2)) : 0;

    const financeTagged = Boolean(project && task);
    const projectTaskLabel = createProjectTaskLabel(project, task);

    const exceptionFlags = [];
    if (!item) exceptionFlags.push('missing_item');
    if (!vendor) exceptionFlags.push('missing_vendor');
    if (quantityToOrder === null) exceptionFlags.push('missing_quantity');
    if (demand === null) exceptionFlags.push('missing_demand');
    if (!pricing) exceptionFlags.push('missing_price');
    if ((quantityToOrder ?? 0) < 0 || (demand ?? 0) < 0 || (pricing ?? 0) < 0 || scrapPercentage < 0) {
      exceptionFlags.push('negative_value');
    }
    if (scrapPercentage > 50) exceptionFlags.push('scrap_threshold_exceeded');
    if (adjustedQuantity !== null && demand !== null && demand > 0 && adjustedQuantity > demand * 1.25) {
      exceptionFlags.push('materially_higher_than_demand');
    }

    const duplicateKey = toKey(item, vendor, project, task, needDate);
    if (duplicateTracker.has(duplicateKey)) {
      exceptionFlags.push('duplicate_row');
    } else {
      duplicateTracker.set(duplicateKey, rowNumber);
    }

    if (item && vendor) {
      const vendorSet = vendorItemTracker.get(item) || new Set();
      vendorSet.add(vendor);
      vendorItemTracker.set(item, vendorSet);
    }

    let status = 'exact match';
    if (demand === null) status = 'missing demand';
    else if (quantityToOrder === null) status = 'missing quantity';
    else if (!pricing) status = 'missing price';
    else if (!vendor) status = 'missing vendor';
    else if (variance > 0) status = 'over planned';
    else if (variance < 0) status = 'under planned';

    const processed = {
      rowNumber,
      item,
      vendor,
      quantityToOrder,
      scrapPercentage,
      adjustedQuantity,
      roundedAdjustedQuantity,
      demand,
      variance,
      pricing,
      extendedCost,
      project,
      task,
      projectTaskLabel,
      needDate,
      uom,
      description,
      buyer,
      leadTime,
      financeTagged,
      status,
      exceptionFlags
    };

    processedRows.push(processed);

    exceptionFlags.forEach((flag) => {
      const descriptions = {
        missing_item: 'Item is required for blanket recommendation grouping.',
        missing_vendor: 'Vendor is required to build blanket PO recommendations.',
        missing_quantity: 'Quantity to order is missing or invalid.',
        missing_demand: 'Demand value is missing or invalid.',
        missing_price: 'Pricing is missing or zero; spend calculations may be understated.',
        negative_value: 'One or more numeric values are negative.',
        scrap_threshold_exceeded: 'Scrap percentage exceeds threshold of 50%.',
        duplicate_row: 'Likely duplicate based on item + vendor + project + task + need date.',
        materially_higher_than_demand: 'Adjusted quantity is materially above demand (>25%).'
      };

      exceptions.push(getIssue(flag, descriptions[flag], processed));
    });
  });

  processedRows.forEach((row) => {
    const vendorsForItem = vendorItemTracker.get(row.item) || new Set();
    if (vendorsForItem.size > 1) {
      row.exceptionFlags.push('multi_vendor_item_review');
      exceptions.push(
        getIssue(
          'multi_vendor_item_review',
          'Same item appears with multiple vendors; review sourcing strategy.',
          row
        )
      );
    }
  });

  const vendorMap = new Map();
  const itemMap = new Map();
  const financeMap = new Map();
  const blanketMap = new Map();

  processedRows.forEach((row) => {
    const vendorKey = row.vendor || 'UNASSIGNED_VENDOR';
    if (!vendorMap.has(vendorKey)) {
      vendorMap.set(vendorKey, {
        vendor: vendorKey,
        lineCount: 0,
        totalAdjustedQuantity: 0,
        totalExtendedCost: 0,
        uniqueItems: new Set(),
        exceptionCount: 0
      });
    }
    const vendorEntry = vendorMap.get(vendorKey);
    vendorEntry.lineCount += 1;
    vendorEntry.totalAdjustedQuantity += row.adjustedQuantity || 0;
    vendorEntry.totalExtendedCost += row.extendedCost || 0;
    if (row.item) vendorEntry.uniqueItems.add(row.item);
    vendorEntry.exceptionCount += row.exceptionFlags.length;

    const itemKey = row.item || 'UNASSIGNED_ITEM';
    if (!itemMap.has(itemKey)) {
      itemMap.set(itemKey, {
        item: itemKey,
        totalQuantity: 0,
        totalAdjustedQuantity: 0,
        priceAccumulator: 0,
        priceCount: 0,
        totalExtendedCost: 0,
        associatedVendors: new Set(),
        associatedProjectTasks: new Set()
      });
    }
    const itemEntry = itemMap.get(itemKey);
    itemEntry.totalQuantity += row.quantityToOrder || 0;
    itemEntry.totalAdjustedQuantity += row.adjustedQuantity || 0;
    if (row.pricing > 0) {
      itemEntry.priceAccumulator += row.pricing;
      itemEntry.priceCount += 1;
    }
    itemEntry.totalExtendedCost += row.extendedCost || 0;
    if (row.vendor) itemEntry.associatedVendors.add(row.vendor);
    itemEntry.associatedProjectTasks.add(row.projectTaskLabel);

    const financeKey = toKey(row.project || 'UNASSIGNED_PROJECT', row.task || 'UNASSIGNED_TASK');
    if (!financeMap.has(financeKey)) {
      financeMap.set(financeKey, {
        project: row.project || 'Unassigned',
        task: row.task || 'Unassigned',
        totalLines: 0,
        totalAdjustedQuantity: 0,
        totalSpend: 0,
        vendorsInvolved: new Set(),
        itemsInvolved: new Set()
      });
    }
    const financeEntry = financeMap.get(financeKey);
    financeEntry.totalLines += 1;
    financeEntry.totalAdjustedQuantity += row.adjustedQuantity || 0;
    financeEntry.totalSpend += row.extendedCost || 0;
    if (row.vendor) financeEntry.vendorsInvolved.add(row.vendor);
    if (row.item) financeEntry.itemsInvolved.add(row.item);

    const blanketKey = toKey(row.vendor || 'UNASSIGNED_VENDOR', row.project || 'UNASSIGNED_PROJECT', row.task || 'UNASSIGNED_TASK');
    if (!blanketMap.has(blanketKey)) {
      blanketMap.set(blanketKey, {
        recommendedBlanketVendor: row.vendor || 'Unassigned Vendor',
        project: row.project || 'Unassigned',
        task: row.task || 'Unassigned',
        projectTaskLabel: row.projectTaskLabel,
        lineCount: 0,
        totalAdjustedQuantity: 0,
        totalSpend: 0,
        includedItems: new Set(),
        suggestion: 'Rows with the same vendor and project/task are candidates for a single blanket PO.'
      });
    }
    const blanketEntry = blanketMap.get(blanketKey);
    blanketEntry.lineCount += 1;
    blanketEntry.totalAdjustedQuantity += row.adjustedQuantity || 0;
    blanketEntry.totalSpend += row.extendedCost || 0;
    if (row.item) blanketEntry.includedItems.add(row.item);
  });

  const vendorSummary = [...vendorMap.values()].map((v) => ({
    vendor: v.vendor,
    lineCount: v.lineCount,
    totalAdjustedQuantity: Number(v.totalAdjustedQuantity.toFixed(2)),
    totalExtendedCost: Number(v.totalExtendedCost.toFixed(2)),
    uniqueItems: v.uniqueItems.size,
    exceptionCount: v.exceptionCount
  }));

  const itemSummary = [...itemMap.values()].map((i) => ({
    item: i.item,
    totalQuantity: Number(i.totalQuantity.toFixed(2)),
    totalAdjustedQuantity: Number(i.totalAdjustedQuantity.toFixed(2)),
    averagePrice: i.priceCount ? Number((i.priceAccumulator / i.priceCount).toFixed(2)) : 0,
    totalExtendedCost: Number(i.totalExtendedCost.toFixed(2)),
    associatedVendors: [...i.associatedVendors],
    associatedProjectTasks: [...i.associatedProjectTasks]
  }));

  const financeSummary = [...financeMap.values()].map((f) => ({
    project: f.project,
    task: f.task,
    totalLines: f.totalLines,
    totalAdjustedQuantity: Number(f.totalAdjustedQuantity.toFixed(2)),
    totalSpend: Number(f.totalSpend.toFixed(2)),
    vendorsInvolved: [...f.vendorsInvolved],
    itemsInvolved: [...f.itemsInvolved]
  }));

  const blanketRecommendations = [...blanketMap.values()].map((b) => ({
    recommendedBlanketVendor: b.recommendedBlanketVendor,
    project: b.project,
    task: b.task,
    projectTaskLabel: b.projectTaskLabel,
    lineCount: b.lineCount,
    totalAdjustedQuantity: Number(b.totalAdjustedQuantity.toFixed(2)),
    totalSpend: Number(b.totalSpend.toFixed(2)),
    includedItems: [...b.includedItems],
    suggestion: b.suggestion
  }));

  const demandSummary = {
    totalLinesProcessed: processedRows.length,
    totalVendors: new Set(processedRows.map((r) => r.vendor).filter(Boolean)).size,
    totalItems: new Set(processedRows.map((r) => r.item).filter(Boolean)).size,
    totalAdjustedQuantity: Number(
      processedRows.reduce((sum, row) => sum + (row.adjustedQuantity || 0), 0).toFixed(2)
    ),
    totalEstimatedSpend: Number(
      processedRows.reduce((sum, row) => sum + (row.extendedCost || 0), 0).toFixed(2)
    ),
    totalProjects: new Set(processedRows.map((r) => r.project).filter(Boolean)).size,
    totalTasks: new Set(processedRows.map((r) => r.task).filter(Boolean)).size
  };

  return {
    message: 'Processed successfully',
    demandSummary,
    vendorSummary,
    itemSummary,
    financeSummary,
    blanketRecommendations,
    exceptions,
    processedRows
  };
};

module.exports = {
  processDemandRows
};

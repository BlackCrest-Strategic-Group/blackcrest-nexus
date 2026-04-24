import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMarginLeaks } from '../server/services/marginLeakService.js';
import { buildSupplierRecommendations } from '../server/services/supplierRecommendationEngine.js';
import { normalizeProcurementRows } from '../server/services/procurementIngestionService.js';
import { createErpConnector } from '../server/services/erpConnectorService.js';
import { generateReport } from '../server/services/reportCenterService.js';
import { getInvestorDemoData } from '../server/services/procurementDemoData.js';

test('CSV/XLSX ingestion normalization returns mapped columns and metrics', () => {
  const rows = [{ vendor: 'A', part: 'P1', qty: '10', price: '12.50', total: '125' }];
  const result = normalizeProcurementRows(rows);
  assert.equal(result.mappedColumns.supplierName, 'vendor');
  assert.equal(result.summaryMetrics.totalRows, 1);
});

test('margin leak detection returns alerts', () => {
  const rows = [
    { supplier: 'A', item: 'X', quantity: 10, unitPrice: 10, extendedValue: 100 },
    { supplier: 'B', item: 'X', quantity: 10, unitPrice: 14, extendedValue: 140 }
  ];
  const result = analyzeMarginLeaks(rows);
  assert.ok(result.alerts.length > 0);
});

test('supplier recommendation output includes disclaimer', () => {
  const catalog = getInvestorDemoData().suppliers;
  const result = buildSupplierRecommendations({ category: 'MRO', catalog });
  assert.match(result.disclaimer, /public, uploaded, or synthetic/i);
  assert.ok(result.recommendations.length > 0);
});

test('ERP connector profile validation/create defaults read-only', () => {
  const connector = createErpConnector({ provider: 'Infor / Syteline', mode: 'api' });
  assert.equal(connector.readOnly, true);
  assert.equal(connector.provider, 'Infor / Syteline');
});

test('report generation returns printable report', () => {
  const report = generateReport('Executive Summary', { totalEstimatedLeakage: 1234 });
  assert.equal(report.printableLabel, 'Print / Save as PDF');
});

test('investor demo summary story is available', () => {
  const demo = getInvestorDemoData();
  assert.match(demo.narrative, /BlackCrest identifies \$428K/i);
});

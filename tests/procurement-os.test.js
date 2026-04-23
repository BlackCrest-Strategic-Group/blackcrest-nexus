import { analyzeMarginLeaks } from '../server/services/marginLeakService.js';
import { buildSupplierRecommendations } from '../server/services/supplierRecommendationEngine.js';
import { normalizeProcurementRows } from '../server/services/procurementIngestionService.js';
import { createErpConnector } from '../server/services/erpConnectorService.js';
import { generateReport } from '../server/services/reportCenterService.js';
import { getInvestorDemoData } from '../server/services/procurementDemoData.js';

describe('procurement OS services', () => {
  test('CSV/XLSX ingestion normalization returns mapped columns and metrics', () => {
    const rows = [{ vendor: 'A', part: 'P1', qty: '10', price: '12.50', total: '125' }];
    const result = normalizeProcurementRows(rows);
    expect(result.mappedColumns.supplierName).toBe('vendor');
    expect(result.summaryMetrics.totalRows).toBe(1);
  });

  test('margin leak detection returns alerts', () => {
    const rows = [
      { supplier: 'A', item: 'X', quantity: 10, unitPrice: 10, extendedValue: 100 },
      { supplier: 'B', item: 'X', quantity: 10, unitPrice: 14, extendedValue: 140 }
    ];
    const result = analyzeMarginLeaks(rows);
    expect(result.alerts.length).toBeGreaterThan(0);
  });

  test('supplier recommendation output includes disclaimer', () => {
    const catalog = getInvestorDemoData().suppliers;
    const result = buildSupplierRecommendations({ category: 'MRO', catalog });
    expect(result.disclaimer).toMatch(/public, uploaded, or synthetic/i);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('ERP connector profile validation/create defaults read-only', () => {
    const connector = createErpConnector({ provider: 'Infor / Syteline', mode: 'api' });
    expect(connector.readOnly).toBe(true);
    expect(connector.provider).toBe('Infor / Syteline');
  });

  test('report generation returns printable report', () => {
    const report = generateReport('Executive Summary', { totalEstimatedLeakage: 1234 });
    expect(report.printableLabel).toBe('Print / Save as PDF');
  });

  test('investor demo summary story is available', () => {
    const demo = getInvestorDemoData();
    expect(demo.narrative).toMatch(/BlackCrest identifies \$428K/i);
  });
});

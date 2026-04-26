import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProcurementIntelligence } from '../server/sentinel/services/intelligenceEngine.js';
import { buildMarginLeakIntelligence } from '../server/sentinel/services/marginLeakIntelligence.js';
import { buildSupplierRiskRadar } from '../server/sentinel/services/supplierRiskRadar.js';
import { filterIntelligenceByRole } from '../server/sentinel/services/roleIntelligenceFilter.js';
import { buildSentinelAuditFeed } from '../server/sentinel/services/sentinelAuditFeed.js';
import { buildSentinelOverview } from '../server/services/sentinelData.js';

const suppliers = [
  { id: 's-1', name: 'Supplier A', category: 'Electronics' },
  { id: 's-2', name: 'Supplier B', category: 'Logistics' }
];

const rows = [
  {
    supplier: 'Supplier A',
    item: 'Widget-1',
    quantity: 120,
    unitPrice: 140,
    baselinePrice: 120,
    extendedValue: 16800,
    expediteFlag: true,
    invoiceVarianceAmount: 1800,
    excessInventoryCost: 900
  },
  {
    supplier: 'Supplier B',
    item: 'Widget-2',
    quantity: 90,
    unitPrice: 190,
    baselinePrice: 160,
    extendedValue: 17100,
    premiumShippingFlag: true,
    moqPenaltyFlag: true,
    invoiceVarianceAmount: 2500,
    excessInventoryCost: 1100
  }
];

test('central intelligence engine returns explainable intelligence objects', () => {
  const result = buildProcurementIntelligence({ suppliers, rows });
  assert.ok(result.intelligence.length >= 2);
  const first = result.intelligence[0];
  assert.ok(first.id);
  assert.ok(first.rootCause);
  assert.ok(first.sourceSignals.length > 0);
  assert.ok(first.auditReference);
});

test('margin leak intelligence calculates weekly/monthly/annualized leakage estimates', () => {
  const result = buildMarginLeakIntelligence(rows);
  assert.ok(result.weeklyLeakageEstimate > 0);
  assert.equal(result.monthlyLeakageEstimate, Math.round(result.weeklyLeakageEstimate * 4.33));
  assert.equal(result.annualizedLeakageEstimate, result.monthlyLeakageEstimate * 12);
  assert.ok(result.topDrivers.length > 0);
});

test('supplier risk radar scoring returns health score and reasoning', () => {
  const result = buildSupplierRiskRadar(suppliers);
  assert.equal(result.length, suppliers.length);
  assert.ok(result[0].supplierHealthScore >= 0 && result[0].supplierHealthScore <= 100);
  assert.ok(result[0].explainableReasoning.length > 0);
});

test('role filtering scopes intelligence to role priorities', () => {
  const intelligence = buildProcurementIntelligence({ suppliers, rows }).intelligence;
  const buyerView = filterIntelligenceByRole(intelligence, 'buyer');
  const executiveView = filterIntelligenceByRole(intelligence, 'executive');
  assert.ok(buyerView.length > 0);
  assert.ok(executiveView.length > 0);
});

test('sentinel audit feed contains expected governance event types', () => {
  const feed = buildSentinelAuditFeed();
  assert.ok(feed.some((item) => item.eventType === 'upload'));
  assert.ok(feed.some((item) => item.eventType === 'alert_interaction'));
  assert.ok(feed.every((item) => item.auditReference.startsWith('AUD-')));
});

test('overview includes role-aware intelligence and drilldown-ready alerts', () => {
  const overview = buildSentinelOverview({ roleGroup: 'director' });
  assert.ok(overview.alerts.length > 0);
  assert.ok(overview.intelligence.length > 0);
  assert.ok(overview.sentinel.readOnlyIntelligenceLayer);
  assert.ok(Array.isArray(overview.rolePriorities));
});

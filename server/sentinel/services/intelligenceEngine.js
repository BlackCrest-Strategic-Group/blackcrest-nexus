import { buildMarginLeakIntelligence } from './marginLeakIntelligence.js';
import { buildSupplierRiskRadar } from './supplierRiskRadar.js';

function toSeverityScore(severity) {
  if (severity === 'Critical') return 95;
  if (severity === 'High') return 80;
  if (severity === 'Medium') return 62;
  return 45;
}

function mockSignals() {
  return [
    { signal: 'expedite_freight_spike', value: '+14%', source: 'ERP Freight Ledger' },
    { signal: 'late_delivery_trend', value: '+9%', source: 'OTD Stream' },
    { signal: 'invoice_variance_rise', value: '+5.2%', source: 'AP Reconciliation' }
  ];
}

export function buildProcurementIntelligence({ suppliers = [], rows = [] }) {
  const generatedAt = new Date().toISOString();
  const marginLeak = buildMarginLeakIntelligence(rows);
  const supplierRadar = buildSupplierRiskRadar(suppliers);
  const sourceSignals = mockSignals();

  const alerts = [
    {
      id: 'intel-margin-1',
      type: 'margin_leakage',
      severity: 'High',
      title: 'Expedited freight and invoice variance are eroding margin.',
      summary: 'Weekly leakage trend increased due to emergency shipping and price creep.',
      rootCause: 'Planning variability triggered expedited orders while three suppliers drifted above baseline cost bands.',
      sourceSignals,
      financialImpact: {
        estimatedWeeklyUSD: marginLeak.weeklyLeakageEstimate,
        estimatedMonthlyUSD: marginLeak.monthlyLeakageEstimate,
        annualizedUSD: marginLeak.annualizedLeakageEstimate
      },
      confidenceScore: 0.86,
      recommendedActions: marginLeak.recoveryRecommendations,
      createdAt: generatedAt,
      affectedEntities: {
        suppliers: marginLeak.highestRiskSuppliers.map((item) => item.supplier),
        programs: ['Program Atlas', 'Program Keystone'],
        categories: ['Logistics', 'Electronics']
      },
      auditReference: 'AUD-INTEL-0001',
      tags: ['margin_exposure', 'savings', 'urgent_risk', 'shared'],
      timeline: [
        { at: generatedAt, status: 'Open', note: 'Leakage threshold breached > $75K weekly.' },
        { at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Monitoring', note: 'Cost creep signal elevated in two suppliers.' }
      ],
      aiReasoningSummary: 'The engine correlated freight escalation, invoice mismatch, and supplier cost drift to estimate a high-confidence leakage scenario.',
      dataClassification: 'Confidential',
      governance: {
        readOnlyIntelligence: true,
        humanApprovalRequired: true,
        autonomousProcurementBlocked: true
      }
    }
  ];

  supplierRadar.slice(0, 3).forEach((supplier, idx) => {
    const severity = supplier.riskLevel === 'High' ? 'Critical' : supplier.riskLevel === 'Medium' ? 'High' : 'Medium';
    alerts.push({
      id: `intel-supplier-${idx + 1}`,
      type: 'supplier_risk',
      severity,
      title: `${supplier.supplierName} supplier health has deteriorated.`,
      summary: `${supplier.supplierName} shows ${supplier.trendDirection.toLowerCase()} performance in delivery and pricing stability indicators.`,
      rootCause: supplier.explainableReasoning.join(' '),
      sourceSignals,
      financialImpact: {
        estimatedWeeklyUSD: Math.round((100 - supplier.supplierHealthScore) * 1200),
        estimatedMonthlyUSD: Math.round((100 - supplier.supplierHealthScore) * 1200 * 4.33),
        annualizedUSD: Math.round((100 - supplier.supplierHealthScore) * 1200 * 4.33 * 12)
      },
      confidenceScore: Math.max(0.58, supplier.supplierHealthScore / 100),
      recommendedActions: supplier.mitigationRecommendations,
      createdAt: generatedAt,
      affectedEntities: {
        suppliers: [supplier.supplierName],
        programs: ['Program Atlas'],
        categories: [supplier.category]
      },
      auditReference: `AUD-INTEL-${String(idx + 2).padStart(4, '0')}`,
      tags: ['supplier_concentration', 'supplier_trend', 'risk_posture', 'shared'],
      timeline: [
        { at: generatedAt, status: 'Open', note: 'Risk score exceeded threshold.' },
        { at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), status: 'Escalated', note: 'Delivery trend deterioration crossed control limit.' }
      ],
      aiReasoningSummary: 'Sentinel weighted delivery, quality, pricing instability, and concentration exposure to rank this supplier as elevated risk.',
      dataClassification: 'Proprietary',
      governance: {
        readOnlyIntelligence: true,
        humanApprovalRequired: true,
        autonomousProcurementBlocked: true
      }
    });
  });

  return {
    generatedAt,
    marginLeak,
    supplierRadar,
    intelligence: alerts.sort((a, b) => toSeverityScore(b.severity) - toSeverityScore(a.severity))
  };
}

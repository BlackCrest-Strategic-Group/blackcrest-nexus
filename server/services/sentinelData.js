import { buildProcurementIntelligence } from '../sentinel/services/intelligenceEngine.js';
import { buildExecutiveNarratives } from '../sentinel/services/executiveNarrativeEngine.js';
import { buildSentinelAuditFeed } from '../sentinel/services/sentinelAuditFeed.js';
import { filterIntelligenceByRole, prioritiesForRole } from '../sentinel/services/roleIntelligenceFilter.js';

const categories = ['Electronics', 'MRO', 'Logistics', 'Industrial Gases', 'IT Services', 'Packaging', 'Raw Materials'];
const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];

function seededNumber(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const n = x - Math.floor(x);
  return Math.round(min + n * (max - min));
}

function alertStatusFromSeverity(severity) {
  if (severity === 'Critical' || severity === 'High') return 'Open';
  if (severity === 'Medium') return 'Acknowledged';
  return 'Resolved';
}

function alertOwnerFromType(type) {
  if (type === 'margin_leakage') return 'Procurement Manager';
  if (type === 'supplier_risk') return 'Supplier Risk Lead';
  return 'Sentinel Ops';
}

export function buildSentinelDemoSuppliers() {
  return Array.from({ length: 25 }).map((_, i) => {
    const index = i + 1;
    const score = seededNumber(index * 11, 62, 97);
    const onTime = seededNumber(index * 13, 78, 99);
    const quality = seededNumber(index * 17, 80, 99);
    const riskLevel = score > 86 ? 'Low' : score > 74 ? 'Medium' : 'High';
    return {
      id: `sup-${index}`,
      name: `Sentinel Supplier ${index}`,
      category: categories[index % categories.length],
      region: regions[index % regions.length],
      riskLevel,
      score,
      onTimeDelivery: onTime,
      qualityRating: quality,
      avgLeadTimeDays: seededNumber(index * 19, 8, 34),
      contractsExpiring: seededNumber(index * 23, 0, 3),
      complianceStatus: score > 72 ? 'Compliant' : 'Review Required'
    };
  });
}

export function buildSentinelOpportunities() {
  const pursuits = ['Qualify', 'Pursue', 'Watch', 'No-Bid'];
  return Array.from({ length: 14 }).map((_, i) => {
    const idx = i + 1;
    const fitScore = seededNumber(idx * 29, 58, 96);
    const value = seededNumber(idx * 31, 250000, 8200000);
    return {
      id: `opp-${idx}`,
      title: `Federal Sourcing Opportunity ${idx}`,
      agency: ['DHS', 'DoD', 'DOE', 'GSA', 'VA'][idx % 5],
      naics: ['541512', '334111', '561210', '541330', '423450'][idx % 5],
      owner: ['Avery CEO', 'Jordan Director', 'Taylor Category', 'Riley Buyer'][idx % 4],
      dueDate: `2026-0${(idx % 8) + 5}-${String((idx * 3) % 27 + 1).padStart(2, '0')}`,
      fitScore,
      estimatedValue: value,
      pursuit: pursuits[idx % pursuits.length],
      riskFlags: seededNumber(idx * 37, 0, 4)
    };
  });
}

function buildDemoRows(suppliers = []) {
  return suppliers.slice(0, 12).map((supplier, idx) => ({
    supplier: supplier.name,
    item: `Item-${(idx % 6) + 1}`,
    quantity: seededNumber(idx * 5 + 3, 20, 220),
    unitPrice: seededNumber(idx * 7 + 4, 65, 240),
    baselinePrice: seededNumber(idx * 11 + 2, 55, 210),
    extendedValue: seededNumber(idx * 13 + 8, 5000, 60000),
    expediteFlag: idx % 3 === 0,
    premiumShippingFlag: idx % 5 === 0,
    moqPenaltyFlag: idx % 4 === 0,
    invoiceVarianceAmount: seededNumber(idx * 17 + 1, 0, 7000),
    excessInventoryCost: seededNumber(idx * 19 + 6, 500, 5500)
  }));
}

export function buildSentinelOverview({ roleGroup = 'executive' } = {}) {
  const suppliers = buildSentinelDemoSuppliers();
  const opportunities = buildSentinelOpportunities();
  const rows = buildDemoRows(suppliers);
  const intelligenceBundle = buildProcurementIntelligence({ suppliers, rows });
  const scopedIntelligence = filterIntelligenceByRole(intelligenceBundle.intelligence, roleGroup);
  const activityFeed = buildSentinelAuditFeed();

  const alerts = scopedIntelligence.map((item) => ({
    id: item.id,
    type: item.severity,
    title: item.title,
    owner: alertOwnerFromType(item.type),
    status: alertStatusFromSeverity(item.severity),
    category: item.type,
    createdAt: item.createdAt,
    confidenceScore: item.confidenceScore,
    auditReference: item.auditReference
  }));

  const activeAlerts = alerts.filter((a) => a.status !== 'Resolved');
  const narratives = buildExecutiveNarratives({
    marginLeak: intelligenceBundle.marginLeak,
    supplierRisks: intelligenceBundle.supplierRadar,
    activeAlerts
  });

  return {
    kpis: {
      procurementHealthScore: 84,
      activeAlerts: activeAlerts.length,
      highRiskSuppliers: suppliers.filter((s) => s.riskLevel === 'High').length,
      trackedOpportunities: opportunities.length,
      sourcingVelocityIndex: 91,
      projectedSavingsUSD: 3460000,
      marginLeakageAnnualizedUSD: intelligenceBundle.marginLeak.annualizedLeakageEstimate
    },
    alerts,
    intelligence: scopedIntelligence,
    signals: intelligenceBundle.intelligence[0]?.sourceSignals || [],
    riskHeatmap: categories.map((category, idx) => ({
      category,
      riskScore: seededNumber(idx * 41 + 5, 38, 94),
      supplierConcentration: seededNumber(idx * 43 + 4, 23, 79),
      disruptionLikelihood: seededNumber(idx * 47 + 9, 14, 72)
    })),
    recommendations: intelligenceBundle.marginLeak.recoveryRecommendations,
    executiveNarratives: narratives,
    rolePriorities: prioritiesForRole(roleGroup),
    marginLeakage: intelligenceBundle.marginLeak,
    supplierRiskRadar: intelligenceBundle.supplierRadar,
    activityFeed,
    sentinel: {
      readOnlyIntelligenceLayer: true,
      noAutonomousPOCreation: true,
      humanInTheLoop: true,
      noSharedModelTrainingOnCustomerData: true,
      governanceFirstArchitecture: true,
      dataClassificationSupported: ['Internal', 'Confidential', 'Proprietary', 'ITAR', 'CUI', 'Export Controlled']
    },
    suppliers,
    opportunities
  };
}

export function getSentinelAlertDetail(alertId, options = {}) {
  const { intelligence } = buildSentinelOverview(options);
  return intelligence.find((item) => item.id === alertId) || null;
}

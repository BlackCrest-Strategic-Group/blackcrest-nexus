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

function buildAlertDetails() {
  return [
    {
      id: 'al-1',
      type: 'Critical',
      alertType: 'Margin leakage',
      title: 'Margin leakage detected in precision metals book',
      owner: 'Category Lead',
      status: 'Open',
      category: 'Raw Materials',
      createdAt: '2026-04-24T14:20:00.000Z',
      happened: 'Gross margin on aluminum housing assemblies dropped from 23.8% to 17.1% over the last two PO cycles.',
      driver: 'Supplier price increases were accepted while customer resale pricing remained unchanged.',
      financialImpact: '$18,420 estimated monthly margin loss and $221,040 projected annualized profit erosion if no action is taken.',
      rootCause: 'No automated pass-through pricing trigger between PO cost changes and customer repricing governance.',
      relatedEntities: {
        supplier: 'ABC Metals',
        po: 'PO-89431',
        category: 'Raw Materials',
        contract: 'CNT-AL-2024-019',
        buyer: 'Morgan Ellis (Senior Buyer)',
        item: 'Aluminum housing, Item AL-HSG-440'
      },
      evidence: [
        'PO unit cost increased 12.4% in 45 days.',
        'Customer sell price unchanged for 90 days.',
        'Recovery gap across 3 active customer accounts totals $18,420/month.',
        'Contract amendment request was drafted but never routed for approval.'
      ],
      recommendedAction: 'Review customer pricing immediately, renegotiate supplier cost, and flag these accounts for margin recovery.',
      priorityLevel: 'P1 - Immediate',
      responsibleRole: 'Category Manager with Commercial Finance partner',
      nextBestAction: 'Open a same-day margin recovery workstream and issue repricing notices by end of week.'
    },
    {
      id: 'al-2',
      type: 'Critical',
      alertType: 'Supplier delivery risk',
      title: 'Supplier delivery risk escalated for cross-border electronics lane',
      owner: 'Procurement Ops',
      status: 'Open',
      category: 'Electronics',
      createdAt: '2026-04-23T09:10:00.000Z',
      happened: 'On-time delivery fell to 76% for three consecutive weeks on high-value controller boards.',
      driver: 'Lead-time compression and customs delays are colliding with a single expedited freight dependency.',
      financialImpact: '$640,000 at-risk revenue from delayed production starts plus $42,000/month in premium freight.',
      rootCause: 'Inadequate dual-lane logistics planning for a constrained supplier route.',
      relatedEntities: { supplier: 'Nova Circuits', po: 'PO-90112', category: 'Electronics', contract: 'CNT-EL-2025-011', buyer: 'Reese Patel', item: 'Controller board CB-77' },
      evidence: ['Average lead time increased from 18 to 29 days.', '4 of 11 shipments held at customs over the last month.', 'Expedite fees increased 38% month-over-month.'],
      recommendedAction: 'Qualify backup freight lane, rebalance allocations, and trigger supplier recovery plan with weekly checkpoints.',
      priorityLevel: 'P1 - Immediate',
      responsibleRole: 'Procurement Operations Manager',
      nextBestAction: 'Approve dual-lane logistics exception and assign a dedicated expeditor today.'
    },
    {
      id: 'al-3',
      type: 'High',
      alertType: 'Supplier quality risk',
      title: 'Supplier quality risk trending above acceptance threshold',
      owner: 'Supplier Quality',
      status: 'Open',
      category: 'Industrial Gases',
      createdAt: '2026-04-22T08:35:00.000Z',
      happened: 'Defect rate reached 3.9% versus a 1.5% contractual quality threshold.',
      driver: 'Incoming inspections found rising contamination in cylinder valve assemblies.',
      financialImpact: '$96,000 in rework and scrap exposure this quarter plus potential customer penalty risk.',
      rootCause: 'Supplier process-control drift after line changeover without PPAP revalidation.',
      relatedEntities: { supplier: 'Helios Gas Systems', po: 'PO-88802', category: 'Industrial Gases', contract: 'CNT-IG-2025-007', buyer: 'Taylor Nguyen', item: 'Valve assembly V-230' },
      evidence: ['5 consecutive lots failed incoming inspection.', 'Supplier CAPA has been open for 27 days with no closure evidence.', 'Field complaint volume increased by 22%.'],
      recommendedAction: 'Institute controlled shipping, require corrective action closure, and shift 30% of volume to alternate source.',
      priorityLevel: 'P2 - High',
      responsibleRole: 'Supplier Quality Engineer and Category Manager',
      nextBestAction: 'Run 24-hour containment review and block nonconforming lots.'
    },
    {
      id: 'al-4',
      type: 'High',
      alertType: 'Price variance',
      title: 'Price variance exceeds negotiated index band',
      owner: 'Analytics',
      status: 'Acknowledged',
      category: 'Packaging',
      createdAt: '2026-04-21T15:00:00.000Z',
      happened: 'Unit prices for corrugate increased 8.7% above market index movement.',
      driver: 'Spot-buy behavior bypassed benchmark check in two business units.',
      financialImpact: '$124,500 annualized overspend versus target should-cost model.',
      rootCause: 'Pricing controls are not enforced in decentralized spot-buy workflow.',
      relatedEntities: { supplier: 'Boxline Partners', po: 'PO-87593', category: 'Packaging', contract: 'CNT-PK-2024-088', buyer: 'Jordan Kim', item: 'Corrugate sheet CRG-12' },
      evidence: ['32 line items priced above index-adjusted ceiling.', 'Benchmark variance persisted for 11 weeks.', 'Two buyers used emergency PO reason code without exception approval.'],
      recommendedAction: 'Reinstate benchmark guardrails and route spot buys above threshold to sourcing review.',
      priorityLevel: 'P2 - High',
      responsibleRole: 'Strategic Sourcing Analyst',
      nextBestAction: 'Issue a temporary pricing hold and execute supplier correction notice.'
    },
    {
      id: 'al-5', type: 'High', alertType: 'Maverick spend', title: 'Maverick spend spike in facilities services', owner: 'Compliance', status: 'Open', category: 'MRO', createdAt: '2026-04-20T11:40:00.000Z', happened: 'Off-contract purchases reached 19% of category spend this month.', driver: 'Purchase requests are being converted to POs without approved catalog routing.', financialImpact: '$73,000 monthly leakage from missed contracted discounts.', rootCause: 'Approval workflow permits free-text suppliers before catalog validation.', relatedEntities: { supplier: 'Rapid Facility Works', po: 'PO-90341', category: 'MRO', contract: 'CNT-MRO-2025-044', buyer: 'Casey Holt', item: 'HVAC maintenance kit HK-54' }, evidence: ['48 off-contract transactions in 30 days.', 'Average price paid is 14% above contracted rate card.', '31% of requisitions used emergency justification code.'], recommendedAction: 'Lock PO creation to approved catalog suppliers and retrain buyers on exception policy.', priorityLevel: 'P2 - High', responsibleRole: 'Procurement Compliance Lead', nextBestAction: 'Enable real-time maverick spend blocker in requisition workflow.' },
    {
      id: 'al-6', type: 'Medium', alertType: 'PO aging', title: 'PO aging backlog building in IT services queue', owner: 'Shared Services', status: 'Open', category: 'IT Services', createdAt: '2026-04-19T17:25:00.000Z', happened: '23 open POs are aged beyond 45 days without receipt or closure.', driver: 'Approval and goods-receipt confirmations are lagging due to role handoff gaps.', financialImpact: '$410,000 in accrual uncertainty and delayed invoice reconciliation.', rootCause: 'No automated escalation on stale PO milestones.', relatedEntities: { supplier: 'Apex Integrators', po: 'PO-86127', category: 'IT Services', contract: 'CNT-IT-2023-213', buyer: 'Devin Shah', item: 'Implementation sprint SVC-IMP-2' }, evidence: ['Median PO age rose from 28 to 46 days.', '11 invoices blocked for missing receipts.', '3 approvers have >7 pending actions each.'], recommendedAction: 'Create PO aging swimlane and auto-escalate stale lines to functional owners.', priorityLevel: 'P3 - Medium', responsibleRole: 'Procurement Shared Services Supervisor', nextBestAction: 'Run same-day cleanup for POs older than 60 days.' },
    {
      id: 'al-7', type: 'Critical', alertType: 'Contract leakage', title: 'Contract leakage detected in direct materials lane', owner: 'Category Lead', status: 'Open', category: 'Raw Materials', createdAt: '2026-04-18T13:55:00.000Z', happened: 'Spend shifted from negotiated contract SKUs to non-contracted alternates.', driver: 'Planning team substituted part numbers to avoid short-term shortages.', financialImpact: '$252,000 annualized leakage from unprotected pricing and rebate loss.', rootCause: 'Material substitutions are not synchronized with contract entitlement controls.', relatedEntities: { supplier: 'TriState Alloys', po: 'PO-85211', category: 'Raw Materials', contract: 'CNT-RM-2025-032', buyer: 'Parker Lee', item: 'Alloy bar AB-19' }, evidence: ['17% of category spend moved off-contract in 6 weeks.', 'Rebate eligibility dropped from 92% to 69%.', 'Substituted SKUs carry 9% higher average unit cost.'], recommendedAction: 'Freeze unapproved substitutions and renegotiate addendum coverage for alternates.', priorityLevel: 'P1 - Immediate', responsibleRole: 'Category Director', nextBestAction: 'Hold cross-functional exception board within 24 hours.' },
    {
      id: 'al-8', type: 'High', alertType: 'Expiring supplier agreement', title: 'Expiring supplier agreement without renewal path', owner: 'Legal Ops', status: 'Open', category: 'Logistics', createdAt: '2026-04-17T10:05:00.000Z', happened: 'Primary regional freight contract expires in 28 days with no approved renewal strategy.', driver: 'Negotiation package was delayed awaiting volume forecast update.', financialImpact: '$1.1M annual spend at risk of moving to spot rates (+12-18%).', rootCause: 'Renewal governance milestone missed due to cross-team dependency delays.', relatedEntities: { supplier: 'Delta Logistics', po: 'PO-84002', category: 'Logistics', contract: 'CNT-LG-2023-102', buyer: 'Riley Brooks', item: 'Regional LTL freight lane RL-NE' }, evidence: ['No redlined MSA uploaded to legal workspace.', 'Forecast signoff overdue by 19 days.', 'Incumbent supplier offered only 7-day hold on current rates.'], recommendedAction: 'Fast-track renewal approval path and stage contingency award for backup carrier.', priorityLevel: 'P2 - High', responsibleRole: 'Category Manager and Legal Counsel', nextBestAction: 'Issue executive renewal packet and secure negotiation mandate this week.' },
    {
      id: 'al-9', type: 'Medium', alertType: 'Demand spike', title: 'Demand spike detected for service kits', owner: 'Planning', status: 'Open', category: 'MRO', createdAt: '2026-04-16T09:15:00.000Z', happened: 'Demand for maintenance kits surged 34% above rolling 8-week forecast.', driver: 'Two customer program launches pulled forward consumption by one quarter.', financialImpact: '$58,000 potential expedite premium if replenishment is not accelerated.', rootCause: 'Demand-signal ingestion from commercial pipeline is delayed by one planning cycle.', relatedEntities: { supplier: 'Metro Maintenance Supply', po: 'PO-83490', category: 'MRO', contract: 'CNT-MRO-2024-117', buyer: 'Jamie Flores', item: 'Service kit SK-88' }, evidence: ['Forecast bias shifted from +2% to -21%.', 'Safety stock coverage dropped from 19 days to 8 days.', 'Backorder requests increased 2.4x week-over-week.'], recommendedAction: 'Re-baseline forecast, trigger surge-buy protocol, and secure temporary allocation commitment.', priorityLevel: 'P3 - Medium', responsibleRole: 'Demand Planner with Buyer support', nextBestAction: 'Approve demand replan and commit expedited PO release by tomorrow.' },
    {
      id: 'al-10', type: 'Critical', alertType: 'Inventory shortage risk', title: 'Inventory shortage risk on high-run-rate component', owner: 'Inventory Control', status: 'Open', category: 'Electronics', createdAt: '2026-04-15T12:45:00.000Z', happened: 'Projected stockout in 11 days for key microcontroller family.', driver: 'Supplier commit slipped while demand consumption accelerated.', financialImpact: '$2.3M revenue exposure from possible line stoppage.', rootCause: 'Safety-stock policy was based on outdated lead-time assumptions.', relatedEntities: { supplier: 'Orion Micro Devices', po: 'PO-82211', category: 'Electronics', contract: 'CNT-EL-2024-064', buyer: 'Alex Morgan', item: 'Microcontroller MC-410' }, evidence: ['Days of supply decreased from 24 to 9 in 3 weeks.', 'Confirmed supplier commit moved out by 16 days.', 'No alternate approved part in ERP for this BOM position.'], recommendedAction: 'Initiate shortage war room, authorize broker containment buy, and accelerate alternate qualification.', priorityLevel: 'P1 - Immediate', responsibleRole: 'Inventory Manager and Commodity Manager', nextBestAction: 'Execute shortage containment plan in next S&OE cycle.' },
    {
      id: 'al-11', type: 'High', alertType: 'Single-source dependency', title: 'Single-source dependency concentration above policy limit', owner: 'Risk Office', status: 'Acknowledged', category: 'Industrial Gases', createdAt: '2026-04-14T16:30:00.000Z', happened: '91% of spend in specialty gas category is concentrated with one supplier.', driver: 'Alternate supplier onboarding has stalled due to quality validation workload.', financialImpact: '$780,000 disruption risk estimate tied to outage scenario.', rootCause: 'Supplier diversification roadmap was not resourced for qualification throughput.', relatedEntities: { supplier: 'CryoPure Inc.', po: 'PO-81073', category: 'Industrial Gases', contract: 'CNT-IG-2022-198', buyer: 'Taylor Nguyen', item: 'Argon mix AR-5' }, evidence: ['Concentration rose from 82% to 91% in two quarters.', 'Backup supplier audit is 6 weeks overdue.', 'Business continuity score dropped to 62/100.'], recommendedAction: 'Fund alternate qualification sprint and set mandatory dual-source target for Q3.', priorityLevel: 'P2 - High', responsibleRole: 'Category Director with Supplier Quality', nextBestAction: 'Approve qualification budget and launch alternate-source PPAP plan.' },
    {
      id: 'al-12', type: 'Medium', alertType: 'Quote-to-award delay', title: 'Quote-to-award delay extending sourcing cycle time', owner: 'Sourcing PMO', status: 'Open', category: 'IT Services', createdAt: '2026-04-13T08:05:00.000Z', happened: 'Average quote-to-award cycle increased from 19 to 33 days.', driver: 'Evaluation scoring and legal review queues are creating handoff bottlenecks.', financialImpact: '$310,000 in delayed savings realization and project mobilization slippage.', rootCause: 'Sequential workflow design forces legal review after commercial scoring, not in parallel.', relatedEntities: { supplier: 'Vertex Digital Solutions', po: 'PO-79921', category: 'IT Services', contract: 'CNT-IT-2026-005', buyer: 'Dana Ross', item: 'Cloud migration SOW CM-21' }, evidence: ['7 sourcing events exceeded SLA by >10 days.', 'Legal queue has 14 open packets older than 5 days.', 'Stakeholder scorecard completion rate fell to 61%.'], recommendedAction: 'Parallelize legal/commercial reviews and enforce milestone SLAs with escalation rules.', priorityLevel: 'P3 - Medium', responsibleRole: 'Strategic Sourcing PMO Lead', nextBestAction: 'Pilot fast-lane governance on next 3 events starting this week.' }
  ];
}

export function getSentinelAlertDetail(alertId, options = {}) {
  const alert = buildAlertDetails().find((item) => item.id === alertId);
  if (alert) return alert;
  const { intelligence } = buildSentinelOverview(options);
  return intelligence.find((item) => item.id === alertId) || null;
}

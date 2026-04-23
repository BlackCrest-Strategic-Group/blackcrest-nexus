const categories = ['Electronics', 'MRO', 'Logistics', 'Industrial Gases', 'IT Services', 'Packaging', 'Raw Materials'];
const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];

function seededNumber(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const n = x - Math.floor(x);
  return Math.round(min + n * (max - min));
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

export function buildSentinelOverview() {
  const suppliers = buildSentinelDemoSuppliers();
  const opportunities = buildSentinelOpportunities();

  const alerts = [
    { id: 'al-1', type: 'Critical', title: 'Delivery disruption signal', owner: 'Procurement Ops', status: 'Open', category: 'Logistics', createdAt: '2026-04-22T13:22:00.000Z' },
    { id: 'al-2', type: 'High', title: 'Contract expires in 21 days', owner: 'Category Lead', status: 'Open', category: 'Electronics', createdAt: '2026-04-21T11:02:00.000Z' },
    { id: 'al-3', type: 'Medium', title: 'Supplier responsiveness decline', owner: 'Supplier Manager', status: 'Acknowledged', category: 'IT Services', createdAt: '2026-04-20T10:31:00.000Z' },
    { id: 'al-4', type: 'Informational', title: 'Pricing anomaly normalized', owner: 'Analytics', status: 'Resolved', category: 'Raw Materials', createdAt: '2026-04-19T09:15:00.000Z' }
  ];

  return {
    kpis: {
      procurementHealthScore: 84,
      activeAlerts: alerts.filter((a) => a.status !== 'Resolved').length,
      highRiskSuppliers: suppliers.filter((s) => s.riskLevel === 'High').length,
      trackedOpportunities: opportunities.length,
      sourcingVelocityIndex: 91,
      projectedSavingsUSD: 3460000
    },
    alerts,
    signals: [
      { id: 'sg-1', label: 'RFQ cycle slowdown', trend: 'up', severity: 'High', delta: '+11%' },
      { id: 'sg-2', label: 'Quote variance', trend: 'up', severity: 'Medium', delta: '+4.3%' },
      { id: 'sg-3', label: 'Supplier response latency', trend: 'up', severity: 'Medium', delta: '+2.1 days' },
      { id: 'sg-4', label: 'Category volatility', trend: 'down', severity: 'Low', delta: '-1.8%' }
    ],
    riskHeatmap: categories.map((category, idx) => ({
      category,
      riskScore: seededNumber(idx * 41 + 5, 38, 94),
      supplierConcentration: seededNumber(idx * 43 + 4, 23, 79),
      disruptionLikelihood: seededNumber(idx * 47 + 9, 14, 72)
    })),
    recommendations: [
      'Launch secondary-source qualification for Electronics in APAC by May 15, 2026.',
      'Escalate 3 expiring contracts into negotiation lane to preserve $1.2M annual savings.',
      'Shift two high-risk opportunities to dual-supplier strategy to reduce delivery risk exposure.'
    ],
    suppliers,
    opportunities
  };
}

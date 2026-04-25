export const CLEAN_ROOM_DISCLAIMER = 'Supplier recommendations are generated from public, uploaded, or synthetic demo data unless the customer connects approved internal systems.';

export function getInvestorDemoData() {
  const suppliers = [
    {
      id: 'sup-aurora',
      supplierName: 'Aurora Industrial Supply',
      category: 'MRO',
      capabilities: ['Industrial fasteners', 'Safety stock programs'],
      region: 'US-Southeast',
      socioEconomicFlags: { smallBusiness: true, veteranOwned: false, womanOwned: true, minorityOwned: false },
      naics: ['423840'],
      website: 'https://example.com/aurora-industrial',
      riskScore: 41,
      leadTimeProfile: 'stable_10_to_14_days',
      qualityProfile: 'ppm_320',
      pricingProfile: 'market_minus_2pct'
    },
    {
      id: 'sup-vector',
      supplierName: 'Vector Metalworks',
      category: 'Machined Components',
      capabilities: ['CNC machining', 'Custom castings'],
      region: 'US-Midwest',
      socioEconomicFlags: { smallBusiness: false, veteranOwned: true, womanOwned: false, minorityOwned: false },
      naics: ['332710'],
      website: 'https://example.com/vector-metalworks',
      riskScore: 57,
      leadTimeProfile: 'volatile_18_to_28_days',
      qualityProfile: 'ppm_540',
      pricingProfile: 'market_plus_5pct'
    },
    {
      id: 'sup-nimbus',
      supplierName: 'Nimbus Tech Distribution',
      category: 'Electronics',
      capabilities: ['Networking gear', 'IT peripherals'],
      region: 'US-West',
      socioEconomicFlags: { smallBusiness: true, veteranOwned: false, womanOwned: false, minorityOwned: true },
      naics: ['423690'],
      website: 'https://example.com/nimbus-tech',
      riskScore: 29,
      leadTimeProfile: 'stable_7_to_11_days',
      qualityProfile: 'ppm_210',
      pricingProfile: 'market_minus_1pct'
    }
  ];

  const poLines = [
    { id: 'line-1', itemId: 'item-bolt-1001', itemDescription: 'Hex Bolt 3/8', supplierId: 'sup-vector', categoryId: 'cat-mro', quantity: 2500, unitPrice: 4.1, extendedValue: 10250, orderDate: '2026-02-11', buyer: 'J. Miles', uom: 'EA' },
    { id: 'line-2', itemId: 'item-bolt-1001', itemDescription: 'Hex Bolt 3/8', supplierId: 'sup-aurora', categoryId: 'cat-mro', quantity: 2600, unitPrice: 3.2, extendedValue: 8320, orderDate: '2026-03-05', buyer: 'J. Miles', uom: 'EA' },
    { id: 'line-3', itemId: 'item-router-556', itemDescription: 'Industrial Router', supplierId: 'sup-nimbus', categoryId: 'cat-it', quantity: 60, unitPrice: 980, extendedValue: 58800, orderDate: '2026-03-20', buyer: 'K. Rivera', uom: 'EA' },
    { id: 'line-4', itemId: 'item-router-556', itemDescription: 'Industrial Router', supplierId: 'sup-vector', categoryId: 'cat-it', quantity: 40, unitPrice: 1225, extendedValue: 49000, orderDate: '2026-04-01', buyer: 'K. Rivera', uom: 'EA', expediteFlag: true },
    { id: 'line-5', itemId: 'item-sensor-212', itemDescription: 'Pressure Sensor', supplierId: 'sup-vector', categoryId: 'cat-electro', quantity: 450, unitPrice: 214, extendedValue: 96300, orderDate: '2026-01-19', buyer: 'M. Cho', uom: 'EA', sellPrice: 209 }
  ];

  const categories = [
    { id: 'cat-mro', categoryName: 'MRO', totalSpend: 185200, supplierCount: 2 },
    { id: 'cat-it', categoryName: 'IT Infrastructure', totalSpend: 241400, supplierCount: 2 },
    { id: 'cat-electro', categoryName: 'Electromechanical', totalSpend: 162300, supplierCount: 1 }
  ];

  return {
    asOf: new Date().toISOString(),
    narrative: 'BlackCrest identifies $428K in potential leakage, detects supplier concentration risk, recommends alternate suppliers, turns spreadsheet chaos into blanket PO structure, and converts RFPs into executive-ready decisions.',
    kpis: {
      totalSpendUnderReview: 588900,
      estimatedMarginLeakage: 428000,
      supplierRiskExposure: 31,
      openOpportunityValue: 2100000,
      bidNoBidSummary: { bid: 4, noBid: 2, conditional: 3 }
    },
    suppliers,
    categories,
    poLines,
    sampleRfp: {
      id: 'rfp-demo-001',
      title: 'Municipal Smart Corridor Modernization RFP',
      dueDate: '2026-05-22',
      clausesDetected: ['FAR 52.212-1', 'DFARS 252.204-7012'],
      estimatedEffortHours: 180
    },
    erpConnectors: [
      { provider: 'SAP', mode: 'csv_now_api_later', status: 'csv_ready', readOnly: true, scopesRequested: ['purchase_orders:read', 'suppliers:read'], lastSyncTimestamp: null, sampleMapping: { vendor: 'LIFNR', partNumber: 'MATNR' }, securityNotes: 'Token-based credentials configured by customer IT in production.' },
      { provider: 'Oracle', mode: 'csv_now_api_later', status: 'not_configured', readOnly: true, scopesRequested: ['suppliers:read'], lastSyncTimestamp: null, sampleMapping: { supplierName: 'SUPPLIER_NAME', total: 'AMOUNT' }, securityNotes: 'CSV bridge available for controlled transfer.' }
    ],
    disclaimer: CLEAN_ROOM_DISCLAIMER
  };
}

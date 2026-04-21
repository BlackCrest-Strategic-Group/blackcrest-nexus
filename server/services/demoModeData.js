export function getDemoModePayload() {
  return {
    label: 'Demonstration Environment – Uses synthetic and public data only',
    publicRfps: [
      {
        id: 'demo-rfp-it-helpdesk',
        source: 'Public sample',
        title: 'Municipal IT Helpdesk Services RFP',
        description: 'Synthetic summary derived from public procurement templates.',
      },
      {
        id: 'demo-rfp-facilities',
        source: 'Public sample',
        title: 'County Facilities Maintenance Support RFP',
        description: 'Synthetic summary derived from public procurement templates.',
      }
    ],
    syntheticSuppliers: [
      { name: 'Summit Ridge Services', category: 'Facilities', region: 'US-Midwest', status: 'Illustrative supplier option' },
      { name: 'Blue Harbor Tech', category: 'IT Services', region: 'US-Northeast', status: 'Illustrative supplier option' }
    ],
    genericCostAssumptions: [
      'Labor escalation range: 2% to 5% annually based on market benchmarks.',
      'Logistics volatility range: +/- 4% based on publicly reported trends.',
      'Contingency reserve: 5% to 12% depending on scope clarity.'
    ]
  };
}

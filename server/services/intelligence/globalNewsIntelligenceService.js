export function getGlobalSupplyChainSignals() {
  return [
    {
      id: 'asia-port-congestion',
      severity: 'High',
      region: 'Asia-Pacific',
      category: 'logistics',
      title: 'Port congestion risk elevated across Asia-Pacific shipping lanes',
      impact: 'Electronics and industrial lead times may extend 7-14 days.',
      recommendedAction: 'Review supplier buffers and secondary sourcing options.'
    },
    {
      id: 'europe-energy-pressure',
      severity: 'Medium',
      region: 'Europe',
      category: 'energy',
      title: 'Industrial energy pricing volatility detected',
      impact: 'Manufacturing margin pressure may increase for European suppliers.',
      recommendedAction: 'Validate pricing escalation clauses and supplier resilience.'
    },
    {
      id: 'gulf-weather-watch',
      severity: 'High',
      region: 'North America',
      category: 'weather',
      title: 'Severe Gulf weather system under monitoring',
      impact: 'Potential freight and port delays affecting Gulf Coast operations.',
      recommendedAction: 'Monitor carrier updates and prioritize critical inbound material.'
    }
  ];
}

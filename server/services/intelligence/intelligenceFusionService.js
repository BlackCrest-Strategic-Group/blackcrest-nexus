import { getCountryRiskOverview } from './countryRiskService.js';
import { getGlobalSupplyChainSignals } from './globalNewsIntelligenceService.js';

export function buildGlobalIntelligenceOverview() {
  const countryRisks = getCountryRiskOverview();
  const globalSignals = getGlobalSupplyChainSignals();

  const executiveAlerts = [
    {
      title: 'Taiwan Semiconductor Exposure',
      severity: 'Critical',
      drivers: [
        'Regional geopolitical instability',
        'Supplier concentration exposure',
        'Electronics supply dependency'
      ],
      recommendedAction: 'Develop alternate sourcing and inventory continuity planning.'
    },
    {
      title: 'Asia-Pacific Freight Volatility',
      severity: 'High',
      drivers: [
        'Port congestion',
        'Freight capacity pressure',
        'Weather disruption risk'
      ],
      recommendedAction: 'Validate logistics contingency plans and critical supplier readiness.'
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    platformMode: 'global-intelligence',
    countryRisks,
    globalSignals,
    executiveAlerts,
    executiveSummary: `Global intelligence engine identified ${executiveAlerts.length} executive-level supply chain risks across geopolitical, logistics, and supplier exposure categories.`
  };
}

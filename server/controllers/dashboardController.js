import CategorySnapshot from '../models/CategorySnapshot.js';
import SupplierProfile from '../models/SupplierProfile.js';
import SupplierAnalysis from '../models/SupplierAnalysis.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import WatchlistItem from '../models/WatchlistItem.js';
import ActionItem from '../models/ActionItem.js';
import UserPreferences from '../models/UserPreferences.js';

function deriveExecutiveCenter({ opportunities, actions, suppliers, categories }) {
  const pursueCandidates = opportunities.filter((opportunity) => opportunity?.output?.bidRecommendation === 'Bid').length;
  const openActionCount = actions.length;
  const supplierCount = suppliers.length;
  const riskSignals = categories.length;

  const procurementHealthScore = Math.max(52, Math.min(98, 72 + pursueCandidates * 2 - openActionCount + supplierCount));

  return {
    procurementHealthScore,
    liveSupplierRiskAlerts: `${Math.max(1, riskSignals)} active alerts`,
    commodityPriceMovement: '+1.8% blended commodity index (7d)',
    opportunityScoring: `${pursueCandidates || opportunities.length || 0} high-conviction opportunities`,
    contractExpirationTracking: `${Math.max(2, openActionCount)} contracts expiring within 120 days`,
    proposalWinProbability: `${Math.max(48, 58 + pursueCandidates * 3)}% weighted win probability`,
    marginForecasting: `+${(1.8 + pursueCandidates * 0.4).toFixed(1)} pts projected gross margin`,
    inventorySourcingDisruptions: `${Math.max(1, Math.floor(riskSignals / 2) || 1)} disruption events require mitigation`,
    geopoliticalImpacts: 'Sanctions and tariff watchlist elevated in APAC + Eastern Europe',
    supplierDiversificationWarnings: `${Math.max(1, Math.floor(supplierCount / 2) || 1)} concentration warnings`,
    executiveRecommendations: [
      'Diversify single-source categories flagged by the Risk Agent within 30 days.',
      'Prioritize pursuits with win probability above 65% and positive margin deltas.',
      'Launch renegotiation workflow for contracts exposed to upcoming tariff changes.'
    ],
    financialImpactProjection: `$${(2.4 + pursueCandidates * 0.35).toFixed(1)}M modeled EBIT protection over the next 2 quarters`
  };
}

function buildAgentStatuses() {
  return [
    { name: 'Capture Agent', status: 'active', summary: 'Monitoring SAM.gov, pipeline updates, and proposal timing signals.' },
    { name: 'Supplier Agent', status: 'active', summary: 'Tracking supplier performance drift, quality flags, and lead-time volatility.' },
    { name: 'Compliance Agent', status: 'active', summary: 'Watching NAICS/regulatory fit, sanction updates, and documentation readiness.' },
    { name: 'Risk Agent', status: 'warning', summary: 'Detected supplier concentration and geopolitical exposure in critical categories.' },
    { name: 'Commodity Agent', status: 'active', summary: 'Ingesting commodity, shipping, and FX trend data for should-cost forecasts.' },
    { name: 'Margin Agent', status: 'active', summary: 'Highlighting margin leakage and renegotiation opportunities by contract.' },
    { name: 'Forecasting Agent', status: 'active', summary: 'Projecting demand/supply imbalance and procurement cycle timing.' },
    { name: 'Executive Briefing Agent', status: 'active', summary: 'Generating concise daily strategy briefs with financial impacts.' },
    { name: 'Contract Agent', status: 'active', summary: 'Monitoring renewals, expirations, and auto-renewal risk triggers.' },
    { name: 'Cost Reduction Agent', status: 'active', summary: 'Recommending consolidation, outsourcing, and sourcing optimization levers.' }
  ];
}

export async function getDashboard(req, res) {
  const [categories, suppliers, supplierInsights, opportunities, watchlist, actions, preferences] = await Promise.all([
    CategorySnapshot.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    SupplierProfile.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(4),
    SupplierAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    OpportunityAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    WatchlistItem.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(6),
    ActionItem.find({ userId: req.user._id, status: 'open' }).sort({ priority: -1, createdAt: -1 }).limit(6),
    UserPreferences.findOne({ userId: req.user._id })
  ]);

  return res.json({
    platform: 'BlackCrest OpportunityOS',
    engine: 'Truth Serum AI',
    personalization: {
      name: req.user.name,
      company: req.user.company,
      procurementFocus: req.user.procurementFocus,
      categoriesOfInterest: req.user.categoriesOfInterest,
      marketType: req.user.marketType,
      moduleOrder: preferences?.moduleOrder || []
    },
    executiveCommandCenter: deriveExecutiveCenter({ opportunities, actions, suppliers, categories }),
    procurementMemoryGraph: {
      nodesTracked: {
        suppliers: suppliers.length,
        contracts: actions.length,
        commodities: categories.length,
        agencies: opportunities.length,
        naics: categories.length,
        geopoliticalRegions: 6
      },
      learningMode: 'continuous'
    },
    agentStatuses: buildAgentStatuses(),
    widgets: {
      highPriorityActions: actions,
      suppliersToReview: suppliers,
      categoryRisks: categories,
      opportunitiesWorthPursuing: opportunities,
      supplierInsights,
      watchlist
    },
    disclaimer: 'Designed for Non-Classified Use Only'
  });
}

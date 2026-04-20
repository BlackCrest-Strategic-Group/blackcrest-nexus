function confidence() {
  return Math.floor(72 + Math.random() * 26);
}

export function buildCategoryOutput({ categoryName, product, geography }) {
  return {
    summary: `${categoryName} for ${product} shows moderate competition and tightening lead times${geography ? ` in ${geography}` : ''}.`,
    signals: [
      'Supplier lead-time volatility is rising in the past 2 quarters.',
      'Price pressure is flattening after prior inflationary spikes.',
      'Demand forecasts indicate stable-to-growing public sector buying.'
    ],
    risks: ['Single-source concentration in tier-2 suppliers.', 'Contracting delays due to compliance bottlenecks.', 'Budget cycle timing mismatch with award cadence.'],
    demandSupplyTrend: 'Demand is outpacing supply in specialized SKUs; broaden qualified supplier pool.',
    procurementStance: 'Dual-track sourcing with pre-qualified alternates and indexed pricing clauses.',
    supplierOutreachStrategy: 'Prioritize incumbent + 2 challenger suppliers with capability validation calls.',
    recommendations: ['Run early market sounding', 'Issue supplier capability survey', 'Create contingency sourcing matrix'],
    confidenceScore: confidence(),
    timestamp: new Date().toISOString()
  };
}

export function buildSupplierOutput({ supplier }) {
  return {
    summary: `${supplier.name} is a ${supplier.category} supplier with ${supplier.relationshipScore}/100 relationship depth.`,
    fitScore: Math.max(45, Math.min(95, supplier.relationshipScore + 10)),
    strengths: ['Relevant capabilities mapped to category needs', 'Operational responsiveness observed in prior cycles', 'Tagged strategic fit for diversification'],
    risks: supplier.risks?.length ? supplier.risks : ['Limited redundant capacity', 'Compliance package refresh needed'],
    diversificationValue: 'Medium-high; expands geographic and operational coverage.',
    recommendations: ['Schedule capability review', 'Validate quality/compliance documents', 'Pilot a scoped sourcing package'],
    nextAction: 'Book supplier review meeting within 7 days.',
    confidenceScore: confidence(),
    timestamp: new Date().toISOString()
  };
}

export function buildOpportunityOutput({ title }) {
  return {
    summary: `${title} appears viable with moderate compliance and delivery complexity.`,
    requirements: ['Scope clarity and statement of work alignment', 'Past performance evidence', 'Pricing model with risk-adjusted assumptions'],
    complianceFlags: ['Validate FAR/DFARS clause matrix', 'Confirm cybersecurity/controls attestations'],
    risks: ['Aggressive timeline may impact proposal quality', 'Under-scoped staffing assumptions', 'Potential subcontractor dependency'],
    effortEstimate: '3-5 weeks cross-functional effort',
    bidRecommendation: 'Bid with conditions',
    implications: ['Category demand likely increases in next quarter', 'Top 2 suppliers need early alignment'],
    nextSteps: ['Launch bid/no-bid review', 'Assign compliance owner', 'Issue supplier RFIs'],
    recommendations: ['Build red-team review cycle', 'Reserve surge staffing capacity', 'Set executive go/no-go checkpoint'],
    confidenceScore: confidence(),
    timestamp: new Date().toISOString()
  };
}

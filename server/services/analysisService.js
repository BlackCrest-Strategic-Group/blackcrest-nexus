function confidence() {
  return Math.floor(72 + Math.random() * 26);
}

export function buildCategoryOutput({ categoryName, product, geography }) {
  return {
    summary: `Suggested sourcing approach based on industry-standard practices for ${categoryName} and ${product}${geography ? ` in ${geography}` : ''}.`,
    signals: [
      'Public market indicators suggest moderate supplier lead-time variability.',
      'Published commodity and labor trends indicate mixed pricing pressure.',
      'Open procurement notices show steady public-sector demand in this category.'
    ],
    risks: ['Potential supplier concentration risk in specialized sub-tiers.', 'Procurement timeline delays from documentation gaps.', 'Budget-cycle timing may not align with award windows.'],
    demandSupplyTrend: 'Estimated ranges based on user inputs or general market patterns suggest balanced-to-tight supply.',
    procurementStance: 'Suggested sourcing approach based on industry-standard practices: phased competition with alternates.',
    supplierOutreachStrategy: 'Illustrative supplier options should include incumbents and challengers validated through public records.',
    recommendations: ['Run public market sounding', 'Issue capability questionnaires', 'Prepare contingency sourcing matrix'],
    confidenceScore: confidence(),
    advisoryNote: 'Advisory output only; validate with contracting and legal teams before execution.',
    timestamp: new Date().toISOString()
  };
}

export function buildSupplierOutput({ supplier }) {
  return {
    summary: `Illustrative supplier option: ${supplier.name} in ${supplier.category}.`,
    fitScore: Math.max(45, Math.min(95, supplier.relationshipScore + 10)),
    strengths: ['Capabilities appear aligned to user-provided requirements.', 'Regional coverage may support supply continuity.', 'Option may improve supplier portfolio diversification.'],
    risks: supplier.risks?.length ? supplier.risks : ['Capacity constraints may emerge during peak demand.', 'Compliance artifacts may need periodic refresh.'],
    diversificationValue: 'Estimated from user inputs and public market patterns.',
    recommendations: ['Conduct capability validation', 'Request compliance documents', 'Pilot a limited-scope sourcing package'],
    nextAction: 'Advisory next step: schedule a supplier qualification review.',
    confidenceScore: confidence(),
    advisoryNote: 'This is a neutral recommendation, not an internal performance determination.',
    timestamp: new Date().toISOString()
  };
}

export function buildOpportunityOutput({ title }) {
  return {
    summary: `${title} appears addressable based on provided materials and public procurement practices.`,
    requirements: ['Scope and statement-of-work alignment', 'Publicly acceptable qualification evidence', 'Estimated ranges based on user inputs or general market patterns'],
    complianceFlags: ['Validate clause matrix against solicitation text', 'Confirm required security/control attestations'],
    risks: ['Compressed timeline could reduce proposal quality.', 'Ambiguous staffing assumptions could affect delivery.', 'Subcontractor dependency may introduce schedule variance.'],
    effortEstimate: 'Illustrative estimate: 3–5 weeks cross-functional effort',
    bidRecommendation: 'Advisory recommendation: pursue with defined conditions',
    implications: ['Industry demand may rise in coming cycles.', 'Early supplier alignment is advisable.'],
    nextSteps: ['Run bid/no-bid review', 'Assign compliance owner', 'Issue targeted RFIs'],
    recommendations: ['Establish red-team review cadence', 'Plan surge staffing contingencies', 'Set governance checkpoints'],
    confidenceScore: confidence(),
    advisoryNote: 'Output is informational and non-authoritative.',
    timestamp: new Date().toISOString()
  };
}

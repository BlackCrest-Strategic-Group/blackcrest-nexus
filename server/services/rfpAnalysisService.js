export function analyzeRfpText({ title = 'Untitled RFP', content = '' } = {}) {
  const normalized = content.toLowerCase();
  const hasFAR = normalized.includes('far');
  const hasDFARS = normalized.includes('dfars');

  return {
    title,
    executiveSummary: 'RFP indicates moderate complexity with compliance-sensitive requirements and cross-functional sourcing impact.',
    bidNoBidScore: 74,
    complianceChecklist: [
      { item: 'Representations and certifications', status: 'required' },
      { item: 'Cybersecurity narrative', status: hasDFARS ? 'required' : 'recommended' },
      { item: 'Past performance references', status: 'required' }
    ],
    farDfarsClauseSummary: [hasFAR ? 'FAR references detected.' : 'No explicit FAR clauses detected.', hasDFARS ? 'DFARS references detected.' : 'No explicit DFARS clauses detected.'],
    requiredDocuments: ['Technical volume', 'Pricing volume', 'Compliance matrix'],
    dueDates: ['Question period closes in 7 days', 'Proposal due in 21 days'],
    riskFlags: ['Compressed timeline', 'Multi-site service scope'],
    supplierCategoryImpacts: ['IT Services', 'Field Operations'],
    estimatedEffort: '160-220 hours',
    recommendedPursuitAction: 'Pursue with conditional go-ahead after compliance review.',
    reportTypes: ['Executive one-page summary', 'Procurement action report', 'Compliance checklist', 'Supplier sourcing plan', 'Buyer task list', 'Investor demo sample report']
  };
}

import express from 'express';

const router = express.Router();

const fundingPartners = [
  {
    id: 'cdfi-community-capital',
    name: 'Community Capital / CDFI Partner',
    type: 'CDFI / mission lender',
    bestFor: ['Working capital', 'Underserved small businesses', 'Local growth capital'],
    typicalRange: '$25K - $500K',
    notes: 'Good fit when the business has a real opportunity but needs patient capital and documentation support.'
  },
  {
    id: 'po-contract-finance',
    name: 'Purchase Order / Contract Finance Partner',
    type: 'PO financing',
    bestFor: ['Inventory', 'Materials', 'Supplier deposits', 'Large customer orders'],
    typicalRange: '$50K - $2M+',
    notes: 'Useful when the business has a purchase order or contract but lacks cash to fulfill it.'
  },
  {
    id: 'invoice-factoring',
    name: 'Invoice Factoring Partner',
    type: 'Receivables financing',
    bestFor: ['Cashflow gaps', 'Slow customer payment', 'Payroll float'],
    typicalRange: '$10K - $1M+',
    notes: 'Useful after invoices are issued and the business needs cash before customer payment arrives.'
  },
  {
    id: 'equipment-finance',
    name: 'Equipment Finance Partner',
    type: 'Equipment financing',
    bestFor: ['Machines', 'Vehicles', 'Tools', 'Production equipment'],
    typicalRange: '$25K - $5M+',
    notes: 'Useful when equipment is the bottleneck preventing execution or expansion.'
  },
  {
    id: 'sba-lending',
    name: 'SBA / Bank Lending Partner',
    type: 'Bank / SBA lender',
    bestFor: ['Expansion capital', 'Term loans', 'Lines of credit'],
    typicalRange: '$50K - $5M+',
    notes: 'Best for businesses with stronger documentation, operating history, and repayment visibility.'
  },
  {
    id: 'grant-support',
    name: 'Grant & Economic Development Partner',
    type: 'Grant support',
    bestFor: ['Workforce development', 'Innovation', 'Local expansion', 'Certifications'],
    typicalRange: 'Varies',
    notes: 'Useful when the business may qualify for public, nonprofit, or economic development programs.'
  }
];

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreFundingReadiness(profile = {}) {
  let score = 0;
  const revenue = numeric(profile.annualRevenue);
  const years = numeric(profile.yearsInBusiness);
  const contractValue = numeric(profile.opportunityValue);
  const requestedAmount = numeric(profile.requestedAmount);
  const documents = Array.isArray(profile.documents) ? profile.documents : [];

  if (years >= 2) score += 15;
  else if (years >= 1) score += 8;

  if (revenue >= 1000000) score += 20;
  else if (revenue >= 250000) score += 14;
  else if (revenue >= 50000) score += 8;

  if (contractValue > 0) score += 15;
  if (requestedAmount > 0 && contractValue > 0 && requestedAmount <= contractValue * 0.5) score += 12;
  else if (requestedAmount > 0) score += 6;

  if (profile.useOfFunds && String(profile.useOfFunds).trim().length > 20) score += 12;
  if (profile.timeline) score += 8;
  if (profile.certifications) score += 5;
  if (profile.pastPerformance) score += 8;

  score += Math.min(20, documents.length * 4);

  const normalizedScore = Math.min(100, score);
  const band = normalizedScore >= 75 ? 'Strong' : normalizedScore >= 45 ? 'Moderate' : 'Needs Work';

  return {
    score: normalizedScore,
    band,
    summary: band === 'Strong'
      ? 'This business appears ready for a structured funding conversation.'
      : band === 'Moderate'
        ? 'This business has a workable story but should tighten documentation before partner submission.'
        : 'This business needs a stronger package before approaching serious funding partners.',
    recommendedDocuments: [
      'Business overview',
      'Opportunity or contract summary',
      'Use-of-funds statement',
      'Recent bank statements',
      'Financial statements or tax returns',
      'Customer purchase order, award notice, or pipeline proof',
      'Past performance or customer references'
    ]
  };
}

function recommendFundingCategories(profile = {}) {
  const need = String(profile.fundingNeedType || '').toLowerCase();
  const useOfFunds = String(profile.useOfFunds || '').toLowerCase();
  const text = `${need} ${useOfFunds}`;
  const recommendations = [];

  if (text.includes('inventory') || text.includes('materials') || text.includes('purchase order') || text.includes('po')) {
    recommendations.push('Purchase order financing');
  }
  if (text.includes('invoice') || text.includes('receivable') || text.includes('cashflow') || text.includes('payroll')) {
    recommendations.push('Invoice factoring / receivables financing');
  }
  if (text.includes('equipment') || text.includes('machine') || text.includes('vehicle') || text.includes('tool')) {
    recommendations.push('Equipment financing');
  }
  if (text.includes('grant') || text.includes('workforce') || text.includes('training') || text.includes('innovation')) {
    recommendations.push('Grant and economic development support');
  }
  if (recommendations.length === 0) {
    recommendations.push('Working capital', 'SBA / bank lending', 'CDFI / community capital');
  }

  return [...new Set(recommendations)];
}

function buildFundingPackage(profile = {}) {
  const readiness = scoreFundingReadiness(profile);
  const categories = recommendFundingCategories(profile);

  return {
    title: 'BlackCrest Funding Readiness Package',
    generatedAt: new Date().toISOString(),
    company: {
      name: profile.businessName || 'Unnamed business',
      industry: profile.industry || 'Not provided',
      location: profile.location || 'Not provided',
      yearsInBusiness: profile.yearsInBusiness || 'Not provided',
      certifications: profile.certifications || 'Not provided'
    },
    opportunity: {
      name: profile.opportunityName || 'Not provided',
      value: numeric(profile.opportunityValue),
      timeline: profile.timeline || 'Not provided'
    },
    fundingRequest: {
      amount: numeric(profile.requestedAmount),
      needType: profile.fundingNeedType || 'Not provided',
      useOfFunds: profile.useOfFunds || 'Not provided',
      recommendedCategories: categories
    },
    readiness,
    complianceNote: 'BlackCrest provides funding-readiness workflow support and marketplace introductions. BlackCrest is not a lender and does not guarantee approval, rates, or terms.'
  };
}

router.get('/partners', (_req, res) => {
  res.json({ partners: fundingPartners });
});

router.post('/readiness-score', (req, res) => {
  res.json({ readiness: scoreFundingReadiness(req.body), recommendedCategories: recommendFundingCategories(req.body) });
});

router.post('/package', (req, res) => {
  res.json({ fundingPackage: buildFundingPackage(req.body) });
});

router.post('/introduction-request', (req, res) => {
  const fundingPackage = buildFundingPackage(req.body);
  res.status(201).json({
    status: 'received',
    message: 'Funding introduction request received. This MVP stores the package response for admin review and future partner routing.',
    fundingPackage
  });
});

export default router;

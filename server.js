import path from 'path';
import express from 'express';

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

const workflowState = {
  upload: null,
  analysis: null,
  sourcing: null,
  optimization: null,
  proposal: null
};

const rand = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const buildAnalysis = () => {
  const margin = rand(12, 28);
  const material = rand(50, 70);
  const labor = rand(15, 25);
  const overhead = Number((100 - material - labor).toFixed(2));

  let risk = 'Low';
  let recommendation = 'Proceed';
  if (margin < 14) {
    risk = 'High';
    recommendation = 'Review';
  } else if (margin <= 20) {
    risk = 'Medium';
    recommendation = 'Proceed with caution';
  }

  return {
    margin,
    costBreakdown: { material, labor, overhead },
    risk,
    recommendation
  };
};

app.post('/api/upload', (req, res) => {
  const manualInput = req.body?.opportunityData || null;
  const fileInfo = req.body?.fileInfo || null;

  workflowState.upload = {
    uploadedAt: new Date().toISOString(),
    fileInfo,
    manualInput
  };

  res.json({
    message: 'Opportunity captured and ready for analysis.',
    source: fileInfo ? 'file' : 'manual',
    fileInfo,
    manualInput
  });
});

app.post('/api/analyze', (req, res) => {
  const analysis = buildAnalysis();
  workflowState.analysis = analysis;
  res.json(analysis);
});

app.post('/api/source', (req, res) => {
  const suppliers = [
    { name: 'Vector Industrial Supply', leadTime: '12 days', risk: 'Low' },
    { name: 'Apex Federal Components', leadTime: '18 days', risk: 'Medium' },
    { name: 'BlueHarbor Manufacturing', leadTime: '9 days', risk: 'Medium' },
    { name: 'Northline Precision Works', leadTime: '14 days', risk: 'Low' }
  ];

  const notes = 'Primary execution path uses Vector + Northline. Keep Apex as contingency for surge demand.';
  workflowState.sourcing = { suppliers, notes };
  res.json(workflowState.sourcing);
});

app.post('/api/optimize', (req, res) => {
  const savings = rand(5, 15);
  const strategies = [
    'Shift 30% of volume to alternate supplier for better unit economics.',
    'Bundle quarterly buys to secure bulk discounts on high-volume SKUs.',
    'Move non-critical delivery windows by 10 days to reduce premium freight.'
  ];

  workflowState.optimization = {
    savingsOpportunity: `${savings}% potential savings`,
    strategy: strategies[Math.floor(Math.random() * strategies.length)]
  };
  res.json(workflowState.optimization);
});

app.post('/api/proposal', (req, res) => {
  const proposalText = `Executive Summary\nBlackCrest Nexus recommends proceeding with a controlled sourcing plan balancing margin performance and supplier reliability.\n\nScope of Work\nDeliver procurement execution for the submitted opportunity, including sourcing, category controls, and risk governance.\n\nPricing Breakdown\nMaterial, labor, and overhead allocations align to current analysis bands with optimization upside identified.\n\nDelivery Timeline\nInitial supplier awards in 3 business days, mobilization in week 1, and steady-state delivery by week 3.\n\nTerms\nNet-30 payment terms, performance checkpoints every two weeks, and substitution rights for supplier disruptions.`;

  workflowState.proposal = { proposalText };
  res.json(workflowState.proposal);
});

app.get('/api/ceo-summary', (req, res) => {
  const analysis = workflowState.analysis || buildAnalysis();
  const totalValue = Math.round(rand(250000, 1800000));
  const risks = [
    `${analysis.risk} margin sensitivity under current pricing assumptions.`,
    'Secondary supplier capacity must be confirmed before award finalization.'
  ];

  res.json({
    totalValue,
    marginSummary: `Estimated margin is ${analysis.margin}%, with ${analysis.risk.toLowerCase()}-to-moderate exposure based on current cost mix.`,
    risks,
    recommendation: analysis.risk === 'High' ? 'Escalate for pricing review before commitment.' : 'Approve phased execution with sourcing safeguards.',
    nextAction: 'Authorize RFQ package release and initiate supplier confirmation call within 24 hours.'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

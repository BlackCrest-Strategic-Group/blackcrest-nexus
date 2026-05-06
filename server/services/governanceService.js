const WORKFLOW_STATES = [
  'Pending Review',
  'Approved',
  'Rejected',
  'Escalated',
  'Overridden',
  'Requires Secondary Review'
];

export function scoreConfidence({ completeness = 0, modelAgreement = 0, policyMatch = 0 }) {
  const weighted = (completeness * 0.4) + (modelAgreement * 0.35) + (policyMatch * 0.25);
  if (weighted >= 0.82) return { band: 'High Confidence', score: weighted };
  if (weighted >= 0.62) return { band: 'Moderate Confidence', score: weighted };
  if (weighted >= 0.35) return { band: 'Low Confidence', score: weighted };
  return { band: 'Insufficient Data', score: weighted };
}

export function buildExplainability({ recommendation, supplier, metrics, compliance }) {
  return {
    recommendation,
    why: [
      `${supplier.name} shows ${metrics.onTimeDelivery}% on-time delivery performance.`,
      `NAICS alignment coverage is ${metrics.naicsAlignment} across target categories.`,
      `Historical contract success ratio is ${metrics.contractSuccess}.`,
      `Cost variance of ${metrics.costVariance}% is below internal threshold.`
    ],
    contributingDataPoints: {
      supplierRiskScore: supplier.riskScore,
      farDfarsAlignment: compliance.farDfars,
      spendTrend: metrics.spendTrend,
      qualityIndex: metrics.qualityIndex
    },
    procurementMetrics: metrics,
    complianceIndicators: compliance,
    historicalTrendAnalysis: `${supplier.name} has improved delivery performance by ${metrics.deliveryTrendDelta}% over the prior two quarters.`
  };
}

export function deriveEscalation({ confidenceBand, complianceMismatch, supplierRiskScore, projectedSpendUsd }) {
  if (confidenceBand === 'Low Confidence' || confidenceBand === 'Insufficient Data') {
    return { route: 'Sourcing Manager', reason: 'Low confidence recommendation requires manual validation.' };
  }
  if (complianceMismatch) {
    return { route: 'Compliance Officer', reason: 'Compliance mismatch detected against FAR/DFARS controls.' };
  }
  if (supplierRiskScore >= 80) {
    return { route: 'Procurement Director', reason: 'Supplier risk threshold exceeded.' };
  }
  if (projectedSpendUsd >= 1000000) {
    return { route: 'Executive Leadership', reason: 'High spend threshold requires executive approval.' };
  }
  return { route: 'Buyer', reason: 'No escalation required.' };
}

export function governanceDashboardSnapshot() {
  return {
    pendingApprovals: 12,
    escalatedWorkflows: 4,
    overrideFrequency: '8.3% (30d)',
    highRiskSuppliers: 6,
    lowConfidenceRecommendations: 9,
    complianceAlerts: 3,
    auditActivity: 126,
    systemUsageMetrics: {
      activeUsersToday: 48,
      recommendationsGenerated: 221,
      humanApprovalRate: '91%'
    },
    executiveSummary: [
      'Human approvals remain above 90% for critical sourcing decisions.',
      'Low-confidence recommendations are auto-routed for secondary review.',
      'No autonomous purchasing actions are permitted by platform policy.'
    ]
  };
}

export function defaultWorkflow() {
  const confidence = scoreConfidence({ completeness: 0.86, modelAgreement: 0.8, policyMatch: 0.88 });
  const explainability = buildExplainability({
    recommendation: 'Shortlist Atlas Components for Q4 avionics assemblies.',
    supplier: { name: 'Atlas Components', riskScore: 42 },
    metrics: {
      onTimeDelivery: 97,
      naicsAlignment: '5/6 matched',
      contractSuccess: '14/16',
      costVariance: 2.9,
      spendTrend: '+6.2% quarter-over-quarter',
      qualityIndex: 94,
      deliveryTrendDelta: 4.1
    },
    compliance: {
      farDfars: 'Compliant',
      exclusions: 'No active exclusions',
      cybersecurity: 'NIST 800-171 attested'
    }
  });
  const escalation = deriveEscalation({
    confidenceBand: confidence.band,
    complianceMismatch: false,
    supplierRiskScore: explainability.contributingDataPoints.supplierRiskScore,
    projectedSpendUsd: 840000
  });

  return {
    workflowId: 'wf-supplier-001',
    workflowType: 'supplier_recommendation',
    states: WORKFLOW_STATES,
    currentState: 'Pending Review',
    recommendation: explainability.recommendation,
    confidence,
    explainability,
    escalation,
    actions: ['Override Recommendation', 'Escalate for Review', 'Request Compliance Review', 'Require Secondary Approval'],
    governanceIndicators: {
      humanInTheLoop: true,
      advisoryOnly: true,
      auditLoggingEnabled: true,
      requiresHumanApproval: true
    }
  };
}

export { WORKFLOW_STATES };


export function buildSecurityCommandCenterSnapshot() {
  return {
    activeUsers: 48,
    failedLogins24h: 7,
    auditEvents24h: 126,
    exports24h: 14,
    approvalsPending: 12,
    highRiskActions24h: 5,
    tenantActivityScore: 89,
    incidentOpen: 2
  };
}

export function buildSoc2Dashboard() {
  return [
    { category: 'Security', status: 'Healthy', score: 92, note: 'RBAC, approval gates, and admin override logging are active.' },
    { category: 'Availability', status: 'Monitor', score: 88, note: 'Availability SLO telemetry and incident escalation workflows enabled.' },
    { category: 'Processing Integrity', status: 'Healthy', score: 90, note: 'Human-in-the-loop approvals enforce decision integrity.' },
    { category: 'Confidentiality', status: 'Healthy', score: 91, note: 'Tenant-scoped records and encrypted audit signatures in place.' },
    { category: 'Privacy', status: 'Monitor', score: 86, note: 'Data minimization and privacy workflow checkpoints are configured.' }
  ];
}

export function buildNistCsfDashboard() {
  return [
    { function: 'Govern', readiness: 'Implemented', focus: 'Policy workflows, approvals, and governance command center.' },
    { function: 'Identify', readiness: 'Implemented', focus: 'Tenant activity baselines and high-risk action detection.' },
    { function: 'Protect', readiness: 'Implemented', focus: 'Role and module permissions with override controls.' },
    { function: 'Detect', readiness: 'Implemented', focus: 'Centralized security logging, failed login and export monitoring.' },
    { function: 'Respond', readiness: 'In Progress', focus: 'Incident escalation workflow and admin notification orchestration.' },
    { function: 'Recover', readiness: 'In Progress', focus: 'Runbook-backed incident closure and continuity evidence tracking.' }
  ];
}

export function complianceReadiness() {
  return {
    soc2Readiness: 'Foundational controls implemented',
    nistCsfAlignment: 'Core functions mapped to Sentinel controls',
    ssoReadiness: true,
    mfaReadiness: true,
    encryptionReadiness: true,
    tenantIsolationFoundation: 'Tenant IDs enforced across governance and audit records.'
  };
}

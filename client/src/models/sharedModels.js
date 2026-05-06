export const SharedModels = {
  Users: { id: 'u_001', name: 'Demo User', role: 'Buyer', organizationId: 'org_001' },
  Organizations: { id: 'org_001', name: 'BlackCrest Holdings', tier: 'enterprise' },
  Suppliers: { id: 'sup_001', name: 'Atlas Components', riskLevel: 'moderate' },
  Proposals: { id: 'prop_001', ownerId: 'u_001', status: 'draft' },
  ProposalItems: { id: 'item_001', proposalId: 'prop_001', description: 'Industrial bearings' },
  Messages: { id: 'msg_001', fromUserId: 'u_001', text: 'Review complete.' },
  RiskAssessments: { id: 'risk_001', supplierId: 'sup_001', score: 78 },
  AuditLogs: { id: 'audit_001', actorId: 'u_001', action: 'login', targetType: 'session' }
};

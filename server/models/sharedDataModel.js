export const sharedDataModel = {
  Users: [{ id: 'u_001', email: 'buyer@blackcrest.ai', role: 'Buyer', organizationId: 'org_001' }],
  Organizations: [{ id: 'org_001', name: 'BlackCrest Holdings' }],
  Suppliers: [{ id: 'sup_001', name: 'Atlas Components' }],
  Proposals: [{ id: 'prop_001', organizationId: 'org_001', status: 'draft' }],
  ProposalItems: [{ id: 'item_001', proposalId: 'prop_001', sku: 'BRG-1' }],
  Messages: [{ id: 'msg_001', fromUserId: 'u_001', body: 'Ready for review' }],
  RiskAssessments: [{ id: 'risk_001', supplierId: 'sup_001', score: 82 }],
  AuditLogs: []
};

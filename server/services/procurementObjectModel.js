export const procurementObjectModel = {
  supplier: { id: 'string', supplierName: 'string', category: 'string', region: 'string', riskScore: 'number' },
  category: { id: 'string', categoryName: 'string', totalSpend: 'number', supplierCount: 'number' },
  partItem: { id: 'string', partNumber: 'string', description: 'string', categoryId: 'string', uom: 'string' },
  purchaseOrderLine: { id: 'string', supplierId: 'string', itemId: 'string', quantity: 'number', unitPrice: 'number', extendedValue: 'number', orderDate: 'date' },
  blanketPoRecommendation: { supplier: 'string', groupedItems: 'array', estimatedValue: 'number', recommendedTermMonths: 'number' },
  rfpDocumentAnalysis: { id: 'string', executiveSummary: 'string', bidNoBidScore: 'number', complianceChecklist: 'array' },
  marginLeakAlert: { severity: 'low|medium|high|critical', estimatedLeakageAmount: 'number', evidence: 'string', roleOwner: 'role' },
  supplierRecommendation: { supplierName: 'string', score: 'number', rationale: 'array' },
  roleBasedActionItem: { roleOwner: 'role', action: 'string', status: 'open|in_progress|done', dueDate: 'date' },
  erpConnectorProfile: { provider: 'string', mode: 'demo|csv|api|sftp', status: 'not_configured|demo_ready|pending_it_approval|connected|error', readOnly: 'boolean' }
};

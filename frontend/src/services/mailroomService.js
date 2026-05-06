const GRAPH_SCOPES = ['Mail.Read', 'Mail.Send', 'offline_access'];

export function getGraphIntegrationStatus() {
  const hasCredentials = Boolean(import.meta.env.VITE_GRAPH_CLIENT_ID);
  return {
    mode: hasCredentials ? 'oauth-ready' : 'mock-demo',
    oauthReady: true,
    connected: hasCredentials,
    tokenStorage: 'encrypted-session-vault',
    secureSessionHandling: 'httpOnly-session-bound-rotation',
    leastPrivilegePermissions: GRAPH_SCOPES,
    transport: 'TLS 1.2+ enforced',
    tokenHandling: 'short-lived access tokens + refresh token rotation'
  };
}

export const supplierStatusOptions = ['awaiting quote', 'incomplete', 'under review', 'approved', 'escalated'];

export function getSecureArchitecture() {
  return {
    encryptionAtRest: 'AES-256 envelope encryption (placeholder)',
    e2eEncryption: 'proposal-room E2EE key exchange placeholder',
    rbac: 'role + action scoped policy enforcement',
    mfaReady: true,
    tenantIsolation: 'tenant-scoped keys and data partitions',
    fileStorage: 'secure object storage with per-file access policy',
    immutableAudit: 'append-only audit chain + hash anchors'
  };
}

export function getMailroomDashboardData() {
  return {
    queues: [
      { key: 'supplierInbox', label: 'Supplier Inbox', count: 18 },
      { key: 'proposalRequests', label: 'Proposal Requests', count: 7 },
      { key: 'awaitingSupplierResponse', label: 'Awaiting Supplier Response', count: 12 },
      { key: 'missingInformation', label: 'Missing Information', count: 4 },
      { key: 'escalations', label: 'Escalations', count: 3 },
      { key: 'completedPackages', label: 'Completed Packages', count: 26 }
    ],
    workflows: ['RFQ issuance', 'Supplier proposal discussions', 'Secure attachment review', 'Proposal approvals', 'Sourcing collaboration', 'Escalation workflows', 'Executive review'],
    proposalRooms: [
      { id: 'room-77', name: 'Composite Housing RFQ', members: 'Buyer, Supplier, Sourcing, Executive', expiry: '14 days', externalCollab: true },
      { id: 'room-88', name: 'Precision Fasteners Refresh', members: 'Buyer, Supplier, Legal', expiry: '7 days', externalCollab: false }
    ],
    threads: [
      { id: 'thr-001', supplierName: 'Apex Dynamics', subject: 'Re: Q3 Composite Housing Proposal', timestamp: '2026-05-06T14:40:00Z', hasAttachment: true, proposalStatus: 'under review', risk: 'medium', assignedBuyer: 'M. Delgado', expiresIn: '72h' },
      { id: 'thr-002', supplierName: 'Vector Forge', subject: 'Quote Clarification Needed for Line 12', timestamp: '2026-05-06T13:10:00Z', hasAttachment: false, proposalStatus: 'incomplete', risk: 'high', assignedBuyer: 'S. Harper', expiresIn: '48h' },
      { id: 'thr-003', supplierName: 'Northline Components', subject: 'Final Pricing Package Attached', timestamp: '2026-05-05T22:05:00Z', hasAttachment: true, proposalStatus: 'approved', risk: 'low', assignedBuyer: 'J. Patel', expiresIn: '120h' }
    ],
    attachments: [
      { id: 'att-1001', fileName: 'Apex-Pricing-v2.pdf', type: 'PDF', sizeKb: 840, proposalId: 'P-44201', permissions: 'Buyer+Executive', encrypted: true },
      { id: 'att-1002', fileName: 'Vector_BOM.xlsx', type: 'Excel', sizeKb: 320, proposalId: 'P-44218', permissions: 'Buyer+Sourcing', encrypted: true },
      { id: 'att-1003', fileName: 'Northline-Exception-Notes.docx', type: 'DOCX', sizeKb: 126, proposalId: 'P-44199', permissions: 'Buyer+Legal', encrypted: true }
    ],
    compliance: ['SOC 2 readiness', 'NIST CSF aligned controls', 'CMMC-aware workflow tagging', 'ITAR-sensitive handling placeholder'],
    executive: { avgSupplierResponseHours: 29.4, stalledProposals: 5, supplierResponsiveness: '86%', proposalThroughputMonthly: 42 }
  };
}

export function runAiAssistAction(action, threadId) {
  return Promise.resolve({ output: `Mock ${action} response generated for ${threadId}. Review and submit for human approval.` });
}

export function runDeepScanAttachment(attachmentId) {
  return Promise.resolve({
    attachmentId,
    extractedData: ['line item counts', 'delivery terms', 'pricing matrix'],
    missingFields: ['incoterms', 'warranty duration'],
    riskFlags: ['late delivery penalty absent'],
    summary: 'Supplier submission is complete for pricing but missing contractual transport terms.',
    executiveSummary: 'Moderate risk. Pricing competitive, terms incomplete.'
  });
}

export function logSentinelEvent(eventType, payload) {
  return { eventType, payload, loggedAt: new Date().toISOString(), sink: 'sentinel-audit-service', immutable: true };
}

const connectors = [
  {
    id: 'conn-sap-demo',
    provider: 'SAP',
    mode: 'csv_now_api_later',
    status: 'csv_ready',
    readOnly: true,
    scopesRequested: ['purchase_orders:read', 'suppliers:read'],
    lastSyncTimestamp: null,
    sampleMapping: { vendor: 'LIFNR', item: 'MATNR', total: 'NETWR' },
    tokenFields: ['clientId', 'clientSecretRef', 'refreshTokenRef'],
    itApprovalStatus: 'pending_it_approval',
    securityNotes: 'ERP connectors are CSV now, API later. Customer IT can approve API cutover when ready.'
  }
];

export function listErpConnectors() {
  return connectors;
}

export function createErpConnector(payload = {}) {
  const connector = {
    id: `conn-${Date.now()}`,
    provider: payload.provider,
    mode: payload.mode || 'csv_now_api_later',
    status: payload.status || 'not_configured',
    readOnly: payload.readOnly ?? true,
    scopesRequested: payload.scopesRequested || [],
    lastSyncTimestamp: null,
    sampleMapping: payload.sampleMapping || {},
    tokenFields: payload.tokenFields || ['accessTokenRef'],
    itApprovalStatus: payload.itApprovalStatus || 'pending_it_approval',
    securityNotes: payload.securityNotes || 'Customer-controlled ERP integration model.'
  };
  connectors.push(connector);
  return connector;
}

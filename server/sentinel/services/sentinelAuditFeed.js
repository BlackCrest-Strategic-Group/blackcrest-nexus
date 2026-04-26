const ACTIVITY_TYPES = [
  'upload',
  'analysis',
  'export',
  'search',
  'alert_interaction',
  'role_change',
  'admin_action'
];

export function buildSentinelAuditFeed() {
  const now = Date.now();
  return ACTIVITY_TYPES.map((type, idx) => ({
    id: `audit-${idx + 1}`,
    eventType: type,
    actor: ['Buyer Ops', 'Procurement Manager', 'Director Supply', 'Exec Office', 'Admin'][idx % 5],
    detail: `${type.replaceAll('_', ' ')} captured by Sentinel governance controls.`,
    timestamp: new Date(now - idx * 1000 * 60 * 37).toISOString(),
    auditReference: `AUD-${new Date().getUTCFullYear()}-${String(idx + 1).padStart(4, '0')}`,
    classification: ['Internal', 'Confidential', 'Proprietary', 'ITAR', 'CUI', 'Export Controlled'][idx % 6]
  }));
}

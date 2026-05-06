const events = [];
const ALLOWED_EVENTS = new Set(['login', 'logout', 'uploads', 'exports', 'proposal_generation', 'approvals', 'email_actions']);

export function logAuditEvent(event, payload = {}) {
  const normalizedEvent = ALLOWED_EVENTS.has(event) ? event : 'email_actions';
  const record = { id: `audit_${events.length + 1}`, event: normalizedEvent, payload, timestamp: new Date().toISOString() };
  events.unshift(record);
  return record;
}

export function listAuditEvents() { return events.slice(0, 100); }

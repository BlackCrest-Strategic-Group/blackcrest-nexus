export function auditEvent(event, metadata = {}) {
  return fetch('/api/audit/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, metadata, timestamp: new Date().toISOString() })
  }).catch(() => null);
}

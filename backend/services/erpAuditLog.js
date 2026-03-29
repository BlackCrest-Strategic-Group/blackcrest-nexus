/**
 * ERP Audit Logging Service
 *
 * Produces structured JSON audit records compliant with:
 *   NIST SP 800-53 Rev 5 — AU-2 (Event Logging), AU-3 (Content of Audit Records),
 *                           AU-8 (Time Stamps), AU-9 (Protection of Audit Information)
 *
 * Every record includes the minimum fields mandated by AU-3:
 *   - event_type   : what happened
 *   - timestamp    : UTC ISO-8601 (AU-8)
 *   - user_id      : who initiated the action
 *   - source_ip    : origin of the request
 *   - success      : outcome (true/false)
 *   - nist_control : primary NIST control being exercised
 *
 * Records are written to stdout as newline-delimited JSON so they can be
 * ingested by any SIEM or log-aggregation system.
 */

// Map of event types → primary NIST SP 800-53 control reference
const NIST_CONTROL_MAP = {
  ERP_CONNECT_SUCCESS:    "IA-5(1)",   // Authenticator Management: token issued
  ERP_CONNECT_FAILURE:    "AC-7",      // Unsuccessful Logon Attempts
  ERP_AUTH_LOCKED:        "AC-7",      // Account locked after repeated failures
  ERP_RECONNECT_SUCCESS:  "IA-11",     // Re-Authentication
  ERP_RECONNECT_FAILURE:  "AC-7",      // Unsuccessful Logon Attempts
  ERP_TOKEN_EXPIRED:      "AC-12",     // Session Termination
  ERP_TOKEN_REVOKED:      "AC-12",     // Session Termination (manual)
  ERP_DATA_ACCESS:        "AC-3",      // Access Enforcement
  ERP_TEST_SUCCESS:       "AC-3",
  ERP_TEST_FAILURE:       "AC-3",
  ERP_CONFIG_DELETED:     "AC-2"       // Account Management: config removed
};

/**
 * Write a single NIST-compliant audit record to stdout.
 *
 * @param {string} eventType  - One of the keys in NIST_CONTROL_MAP
 * @param {object} fields     - Contextual fields for the event
 */
export function erpAudit(eventType, fields = {}) {
  const record = {
    audit:        true,
    nist_control: NIST_CONTROL_MAP[eventType] ?? "AU-2",
    event_type:   eventType,
    timestamp:    new Date().toISOString(),          // AU-8: system clock, UTC
    user_id:      fields.userId    ?? "unknown",
    user_email:   fields.userEmail ?? "unknown",
    erp_config_id: fields.configId ?? null,
    erp_system:   fields.system    ?? null,
    source_ip:    fields.sourceIp  ?? "unknown",
    success:      Boolean(fields.success),
    endpoint:     fields.endpoint  ?? null,
    failure_reason: fields.failureReason ?? null,
    token_expires_at: fields.tokenExpiresAt ?? null,
    attempt_count: fields.attemptCount ?? null
  };

  // Remove null/undefined fields to keep records clean
  Object.keys(record).forEach((k) => record[k] === null && delete record[k]);

  // Write as JSON — parseable by SIEM / log aggregators
  console.log(JSON.stringify(record));
}

/**
 * Extract the client IP from an Express request, honouring X-Forwarded-For
 * set by trusted reverse proxies (Render, Cloudflare, etc.).
 * Returns "unknown" if no IP can be determined.
 */
export function getSourceIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // X-Forwarded-For may be a comma-separated list; take the first (client) IP
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

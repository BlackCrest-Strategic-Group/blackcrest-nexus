/**
 * ERP Audit Logging Service
 *
 * Produces structured JSON audit records compliant with:
 *   NIST SP 800-53 Rev 5 — AU-2 (Event Logging), AU-3 (Content of Audit Records),
 *                           AU-8 (Time Stamps), AU-9 (Protection of Audit Information)
 *
 * All records flow through the centralized audit logger so they appear in
 * both stdout (Render / Datadog) and the local development log file.
 *
 * ERP-specific events that map to central event types:
 *   ERP_CONNECT_SUCCESS   → EVENT.ERP_TOKEN_CONNECTED
 *   ERP_RECONNECT_SUCCESS → EVENT.ERP_TOKEN_REFRESH
 *
 * All other ERP events are emitted with their original event_type strings
 * and are still picked up by the central logger.
 */

import { audit, getIp, EVENT } from "./auditLogger.js";

// Map ERP-specific event types → primary NIST SP 800-53 control reference
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

// Map ERP events → central EVENT constants where a direct mapping exists
const CENTRAL_EVENT_MAP = {
  ERP_CONNECT_SUCCESS:   EVENT.ERP_TOKEN_CONNECTED,
  ERP_RECONNECT_SUCCESS: EVENT.ERP_TOKEN_REFRESH
};

/**
 * Write a NIST-compliant ERP audit record through the central audit logger.
 *
 * @param {string} eventType  - One of the keys in NIST_CONTROL_MAP
 * @param {object} fields     - Contextual fields for the event
 */
export function erpAudit(eventType, fields = {}) {
  // Use the mapped central event type if one exists, otherwise use the raw ERP type
  const centralType = CENTRAL_EVENT_MAP[eventType] ?? eventType;

  audit(centralType, {
    userId:  fields.userId    ?? null,
    email:   fields.userEmail ?? null,
    ip:      fields.sourceIp  ?? null,
    route:   fields.endpoint  ?? null,
    success: Boolean(fields.success),
    details: {
      nist_control:     NIST_CONTROL_MAP[eventType] ?? "AU-2",
      erp_event_type:   eventType,
      erp_config_id:    fields.configId      ?? null,
      erp_system:       fields.system        ?? null,
      failure_reason:   fields.failureReason ?? null,
      token_expires_at: fields.tokenExpiresAt ?? null,
      attempt_count:    fields.attemptCount  ?? null
    }
  });
}

/**
 * Extract the client IP from an Express request, honouring X-Forwarded-For
 * set by trusted reverse proxies (Render, Cloudflare, etc.).
 * Delegates to the central getIp helper for consistency.
 */
export function getSourceIp(req) {
  return getIp(req);
}

/**
 * Centralized Audit Logger
 *
 * Writes structured JSON audit records to:
 *   - stdout always  (compatible with Render, Datadog, and any SIEM)
 *   - logs/audit.log in development  (file tail / grep friendly)
 *
 * All records include: eventType, timestamp, userId, email, ip,
 * route, method, success, and details.
 *
 * Sensitive fields (passwords, tokens, secrets) are stripped from
 * every record before writing.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const LOG_DIR  = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "audit.log");
const IS_DEV   = process.env.NODE_ENV !== "production";

// Ensure logs directory exists in development
if (IS_DEV) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch { /* ignore */ }
}

// ── Event type constants ──────────────────────────────────────────────────────

export const EVENT = Object.freeze({
  LOGIN_SUCCESS:        "LOGIN_SUCCESS",
  LOGIN_FAILURE:        "LOGIN_FAILURE",
  MFA_SUCCESS:          "MFA_SUCCESS",
  MFA_FAILURE:          "MFA_FAILURE",
  FILE_UPLOAD:          "FILE_UPLOAD",
  ANALYSIS_RUN:         "ANALYSIS_RUN",
  ERP_TOKEN_CONNECTED:  "ERP_TOKEN_CONNECTED",
  ERP_TOKEN_REFRESH:    "ERP_TOKEN_REFRESH",
  PERMISSION_DENIED:    "PERMISSION_DENIED",
  ADMIN_ACTION:         "ADMIN_ACTION"
});

// ── Sensitive-field scrubber ──────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  "password", "token", "refreshToken", "accessToken", "secret",
  "clientSecret", "erpPassword", "otp", "mfaToken", "resetToken",
  "totpSecret", "backupCode", "authorization", "cookie"
]);

function sanitize(value, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k]) => !SENSITIVE_KEYS.has(k))
      .map(([k, v]) => [k, sanitize(v, depth + 1)])
  );
}

// ── IP extraction ─────────────────────────────────────────────────────────────

/**
 * Extract the real client IP from an Express request.
 * Handles X-Forwarded-For set by Render, Cloudflare, or other reverse proxies.
 */
export function getIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

// ── Core logger ───────────────────────────────────────────────────────────────

/**
 * Write a single audit record.
 *
 * @param {string} eventType  - One of the EVENT constants
 * @param {object} fields     - Contextual fields for the record
 *   @param {string}  fields.userId     - Authenticated user ID
 *   @param {string}  fields.email      - Authenticated user email
 *   @param {string}  fields.ip         - Source IP address
 *   @param {string}  fields.route      - Request path  (e.g. "/api/auth/login")
 *   @param {string}  fields.method     - HTTP method   (e.g. "POST")
 *   @param {boolean} fields.success    - Whether the action succeeded
 *   @param {object}  fields.details    - Any extra context (sanitized automatically)
 *   @param {number}  fields.durationMs - Request duration in ms (optional)
 */
export function audit(eventType, fields = {}) {
  const record = {
    eventType,
    timestamp:  new Date().toISOString(),
    userId:     fields.userId     ?? null,
    email:      fields.email      ?? null,
    ip:         fields.ip         ?? null,
    route:      fields.route      ?? null,
    method:     fields.method     ?? null,
    success:    fields.success    ?? null,
    details:    sanitize(fields.details) ?? null,
    durationMs: fields.durationMs ?? null
  };

  // Remove null fields for clean, compact records
  Object.keys(record).forEach((k) => record[k] === null && delete record[k]);

  const line = JSON.stringify(record);

  // Always write to stdout (Render / Datadog picks this up)
  console.log(line);

  // In development also append to file (useful for local grep / tail -f)
  if (IS_DEV) {
    try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch { /* non-fatal */ }
  }
}

// ── Request metadata middleware ───────────────────────────────────────────────

/**
 * Express middleware that attaches consistent request metadata to every
 * incoming request so that any route or middleware can build audit records
 * without duplicating IP-extraction or timing logic.
 *
 * Attaches:
 *   req.startTime  — high-resolution start timestamp (ms since epoch)
 *   req.clientIp   — resolved client IP address
 */
export function requestMetadata(req, _res, next) {
  req.startTime = Date.now();
  req.clientIp  = getIp(req);
  next();
}

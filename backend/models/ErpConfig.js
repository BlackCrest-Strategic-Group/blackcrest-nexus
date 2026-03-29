/**
 * ErpConfig Model
 *
 * Stores ERP connection metadata and an encrypted short-lived access token.
 * User credentials (username / password) are NEVER persisted — they are used
 * once at connect/reconnect time to obtain a token, then immediately discarded.
 *
 * NIST SP 800-53 Rev 5 controls implemented here:
 *   AC-7   — Failed attempt counter + lockout timestamp
 *   IA-5   — Authenticator (token) lifecycle tracking (issued / expires)
 *   IA-11  — Max token age enforcement (hard cap, independent of ERP-returned TTL)
 *   SC-12  — Encryption key version field for future key rotation
 *   SC-13  — AES-256-GCM (NIST FIPS 197 / SP 800-38D approved algorithm)
 *   SC-28  — Encryption of sensitive data at rest (access token)
 */
import mongoose from "mongoose";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// NIST IA-11: Maximum session/token age — re-authentication required after this period.
// Overridable via ERP_MAX_TOKEN_AGE_HOURS env var; default 8 hours (NIST-recommended).
export const MAX_TOKEN_AGE_SECONDS =
  parseInt(process.env.ERP_MAX_TOKEN_AGE_HOURS || "8", 10) * 3600;

// NIST AC-7: Lock a config after this many consecutive failed auth attempts.
export const MAX_FAILED_AUTH_ATTEMPTS =
  parseInt(process.env.ERP_MAX_FAILED_AUTH_ATTEMPTS || "5", 10);

// NIST AC-7: Duration of the lockout window in minutes.
export const AUTH_LOCKOUT_MINUTES =
  parseInt(process.env.ERP_AUTH_LOCKOUT_MINUTES || "15", 10);

function getKey() {
  const k = process.env.ERP_ENCRYPTION_KEY;
  if (!k) throw new Error("ERP_ENCRYPTION_KEY is not configured");
  return Buffer.from(k, "hex");
}

// NIST SC-13 / SC-28: AES-256-GCM authenticated encryption
function encrypt(text) {
  const key = getKey();
  const iv = crypto.randomBytes(12);           // 96-bit IV (NIST SP 800-38D)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();             // 128-bit authentication tag
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(payload) {
  const key = getKey();
  const [ivHex, tagHex, encHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final()
  ]).toString("utf8");
}

const erpConfigSchema = new mongoose.Schema(
  {
    system: {
      type: String,
      enum: ["infor_syteline", "oracle", "sap"],
      required: true
    },
    label:     { type: String, trim: true, default: "" },
    tenantUrl: { type: String, trim: true, required: true },
    tokenUrl:  { type: String, trim: true, default: "" },
    scope:     { type: String, trim: true, default: "" },

    // Optional public client identifier (not secret — required for ROPC on some ERPs)
    clientId:  { type: String, trim: true, default: "" },

    // ── Token storage (SC-28) ───────────────────────────────────────────────
    // Only the encrypted token is ever persisted; raw credentials are never stored.
    accessTokenEnc: { type: String, default: null },
    tokenIssuedAt:  { type: Date, default: null },    // IA-5: when token was issued
    tokenExpiresAt: { type: Date, default: null },    // IA-5 / IA-11: hard expiry

    // SC-12: Key version — allows future key rotation without invalidating existing tokens
    encKeyVersion: { type: Number, default: 1 },

    // ── AC-7: Unsuccessful Logon Attempt tracking ───────────────────────────
    failedAuthAttempts:  { type: Number, default: 0 },
    failedAuthLockedUntil: { type: Date, default: null },
    lastAuthAt: { type: Date, default: null },        // IA-5: last successful auth

    connectionStatus: {
      type: String,
      enum: ["connected", "expired", "locked", "error", "disconnected"],
      default: "disconnected"
    },

    isActive:        { type: Boolean, default: true },
    lastTestAt:      { type: Date, default: null },
    lastTestStatus:  { type: String, enum: ["ok", "error", ""], default: "" },
    lastTestMessage: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// ── IA-5 / IA-11: Store an access token securely with capped lifetime ────────
erpConfigSchema.methods.setAccessToken = function (plainToken, erpExpiresInSeconds) {
  // NIST IA-11: Never allow a token to outlive MAX_TOKEN_AGE_SECONDS, even if the
  // ERP system issued it with a longer TTL.
  const effectiveExpiry = Math.min(erpExpiresInSeconds, MAX_TOKEN_AGE_SECONDS);

  this.accessTokenEnc    = encrypt(plainToken);
  this.tokenIssuedAt     = new Date();
  this.tokenExpiresAt    = new Date(Date.now() + effectiveExpiry * 1000);
  this.connectionStatus  = "connected";
  this.lastAuthAt        = new Date();
  this.failedAuthAttempts   = 0;     // AC-7: reset counter on success
  this.failedAuthLockedUntil = null;
};

// Retrieve the decrypted access token (returns null if not set)
erpConfigSchema.methods.getAccessToken = function () {
  if (!this.accessTokenEnc) return null;
  return decrypt(this.accessTokenEnc);
};

// Check whether the stored token is still valid
erpConfigSchema.methods.isTokenValid = function () {
  if (!this.accessTokenEnc || !this.tokenExpiresAt) return false;
  return this.tokenExpiresAt > new Date();
};

// ── AC-7: Check / record failed authentication attempts ──────────────────────
erpConfigSchema.methods.isAuthLocked = function () {
  if (!this.failedAuthLockedUntil) return false;
  return this.failedAuthLockedUntil > new Date();
};

erpConfigSchema.methods.recordFailedAuth = function () {
  this.failedAuthAttempts = (this.failedAuthAttempts || 0) + 1;
  if (this.failedAuthAttempts >= MAX_FAILED_AUTH_ATTEMPTS) {
    this.failedAuthLockedUntil = new Date(Date.now() + AUTH_LOCKOUT_MINUTES * 60 * 1000);
    this.connectionStatus = "locked";
  } else {
    this.connectionStatus = "error";
  }
};

// Clear the stored token (on disconnect or error)
erpConfigSchema.methods.clearToken = function () {
  this.accessTokenEnc      = null;
  this.tokenIssuedAt       = null;
  this.tokenExpiresAt      = null;
  this.connectionStatus    = "disconnected";
};

// Safe public view — never exposes the token itself (SC-28)
erpConfigSchema.methods.toPublic = function () {
  return {
    id:               this._id,
    system:           this.system,
    label:            this.label,
    tenantUrl:        this.tenantUrl,
    tokenUrl:         this.tokenUrl,
    scope:            this.scope,
    clientId:         this.clientId,
    connectionStatus: this.connectionStatus,
    tokenIssuedAt:    this.tokenIssuedAt,
    tokenExpiresAt:   this.tokenExpiresAt,
    lastAuthAt:       this.lastAuthAt,
    failedAuthAttempts: this.failedAuthAttempts,
    isAuthLocked:     this.isAuthLocked(),
    failedAuthLockedUntil: this.failedAuthLockedUntil,
    isActive:         this.isActive,
    lastTestAt:       this.lastTestAt,
    lastTestStatus:   this.lastTestStatus,
    lastTestMessage:  this.lastTestMessage,
    createdAt:        this.createdAt
  };
};

erpConfigSchema.index({ system: 1, createdBy: 1 });

const ErpConfig = mongoose.model("ErpConfig", erpConfigSchema);
export default ErpConfig;

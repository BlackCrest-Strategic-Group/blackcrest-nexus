/**
 * ErpConfig Model
 *
 * Stores ERP connection metadata and an encrypted short-lived access token.
 * User credentials (username / password) are NEVER persisted — they are used
 * once at connect/reconnect time to obtain a token, then immediately discarded.
 */
import mongoose from "mongoose";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const k = process.env.ERP_ENCRYPTION_KEY;
  if (!k) throw new Error("ERP_ENCRYPTION_KEY is not configured");
  return Buffer.from(k, "hex");
}

function encrypt(text) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
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
    label: { type: String, trim: true, default: "" },
    tenantUrl: { type: String, trim: true, required: true },
    tokenUrl: { type: String, trim: true, default: "" },
    scope: { type: String, trim: true, default: "" },
    // Optional public client identifier (not secret — needed for ROPC on some ERP systems)
    clientId: { type: String, trim: true, default: "" },

    // Encrypted short-lived access token — the ONLY credential stored
    accessTokenEnc: { type: String, default: null },
    tokenIssuedAt: { type: Date, default: null },
    tokenExpiresAt: { type: Date, default: null },

    connectionStatus: {
      type: String,
      enum: ["connected", "expired", "error", "disconnected"],
      default: "disconnected"
    },

    isActive: { type: Boolean, default: true },
    lastTestAt: { type: Date, default: null },
    lastTestStatus: { type: String, enum: ["ok", "error", ""], default: "" },
    lastTestMessage: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Store an access token securely
erpConfigSchema.methods.setAccessToken = function (plainToken, expiresInSeconds) {
  this.accessTokenEnc = encrypt(plainToken);
  this.tokenIssuedAt = new Date();
  this.tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  this.connectionStatus = "connected";
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

// Clear the stored token (on disconnect or error)
erpConfigSchema.methods.clearToken = function () {
  this.accessTokenEnc = null;
  this.tokenIssuedAt = null;
  this.tokenExpiresAt = null;
  this.connectionStatus = "disconnected";
};

// Safe public view — never exposes the token itself
erpConfigSchema.methods.toPublic = function () {
  return {
    id: this._id,
    system: this.system,
    label: this.label,
    tenantUrl: this.tenantUrl,
    tokenUrl: this.tokenUrl,
    scope: this.scope,
    clientId: this.clientId,
    connectionStatus: this.connectionStatus,
    tokenIssuedAt: this.tokenIssuedAt,
    tokenExpiresAt: this.tokenExpiresAt,
    isActive: this.isActive,
    lastTestAt: this.lastTestAt,
    lastTestStatus: this.lastTestStatus,
    lastTestMessage: this.lastTestMessage,
    createdAt: this.createdAt
  };
};

erpConfigSchema.index({ system: 1, createdBy: 1 });

const ErpConfig = mongoose.model("ErpConfig", erpConfigSchema);
export default ErpConfig;

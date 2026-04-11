/**
 * ERP Connector Routes  –  /api/erp
 *
 * Security model:
 *   - Users provide their ERP username + password ONCE at connect/reconnect time.
 *   - The server immediately exchanges those credentials for a short-lived access token.
 *   - Credentials are NEVER written to the database, logs, or any persistent store.
 *   - Only the resulting AES-256-GCM encrypted token is persisted.
 *   - When the token expires, users must reconnect (re-enter their ERP credentials).
 *
 * NIST SP 800-53 Rev 5 controls applied:
 *   AC-2   — Account Management (config lifecycle)
 *   AC-3   — Access Enforcement (token required for data access)
 *   AC-7   — Unsuccessful Logon Attempts (lockout after N failures)
 *   AC-12  — Session Termination (token expiry + revocation logging)
 *   AU-2   — Event Logging (all auth and data-access events logged)
 *   AU-3   — Content of Audit Records (structured JSON with required fields)
 *   AU-8   — Time Stamps (UTC ISO-8601)
 *   IA-5   — Authenticator Management (token lifecycle, no credential storage)
 *   IA-11  — Re-Authentication (max token age cap, reconnect on expiry)
 *   SC-28  — Protection of Information at Rest (Cache-Control: no-store)
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import ErpConfig, { MAX_FAILED_AUTH_ATTEMPTS, AUTH_LOCKOUT_MINUTES } from "../models/ErpConfig.js";
import User from "../models/User.js";
import * as infor from "../connectors/infor.js";
import * as oracle from "../connectors/oracle.js";
import * as sap from "../connectors/sap.js";
import { erpAudit, getSourceIp } from "../services/erpAuditLog.js";

const router = express.Router();

// ── Rate Limiters ─────────────────────────────────────────────────────────────

// General write limiter for config management
const erpWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

// Tighter limiter for authentication endpoints (NIST AC-7)
const erpAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: {
    success: false,
    error: "Too many authentication attempts. Please wait 15 minutes before trying again."
  }
});

// Map system identifier → connector module
const connectors = { infor_syteline: infor, oracle, sap };

// NIST SC-28: Prevent caching of any ERP response (data or auth outcome)
const noStore = (res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
};

// ── Token resolution ──────────────────────────────────────────────────────────

/**
 * Return the stored access token if it is still valid.
 * If expired, mark the config and emit an audit record (NIST AC-12).
 * Returns null when the caller must redirect the user to reconnect.
 */
async function resolveToken(cfg, auditCtx = {}) {
  if (cfg.isTokenValid()) {
    return cfg.getAccessToken();
  }
  if (cfg.accessTokenEnc) {
    cfg.connectionStatus = "expired";
    await cfg.save();
    erpAudit("ERP_TOKEN_EXPIRED", {
      ...auditCtx,
      configId: cfg._id,
      system:   cfg.system,
      success:  false,
      failureReason: "Token TTL elapsed — re-authentication required (NIST IA-11)"
    });
  }
  return null;
}

// ── MFA guard ─────────────────────────────────────────────────────────────────

/**
 * Require a recent MFA verification before allowing ERP credential operations.
 * Protects against a stolen app session being used to access ERP systems.
 */
async function requireMfaForErp(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("mfaEnabled lastMfaVerificationAt");
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    if (user.mfaEnabled) {
      const maxAgeHours = parseInt(process.env.MFA_ERP_ACCESS_MAX_AGE_HOURS || "24", 10);
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      if (
        !user.lastMfaVerificationAt ||
        Date.now() - user.lastMfaVerificationAt.getTime() > maxAgeMs
      ) {
        return res.status(403).json({
          success: false,
          error: "MFA verification required. Please sign in with MFA to access ERP settings.",
          requiresMfaVerification: true
        });
      }
    }
    next();
  } catch (err) {
    console.error("MFA ERP check error:", err.message);
    res.status(500).json({ success: false, error: "Authorization check failed." });
  }
}

// ── User context helper ───────────────────────────────────────────────────────

async function getUserEmail(userId) {
  try {
    const u = await User.findById(userId).select("email").lean();
    return u?.email ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ── GET /api/erp ──────────────────────────────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  noStore(res);
  try {
    const configs = await ErpConfig.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, configs: configs.map((c) => c.toPublic()) });
  } catch (err) {
    console.error("ERP list error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch ERP configurations." });
  }
});

// ── POST /api/erp ─────────────────────────────────────────────────────────────
// Create a new ERP connection by exchanging credentials for a token immediately.
// Credentials are discarded after the token exchange — never stored.
router.post(
  "/",
  erpAuthLimiter,
  authenticateToken,
  requireMfaForErp,
  async (req, res) => {
    noStore(res);
    const sourceIp = getSourceIp(req);
    const userEmail = await getUserEmail(req.user.id);

    const { system, label, tenantUrl, tokenUrl, scope, clientId, erpUsername, erpPassword } =
      req.body;

    if (!system || !tenantUrl || !erpUsername || !erpPassword) {
      return res.status(400).json({
        success: false,
        error: "system, tenantUrl, erpUsername, and erpPassword are required."
      });
    }
    if (!connectors[system]) {
      return res.status(400).json({ success: false, error: `Unsupported ERP system: ${system}` });
    }
    if (!tokenUrl) {
      return res.status(400).json({ success: false, error: "tokenUrl is required." });
    }

    const connector = connectors[system];
    const auditBase = { userId: req.user.id, userEmail, system, sourceIp };

    // Exchange credentials for token — credentials are NEVER saved after this call
    let tokenData;
    try {
      tokenData = await connector.getTokenFromCredentials({
        tokenUrl,
        clientId: clientId || "",
        username: erpUsername,
        password: erpPassword,
        scope:    scope || ""
      });
    } catch (tokenErr) {
      erpAudit("ERP_CONNECT_FAILURE", {
        ...auditBase,
        success: false,
        failureReason: tokenErr.message
      });
      return res.status(502).json({
        success: false,
        error: `ERP authentication failed: ${tokenErr.message}`
      });
    }

    // Persist only the encrypted token — never the credentials
    const cfg = new ErpConfig({
      system,
      label:    label || system,
      tenantUrl,
      tokenUrl,
      scope:    scope || "",
      clientId: clientId || "",
      createdBy: req.user.id
    });
    cfg.setAccessToken(tokenData.accessToken, tokenData.expiresIn);
    await cfg.save();

    erpAudit("ERP_CONNECT_SUCCESS", {
      ...auditBase,
      configId:       cfg._id,
      success:        true,
      tokenExpiresAt: cfg.tokenExpiresAt?.toISOString()
    });

    res.status(201).json({ success: true, config: cfg.toPublic() });
  }
);

// ── POST /api/erp/:id/reconnect ───────────────────────────────────────────────
// Re-authenticate an expired connection with fresh ERP credentials.
// NIST IA-11: Re-Authentication required after token expiry.
// NIST AC-7:  Check lockout status before allowing any auth attempt.
router.post(
  "/:id/reconnect",
  erpAuthLimiter,
  authenticateToken,
  requireMfaForErp,
  async (req, res) => {
    noStore(res);
    const sourceIp = getSourceIp(req);
    const userEmail = await getUserEmail(req.user.id);

    try {
      const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
      if (!cfg) {
        return res.status(404).json({ success: false, error: "ERP configuration not found." });
      }

      const auditBase = {
        userId: req.user.id, userEmail,
        configId: cfg._id, system: cfg.system, sourceIp
      };

      // NIST AC-7: Reject if currently locked out
      if (cfg.isAuthLocked()) {
        const unlockAt = cfg.failedAuthLockedUntil?.toLocaleTimeString() ?? "soon";
        erpAudit("ERP_AUTH_LOCKED", {
          ...auditBase,
          success: false,
          failureReason: `Locked after ${MAX_FAILED_AUTH_ATTEMPTS} failed attempts`,
          attemptCount: cfg.failedAuthAttempts
        });
        return res.status(423).json({
          success: false,
          error: `This connection is temporarily locked after ${MAX_FAILED_AUTH_ATTEMPTS} failed ` +
                 `attempts. Try again after ${unlockAt} (${AUTH_LOCKOUT_MINUTES}-minute lockout — NIST AC-7).`,
          lockedUntil: cfg.failedAuthLockedUntil
        });
      }

      const { erpUsername, erpPassword } = req.body;
      if (!erpUsername || !erpPassword) {
        return res.status(400).json({
          success: false,
          error: "erpUsername and erpPassword are required to reconnect."
        });
      }

      const connector = connectors[cfg.system];

      let tokenData;
      try {
        tokenData = await connector.getTokenFromCredentials({
          tokenUrl: cfg.tokenUrl,
          clientId: cfg.clientId || "",
          username: erpUsername,
          password: erpPassword,
          scope:    cfg.scope || ""
        });
      } catch (tokenErr) {
        // NIST AC-7: Track the failure and potentially lock
        cfg.recordFailedAuth();
        await cfg.save();

        erpAudit("ERP_RECONNECT_FAILURE", {
          ...auditBase,
          success:       false,
          failureReason: tokenErr.message,
          attemptCount:  cfg.failedAuthAttempts
        });

        const remaining = MAX_FAILED_AUTH_ATTEMPTS - cfg.failedAuthAttempts;
        const lockMsg = remaining <= 0
          ? ` Connection locked for ${AUTH_LOCKOUT_MINUTES} minutes (NIST AC-7).`
          : ` ${remaining} attempt(s) remaining before lockout.`;

        return res.status(502).json({
          success: false,
          error: `ERP authentication failed: ${tokenErr.message}.${lockMsg}`,
          attemptsRemaining: Math.max(0, remaining),
          lockedUntil: cfg.failedAuthLockedUntil ?? null
        });
      }

      // Success — setAccessToken resets failed-attempt counter (AC-7)
      cfg.setAccessToken(tokenData.accessToken, tokenData.expiresIn);
      cfg.lastTestAt = new Date();
      cfg.lastTestStatus = "ok";
      cfg.lastTestMessage = `Reconnected. Token valid until ${cfg.tokenExpiresAt?.toLocaleString()}.`;
      await cfg.save();

      erpAudit("ERP_RECONNECT_SUCCESS", {
        ...auditBase,
        success:        true,
        tokenExpiresAt: cfg.tokenExpiresAt?.toISOString()
      });

      res.json({ success: true, config: cfg.toPublic() });
    } catch (err) {
      console.error("ERP reconnect error:", err.message);
      res.status(500).json({ success: false, error: "Failed to reconnect ERP." });
    }
  }
);

// ── DELETE /api/erp/:id ───────────────────────────────────────────────────────
// NIST AC-12: Session/token revocation — logged as a termination event.
router.delete("/:id", authenticateToken, async (req, res) => {
  noStore(res);
  const sourceIp  = getSourceIp(req);
  const userEmail = await getUserEmail(req.user.id);

  try {
    const cfg = await ErpConfig.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    erpAudit("ERP_CONFIG_DELETED", {
      userId: req.user.id, userEmail,
      configId: cfg._id, system: cfg.system, sourceIp,
      success: true
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ERP delete error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete ERP configuration." });
  }
});

// ── POST /api/erp/:id/test ────────────────────────────────────────────────────
// Test connectivity using the stored token — no credentials needed.
router.post("/:id/test", authenticateToken, async (req, res) => {
  noStore(res);
  const sourceIp  = getSourceIp(req);
  const userEmail = await getUserEmail(req.user.id);

  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const auditBase = {
      userId: req.user.id, userEmail,
      configId: cfg._id, system: cfg.system,
      sourceIp, endpoint: "test"
    };

    const token = await resolveToken(cfg, auditBase);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token has expired. Please reconnect with your ERP credentials.",
        tokenExpired: true
      });
    }

    const connector = connectors[cfg.system];
    await connector.testConnection(cfg.tenantUrl, token);

    cfg.lastTestAt      = new Date();
    cfg.lastTestStatus  = "ok";
    cfg.lastTestMessage = `Connection OK. Token valid until ${cfg.tokenExpiresAt?.toLocaleString()}.`;
    await cfg.save();

    erpAudit("ERP_TEST_SUCCESS", { ...auditBase, success: true });
    res.json({ success: true, message: cfg.lastTestMessage });
  } catch (err) {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id }).catch(() => null);
    if (cfg) {
      cfg.lastTestAt      = new Date();
      cfg.lastTestStatus  = "error";
      cfg.lastTestMessage = err.message;
      await cfg.save().catch(() => {});
      erpAudit("ERP_TEST_FAILURE", {
        userId: req.user.id, userEmail, configId: cfg._id, system: cfg.system,
        sourceIp, endpoint: "test", success: false, failureReason: err.message
      });
    }
    console.error("ERP test error:", err.message);
    res.status(502).json({ success: false, error: `ERP connection test failed: ${err.message}` });
  }
});

// ── Pagination helper ─────────────────────────────────────────────────────────

function buildPaginationOpts(query) {
  const pageSize = Number(query.pageSize) || 50;
  const page     = Number(query.page) || 1;
  const skip     = (page - 1) * pageSize;
  return { page, pageSize, top: pageSize, skip, offset: skip, limit: pageSize };
}

// Helper: resolve token or send 401 and return null
async function getValidToken(cfg, res, auditCtx) {
  const token = await resolveToken(cfg, auditCtx);
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Access token has expired. Please reconnect with your ERP credentials.",
      tokenExpired: true
    });
    return null;
  }
  return token;
}

// ── GET /api/erp/:id/purchase-orders ─────────────────────────────────────────
router.get("/:id/purchase-orders", authenticateToken, async (req, res) => {
  noStore(res);
  const sourceIp  = getSourceIp(req);
  const userEmail = await getUserEmail(req.user.id);

  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const auditCtx = {
      userId: req.user.id, userEmail, configId: cfg._id,
      system: cfg.system, sourceIp, endpoint: "purchase-orders"
    };
    const token = await getValidToken(cfg, res, auditCtx);
    if (!token) return;

    const data = await connectors[cfg.system].getPurchaseOrders(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      status: req.query.status || undefined
    });

    erpAudit("ERP_DATA_ACCESS", { ...auditCtx, success: true });
    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP purchase-orders error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

// ── GET /api/erp/:id/suppliers ────────────────────────────────────────────────
router.get("/:id/suppliers", authenticateToken, async (req, res) => {
  noStore(res);
  const sourceIp  = getSourceIp(req);
  const userEmail = await getUserEmail(req.user.id);

  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const auditCtx = {
      userId: req.user.id, userEmail, configId: cfg._id,
      system: cfg.system, sourceIp, endpoint: "suppliers"
    };
    const token = await getValidToken(cfg, res, auditCtx);
    if (!token) return;

    const data = await connectors[cfg.system].getSuppliers(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      search: req.query.search || undefined
    });

    erpAudit("ERP_DATA_ACCESS", { ...auditCtx, success: true });
    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP suppliers error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

// ── GET /api/erp/:id/invoices ─────────────────────────────────────────────────
router.get("/:id/invoices", authenticateToken, async (req, res) => {
  noStore(res);
  const sourceIp  = getSourceIp(req);
  const userEmail = await getUserEmail(req.user.id);

  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const auditCtx = {
      userId: req.user.id, userEmail, configId: cfg._id,
      system: cfg.system, sourceIp, endpoint: "invoices"
    };
    const token = await getValidToken(cfg, res, auditCtx);
    if (!token) return;

    const data = await connectors[cfg.system].getInvoices(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      status:   req.query.status   || undefined,
      fromDate: req.query.fromDate || undefined,
      toDate:   req.query.toDate   || undefined
    });

    erpAudit("ERP_DATA_ACCESS", { ...auditCtx, success: true });
    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP invoices error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

export default router;

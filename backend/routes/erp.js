/**
 * ERP Connector Routes  –  /api/erp
 *
 * Security model:
 *   - Users provide their ERP username + password ONCE at connect/reconnect time.
 *   - The server immediately exchanges those credentials for a short-lived access token.
 *   - Credentials are NEVER written to the database or any log.
 *   - Only the resulting encrypted access token is persisted.
 *   - When the token expires users must reconnect (re-enter their ERP credentials).
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.js";
import ErpConfig from "../models/ErpConfig.js";
import User from "../models/User.js";
import * as infor from "../connectors/infor.js";
import * as oracle from "../connectors/oracle.js";
import * as sap from "../connectors/sap.js";

const router = express.Router();

const erpWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please wait before trying again." }
});

// Map system identifier → connector module
const connectors = { infor_syteline: infor, oracle, sap };

/**
 * Retrieve the valid stored access token for a config.
 * Returns null (with connectionStatus set to "expired") if the token has expired.
 * No credential exchange happens here — reconnect is handled by a dedicated endpoint.
 */
async function resolveToken(cfg) {
  if (cfg.isTokenValid()) {
    return cfg.getAccessToken();
  }
  // Mark as expired if a token was previously stored
  if (cfg.accessTokenEnc) {
    cfg.connectionStatus = "expired";
    await cfg.save();
  }
  return null;
}

/**
 * Middleware: require recent MFA verification if the user has MFA enabled.
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

/** Log ERP data access with MFA status (non-blocking) */
async function logErpAccess(userId, configId, endpoint) {
  try {
    const user = await User.findById(userId).select("mfaEnabled email");
    const mfaStatus = user?.mfaEnabled ? "mfa-enabled" : "mfa-disabled";
    console.log(
      `[ERP Access] user=${userId} email=${user?.email} config=${configId} ` +
      `endpoint=${endpoint} mfaStatus=${mfaStatus} ts=${new Date().toISOString()}`
    );
  } catch {
    // Non-blocking
  }
}

// ── GET /api/erp ──────────────────────────────────────────────────────────────
// List all ERP configs for the current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const configs = await ErpConfig.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, configs: configs.map((c) => c.toPublic()) });
  } catch (err) {
    console.error("ERP list error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch ERP configurations." });
  }
});

// ── POST /api/erp ─────────────────────────────────────────────────────────────
// Create a new ERP connection.
// Accepts the user's ERP username + password, immediately exchanges them for a
// token, stores ONLY the encrypted token, and discards the credentials.
router.post("/", erpWriteLimiter, authenticateToken, requireMfaForErp, async (req, res) => {
  try {
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

    // Exchange credentials for token — credentials are NEVER saved after this call
    let tokenData;
    try {
      tokenData = await connector.getTokenFromCredentials({
        tokenUrl,
        clientId: clientId || "",
        username: erpUsername,
        password: erpPassword,
        scope: scope || ""
      });
    } catch (tokenErr) {
      return res.status(502).json({
        success: false,
        error: `ERP authentication failed: ${tokenErr.message}`
      });
    }

    // Persist only the encrypted token — never the credentials
    const cfg = new ErpConfig({
      system,
      label: label || system,
      tenantUrl,
      tokenUrl,
      scope: scope || "",
      clientId: clientId || "",
      createdBy: req.user.id
    });
    cfg.setAccessToken(tokenData.accessToken, tokenData.expiresIn);
    await cfg.save();

    console.log(
      `[ERP Create] user=${req.user.id} system=${system} config=${cfg._id} ` +
      `tokenExpiresAt=${cfg.tokenExpiresAt?.toISOString()} ts=${new Date().toISOString()}`
    );

    res.status(201).json({ success: true, config: cfg.toPublic() });
  } catch (err) {
    console.error("ERP create error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create ERP configuration." });
  }
});

// ── POST /api/erp/:id/reconnect ───────────────────────────────────────────────
// Re-authenticate an existing connection with fresh ERP credentials.
// Used when a token has expired. Credentials are never stored.
router.post("/:id/reconnect", erpWriteLimiter, authenticateToken, requireMfaForErp, async (req, res) => {
  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

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
        scope: cfg.scope || ""
      });
    } catch (tokenErr) {
      cfg.connectionStatus = "error";
      cfg.lastTestAt = new Date();
      cfg.lastTestStatus = "error";
      cfg.lastTestMessage = `Reconnect failed: ${tokenErr.message}`;
      await cfg.save();
      return res.status(502).json({
        success: false,
        error: `ERP authentication failed: ${tokenErr.message}`
      });
    }

    cfg.setAccessToken(tokenData.accessToken, tokenData.expiresIn);
    cfg.lastTestAt = new Date();
    cfg.lastTestStatus = "ok";
    cfg.lastTestMessage = `Reconnected. Token valid until ${cfg.tokenExpiresAt?.toLocaleString()}.`;
    await cfg.save();

    console.log(
      `[ERP Reconnect] user=${req.user.id} config=${cfg._id} ` +
      `tokenExpiresAt=${cfg.tokenExpiresAt?.toISOString()} ts=${new Date().toISOString()}`
    );

    res.json({ success: true, config: cfg.toPublic() });
  } catch (err) {
    console.error("ERP reconnect error:", err.message);
    res.status(500).json({ success: false, error: "Failed to reconnect ERP." });
  }
});

// ── DELETE /api/erp/:id ───────────────────────────────────────────────────────
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const cfg = await ErpConfig.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("ERP delete error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete ERP configuration." });
  }
});

// ── POST /api/erp/:id/test ────────────────────────────────────────────────────
// Test connectivity using the stored access token (no credentials needed).
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const token = await resolveToken(cfg);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token has expired. Please reconnect with your ERP credentials.",
        tokenExpired: true
      });
    }

    const connector = connectors[cfg.system];
    await connector.testConnection(cfg.tenantUrl, token);

    cfg.lastTestAt = new Date();
    cfg.lastTestStatus = "ok";
    cfg.lastTestMessage = `Connection OK. Token valid until ${cfg.tokenExpiresAt?.toLocaleString()}.`;
    await cfg.save();

    res.json({ success: true, message: cfg.lastTestMessage });
  } catch (err) {
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id }).catch(() => null);
    if (cfg) {
      cfg.lastTestAt = new Date();
      cfg.lastTestStatus = "error";
      cfg.lastTestMessage = err.message;
      await cfg.save().catch(() => {});
    }
    console.error("ERP test error:", err.message);
    res.status(502).json({ success: false, error: `ERP connection test failed: ${err.message}` });
  }
});

// Build a normalised pagination options object from query parameters.
function buildPaginationOpts(query) {
  const pageSize = Number(query.pageSize) || 50;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, top: pageSize, skip, offset: skip, limit: pageSize };
}

// Helper: get and validate stored token for data endpoints
async function getValidToken(cfg, res) {
  const token = await resolveToken(cfg);
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
  try {
    logErpAccess(req.user.id, req.params.id, "purchase-orders");
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const token = await getValidToken(cfg, res);
    if (!token) return;

    const connector = connectors[cfg.system];
    const data = await connector.getPurchaseOrders(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      status: req.query.status || undefined
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP purchase-orders error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

// ── GET /api/erp/:id/suppliers ────────────────────────────────────────────────
router.get("/:id/suppliers", authenticateToken, async (req, res) => {
  try {
    logErpAccess(req.user.id, req.params.id, "suppliers");
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const token = await getValidToken(cfg, res);
    if (!token) return;

    const connector = connectors[cfg.system];
    const data = await connector.getSuppliers(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      search: req.query.search || undefined
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP suppliers error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

// ── GET /api/erp/:id/invoices ─────────────────────────────────────────────────
router.get("/:id/invoices", authenticateToken, async (req, res) => {
  try {
    logErpAccess(req.user.id, req.params.id, "invoices");
    const cfg = await ErpConfig.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!cfg) return res.status(404).json({ success: false, error: "ERP configuration not found." });

    const token = await getValidToken(cfg, res);
    if (!token) return;

    const connector = connectors[cfg.system];
    const data = await connector.getInvoices(cfg.tenantUrl, token, {
      ...buildPaginationOpts(req.query),
      status: req.query.status || undefined,
      fromDate: req.query.fromDate || undefined,
      toDate: req.query.toDate || undefined
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("ERP invoices error:", err.message);
    res.status(502).json({ success: false, error: `ERP error: ${err.message}` });
  }
});

export default router;

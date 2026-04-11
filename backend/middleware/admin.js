/**
 * Admin Middleware
 *
 * requireAdmin — verifies the authenticated user has role "admin".
 *                Logs PERMISSION_DENIED via the central audit logger on failure.
 * auditLog     — logs every completed admin request as ADMIN_ACTION.
 *
 * Must be used AFTER authenticateToken.
 */

import User from "../models/User.js";
import { audit, getIp, EVENT } from "../services/auditLogger.js";

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    const user = await User.findById(req.user.id).select("role isActive email name");

    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, error: "Account not found or inactive." });
    }

    if (user.role !== "admin") {
      audit(EVENT.PERMISSION_DENIED, {
        userId:  req.user.id,
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: {
          requiredRoles: ["admin"],
          userRole:      user.role,
          reason:        "Admin access required"
        }
      });

      return res.status(403).json({ success: false, error: "Admin access required." });
    }

    // Attach full admin user to request for downstream use
    req.adminUser = user;
    req.authUser  = user;  // consistent alias used by audit helpers
    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    res.status(500).json({ success: false, error: "Authorization check failed." });
  }
}

/**
 * Logs every admin request as an ADMIN_ACTION record after the response is sent.
 * Call AFTER requireAdmin so req.adminUser is available.
 * Sensitive body fields (password, token, etc.) are stripped by the audit logger.
 */
export function auditLog(req, res, next) {
  const startTime = req.startTime ?? Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const { method, originalUrl, body, params, query } = req;

    audit(EVENT.ADMIN_ACTION, {
      userId:     req.authUser?._id?.toString() ?? req.adminUser?._id?.toString() ?? req.user?.id,
      email:      req.authUser?.email ?? req.adminUser?.email ?? "unknown",
      ip:         req.clientIp ?? getIp(req),
      route:      originalUrl,
      method,
      success:    res.statusCode < 400,
      durationMs,
      details: {
        status: res.statusCode,
        params,
        query,
        body    // sanitized inside audit()
      }
    });
  });

  next();
}

export default { requireAdmin, auditLog };

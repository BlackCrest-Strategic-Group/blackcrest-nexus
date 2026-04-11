/**
 * Authentication & Authorization Middleware
 *
 * authenticateToken  — verifies the Bearer JWT and populates req.user
 * requireRole        — role-based access control; logs PERMISSION_DENIED on failure
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { audit, getIp, EVENT } from "../services/auditLogger.js";

// ── JWT verification ──────────────────────────────────────────────────────────

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token required." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, error: "Server configuration error." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired." });
    }
    return res.status(403).json({ success: false, error: "Invalid token." });
  }
}

// ── Role-based access control ─────────────────────────────────────────────────

/**
 * Middleware factory that restricts access to users holding at least one of
 * the specified roles. Must be used AFTER authenticateToken.
 *
 * Usage:
 *   router.get("/admin-only", authenticateToken, requireRole("admin"), handler)
 *   router.get("/ops-or-exec", authenticateToken, requireRole("ops", "exec"), handler)
 *
 * On failure:
 *   - Returns HTTP 403
 *   - Emits a PERMISSION_DENIED audit record
 *
 * On success:
 *   - Attaches the full user document to req.authUser for downstream use
 */
export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    let user;
    try {
      user = await User.findById(req.user.id).select("role isActive email name");
    } catch (err) {
      console.error("requireRole DB error:", err.message);
      return res.status(500).json({ success: false, error: "Authorization check failed." });
    }

    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, error: "Account not found or inactive." });
    }

    if (!roles.includes(user.role)) {
      audit(EVENT.PERMISSION_DENIED, {
        userId:  req.user.id,
        email:   user.email,
        ip:      req.clientIp ?? getIp(req),
        route:   req.originalUrl,
        method:  req.method,
        success: false,
        details: {
          requiredRoles: roles,
          userRole:      user.role,
          reason:        "Insufficient role"
        }
      });

      return res.status(403).json({
        success: false,
        error:   `Access denied. Required role: ${roles.join(" or ")}.`
      });
    }

    // Attach full user document for downstream handlers
    req.authUser = user;
    next();
  };
}

/**
 * requireAuth is the canonical named export for route protection.
 * It is identical to authenticateToken — exported under both names so
 * routes can use whichever reads more clearly at the call site:
 *
 *   router.get("/me",    requireAuth, handler)
 *   router.get("/admin", requireAuth, requireRole("admin"), handler)
 */
export const requireAuth = authenticateToken;

export default authenticateToken;

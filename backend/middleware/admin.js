import { authenticateToken } from "./auth.js";

/**
 * Admin-only middleware.
 *
 * 1. Validates the JWT (reuses authenticateToken).
 * 2. Checks that the decoded token belongs to an admin user.
 * 3. Logs every admin request for audit purposes.
 */
export function requireAdmin(req, res, next) {
  // First validate the JWT and attach req.user
  authenticateToken(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required." });
    }

    // Audit log — write to console (can be forwarded to Datadog / log aggregator)
    console.log(
      JSON.stringify({
        type: "ADMIN_ACTION",
        adminId: req.user.id,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        timestamp: new Date().toISOString()
      })
    );

    next();
  });
}

export default requireAdmin;

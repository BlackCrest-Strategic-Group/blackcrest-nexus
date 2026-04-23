import { writeSignedAuditLog } from "../services/auditTrailService.js";

const TRACKED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditTrail(req, res, next) {
  if (!TRACKED_METHODS.has(req.method) || !req.path.startsWith("/api")) {
    return next();
  }

  const startedAt = Date.now();
  res.on("finish", async () => {
    try {
      await writeSignedAuditLog({
        tenantId: req.user?.tenant?._id,
        actorUserId: req.user?._id,
        action: `${req.method} ${req.path}`,
        entityType: "api_request",
        entityId: req.requestId || `${Date.now()}`,
        metadata: {
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
          requestId: req.requestId,
          ip: req.ip
        }
      });
    } catch (error) {
      console.warn(`[audit] failed to persist signed log: ${error.message}`);
    }
  });

  return next();
}

export default auditTrail;

import crypto from "crypto";
import AuditLog from "../models/AuditLog.js";

function signPayload(payload) {
  const key = process.env.AUDIT_LOG_SIGNING_KEY || "dev-audit-signing-key";
  return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

export async function writeSignedAuditLog({ tenantId, actorUserId, action, entityType, entityId, metadata = {} }) {
  if (!tenantId) return null;

  const previous = await AuditLog.findOne({ tenantId }).sort({ createdAt: -1 }).lean();
  const prevSignature = previous?.signature || "";
  const payload = JSON.stringify({ tenantId, actorUserId, action, entityType, entityId, metadata, prevSignature });
  const signature = signPayload(payload);

  return AuditLog.create({
    tenantId,
    actorUserId,
    action,
    entityType,
    entityId,
    metadata,
    prevSignature,
    signature
  });
}

export default writeSignedAuditLog;

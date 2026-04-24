import mongoose from "mongoose";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import AIBriefing from "../models/AIBriefing.js";
import Alert from "../models/Alert.js";
import AuditLog from "../models/AuditLog.js";
import DashboardView from "../models/DashboardView.js";
import Notification from "../models/Notification.js";
import ProcurementAnalysis from "../models/ProcurementAnalysis.js";
import ProcurementTask from "../models/ProcurementTask.js";
import WorkflowRun from "../models/WorkflowRun.js";
import { loadEnv } from "../../backend/utils/loadEnv.js";

loadEnv();

const MODELS = [
  { name: "AIBriefing", model: AIBriefing, userField: "userId" },
  { name: "Alert", model: Alert, userField: "userId" },
  { name: "AuditLog", model: AuditLog, userField: "actorUserId" },
  { name: "DashboardView", model: DashboardView, userField: "userId" },
  { name: "Notification", model: Notification, userField: "userId" },
  { name: "ProcurementAnalysis", model: ProcurementAnalysis, userField: "userId" },
  { name: "ProcurementTask", model: ProcurementTask, userField: "assignedTo" },
  { name: "WorkflowRun", model: WorkflowRun, userField: "userId" }
];

async function resolveTenantIdFromUserId(userId) {
  if (!userId) return null;
  const user = await User.findById(userId).select("tenantId").lean();
  return user?.tenantId || null;
}

async function migrateModel({ name, model, userField }) {
  const docs = await model.find({ tenantId: { $exists: false } }).select(`_id ${userField}`).lean();
  let updated = 0;

  for (const doc of docs) {
    const tenantId = await resolveTenantIdFromUserId(doc[userField]);
    if (!tenantId) continue;
    await model.updateOne({ _id: doc._id }, { $set: { tenantId } });
    updated += 1;
  }

  console.log(`[tenant-migrate] ${name}: ${updated}/${docs.length} documents updated.`);
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const tenantCount = await Tenant.countDocuments();
  console.log(`[tenant-migrate] connected. tenants=${tenantCount}`);

  for (const entry of MODELS) {
    await migrateModel(entry);
    await entry.model.syncIndexes();
  }

  await mongoose.disconnect();
  console.log("[tenant-migrate] completed.");
}

main().catch((error) => {
  console.error("[tenant-migrate] failed:", error);
  process.exit(1);
});

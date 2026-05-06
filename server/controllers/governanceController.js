import AuditLog from '../models/AuditLog.js';
import { writeSignedAuditLog } from '../services/auditTrailService.js';
import {
  buildNistCsfDashboard,
  buildSecurityCommandCenterSnapshot,
  buildSoc2Dashboard,
  complianceReadiness,
  defaultWorkflow,
  governanceDashboardSnapshot
} from '../services/governanceService.js';

export async function getGovernanceDashboard(req, res) {
  const snapshot = governanceDashboardSnapshot();
  const workflow = defaultWorkflow();
  return res.json({
    dashboard: snapshot,
    securityCommandCenter: buildSecurityCommandCenterSnapshot(),
    soc2: buildSoc2Dashboard(),
    nistCsf: buildNistCsfDashboard(),
    tenantIsolation: {
      architecture: 'Tenant-scoped data access with tenantId guardrails across models and workflows.',
      status: 'Foundation Active'
    },
    accessControl: {
      rbac: 'Enabled',
      modulePermissions: 'Enabled',
      approvalGates: 'Enabled',
      adminOverrideLogging: 'Enabled'
    },
    incidentResponse: {
      incidentLogging: 'Enabled',
      escalationWorkflows: 'Enabled',
      adminNotifications: 'Enabled',
      securityAlertCenter: 'Enabled'
    },
    complianceReadiness: complianceReadiness(),
    disclaimer: 'Do not upload classified, export-controlled, or proprietary customer data without authorization.',
    workflow,
    approvalQueue: [
      { id: 'apr-1001', type: 'Bid/No-Bid', status: 'Pending Review', confidence: 'Moderate Confidence', owner: 'Procurement Specialist' },
      { id: 'apr-1002', type: 'Supplier Risk Analysis', status: 'Requires Secondary Review', confidence: 'Low Confidence', owner: 'Compliance Officer' }
    ]
  });
}

export async function getAuditLogs(req, res) {
  const tenantId = req.user?.tenant?._id;
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const q = String(req.query.q || '').trim();
  const type = String(req.query.type || '').trim().toLowerCase();
  const allowedActions = ['upload', 'download', 'export', 'proposal', 'email', 'approval'];
  const filter = tenantId ? { tenantId } : null;

  if (filter && type && allowedActions.includes(type)) {
    filter.action = { $regex: type, $options: 'i' };
  }
  if (filter && q) {
    filter.$or = [
      { action: { $regex: q, $options: 'i' } },
      { entityType: { $regex: q, $options: 'i' } },
      { entityId: { $regex: q, $options: 'i' } }
    ];
  }

  const logs = filter ? await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean() : [];
  const normalizedLogs = logs.map((log) => ({
    ...log,
    securityContext: {
      ip: log.metadata?.ip || log.metadata?.requestIp || 'unknown',
      timestamp: log.createdAt,
      userRole: log.metadata?.role || log.metadata?.actorRole || 'unknown',
      actionType: log.action,
      affectedModule: log.entityType
    }
  }));

  return res.json({ logs: normalizedLogs, supportedTypes: allowedActions });
}

export async function submitWorkflowAction(req, res) {
  const { workflowId, action, reason = '', recommendationSnapshot = {}, confidenceScore = null } = req.body;
  const tenantId = req.user?.tenant?._id;

  await writeSignedAuditLog({
    tenantId,
    actorUserId: req.user?._id,
    action: `governance.workflow.${String(action || 'unknown').toLowerCase().replace(/\s+/g, '_')}`,
    entityType: 'governance_workflow',
    entityId: workflowId || `workflow-${Date.now()}`,
    metadata: {
      user: req.user?.email,
      role: req.user?.role,
      reason,
      recommendationSnapshot,
      confidenceScore,
      timestamp: new Date().toISOString()
    }
  });

  return res.json({ success: true, status: 'logged', workflowId, action });
}

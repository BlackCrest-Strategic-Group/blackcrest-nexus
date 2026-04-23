import AuditLog from '../models/AuditLog.js';
import { writeSignedAuditLog } from '../services/auditTrailService.js';
import { defaultWorkflow, governanceDashboardSnapshot } from '../services/governanceService.js';

export async function getGovernanceDashboard(req, res) {
  const snapshot = governanceDashboardSnapshot();
  const workflow = defaultWorkflow();
  return res.json({
    dashboard: snapshot,
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
  const logs = tenantId
    ? await AuditLog.find({ tenantId }).sort({ createdAt: -1 }).limit(limit).lean()
    : [];
  return res.json({ logs });
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

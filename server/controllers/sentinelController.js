import { buildSentinelOverview, getSentinelAlertDetail } from '../services/sentinelData.js';
import { writeSignedAuditLog } from '../services/auditTrailService.js';

function applyAlertFilters(alerts, query) {
  return alerts.filter((alert) => {
    if (query.severity && alert.type.toLowerCase() !== String(query.severity).toLowerCase()) return false;
    if (query.status && alert.status.toLowerCase() !== String(query.status).toLowerCase()) return false;
    if (query.category && alert.category.toLowerCase() !== String(query.category).toLowerCase()) return false;
    return true;
  });
}

export function getSentinelOverview(req, res) {
  const roleGroup = req.query.roleGroup || req.user?.roleGroup || 'executive';
  const overview = buildSentinelOverview({ roleGroup });
  const filteredAlerts = applyAlertFilters(overview.alerts, req.query);
  return res.json({ ...overview, alerts: filteredAlerts, roleGroup });
}

export async function getSentinelAlertDrilldown(req, res) {
  const roleGroup = req.query.roleGroup || req.user?.roleGroup || 'executive';
  const detail = getSentinelAlertDetail(req.params.alertId, { roleGroup });
  if (!detail) return res.status(404).json({ message: 'Alert not found' });

  await writeSignedAuditLog({
    tenantId: req.user?.tenantId,
    actorUserId: req.user?._id,
    action: `GET /api/sentinel/alerts/${req.params.alertId}`,
    entityType: 'alert_interaction',
    entityId: req.params.alertId,
    metadata: {
      roleGroup,
      alertType: detail.type,
      severity: detail.severity,
      auditReference: detail.auditReference
    }
  });

  return res.json(detail);
}

export function getSentinelSuppliers(req, res) {
  const roleGroup = req.query.roleGroup || req.user?.roleGroup || 'executive';
  const { suppliers } = buildSentinelOverview({ roleGroup });
  const q = (req.query.q || '').trim().toLowerCase();
  const risk = (req.query.risk || '').trim().toLowerCase();
  const filtered = suppliers.filter((s) => {
    if (q && !`${s.name} ${s.category} ${s.region}`.toLowerCase().includes(q)) return false;
    if (risk && s.riskLevel.toLowerCase() !== risk) return false;
    return true;
  });
  return res.json({ suppliers: filtered });
}

export function getSentinelOpportunities(req, res) {
  const roleGroup = req.query.roleGroup || req.user?.roleGroup || 'executive';
  const { opportunities } = buildSentinelOverview({ roleGroup });
  const naics = (req.query.naics || '').trim();
  const pursuit = (req.query.pursuit || '').trim().toLowerCase();
  const filtered = opportunities.filter((opp) => {
    if (naics && !opp.naics.includes(naics)) return false;
    if (pursuit && opp.pursuit.toLowerCase() !== pursuit) return false;
    return true;
  });
  return res.json({ opportunities: filtered });
}

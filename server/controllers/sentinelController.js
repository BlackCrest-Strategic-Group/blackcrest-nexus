import { buildSentinelOverview } from '../services/sentinelData.js';

function applyAlertFilters(alerts, query) {
  return alerts.filter((alert) => {
    if (query.severity && alert.type.toLowerCase() !== String(query.severity).toLowerCase()) return false;
    if (query.status && alert.status.toLowerCase() !== String(query.status).toLowerCase()) return false;
    if (query.category && alert.category.toLowerCase() !== String(query.category).toLowerCase()) return false;
    return true;
  });
}

export function getSentinelOverview(req, res) {
  const overview = buildSentinelOverview();
  const filteredAlerts = applyAlertFilters(overview.alerts, req.query);
  return res.json({ ...overview, alerts: filteredAlerts });
}

export function getSentinelSuppliers(req, res) {
  const { suppliers } = buildSentinelOverview();
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
  const { opportunities } = buildSentinelOverview();
  const naics = (req.query.naics || '').trim();
  const pursuit = (req.query.pursuit || '').trim().toLowerCase();
  const filtered = opportunities.filter((opp) => {
    if (naics && !opp.naics.includes(naics)) return false;
    if (pursuit && opp.pursuit.toLowerCase() !== pursuit) return false;
    return true;
  });
  return res.json({ opportunities: filtered });
}

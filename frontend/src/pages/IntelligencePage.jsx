import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const formatUsd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

const ROLE_VIEW_OPTIONS = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'manager', label: 'Procurement Manager' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
  { value: 'admin', label: 'Admin' }
];

function AlertDrilldownModal({ alert, onClose }) {
  if (!alert) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(5, 18, 34, 0.65)', zIndex: 40, padding: 16, overflow: 'auto' }}>
      <article className="card" style={{ maxWidth: 980, margin: '24px auto', padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0 }}>{alert.title}</h3>
            <p style={{ margin: '4px 0 0 0' }}>Severity: <strong>{alert.severity}</strong> · Category: {alert.type}</p>
          </div>
          <button className="btn" type="button" onClick={onClose}>Close</button>
        </header>

        <div className="grid two" style={{ marginTop: 14 }}>
          <section>
            <h4>Operational Cause</h4>
            <p>{alert.rootCause}</p>
            <h4>AI Reasoning Summary</h4>
            <p>{alert.aiReasoningSummary}</p>
            <h4>Recommended Actions</h4>
            <ul>{(alert.recommendedActions || []).map((action) => <li key={action}>{action}</li>)}</ul>
          </section>

          <section>
            <h4>Business Impact</h4>
            <p>Weekly: {formatUsd(alert.financialImpact?.estimatedWeeklyUSD)} · Monthly: {formatUsd(alert.financialImpact?.estimatedMonthlyUSD)} · Annualized: {formatUsd(alert.financialImpact?.annualizedUSD)}</p>
            <h4>Source Signals</h4>
            <ul>{(alert.sourceSignals || []).map((signal) => <li key={signal.signal}>{signal.signal} ({signal.value}) · {signal.source}</li>)}</ul>
            <h4>Affected Scope</h4>
            <p>Suppliers: {(alert.affectedEntities?.suppliers || []).join(', ') || 'N/A'}</p>
            <p>Programs: {(alert.affectedEntities?.programs || []).join(', ') || 'N/A'}</p>
            <p>Categories: {(alert.affectedEntities?.categories || []).join(', ') || 'N/A'}</p>
            <p>Confidence Score: <strong>{Math.round((alert.confidenceScore || 0) * 100)}%</strong></p>
            <p>Audit Ref: {alert.auditReference} · Classification: {alert.dataClassification}</p>
          </section>
        </div>

        <section style={{ marginTop: 12 }}>
          <h4>Timeline / History</h4>
          <ul>
            {(alert.timeline || []).map((event) => (
              <li key={`${event.at}-${event.status}`}>
                {new Date(event.at).toLocaleString()} · {event.status} · {event.note}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}

export default function IntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [roleGroup, setRoleGroup] = useState('executive');
  const [overview, setOverview] = useState(null);
  const [drilldownAlert, setDrilldownAlert] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState('');

  async function openAlert(alertId) {
    const { data } = await api.get(`/api/sentinel/alerts/${alertId}`, { params: { roleGroup } });
    setDrilldownAlert(data);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/sentinel/overview', { params: { ...(severity ? { severity } : {}), roleGroup } });
        if (mounted) {
          setOverview(data);
          setSelectedAlertId((current) => {
            if (current && data.alerts?.some((alert) => alert.id === current)) return current;
            return data.alerts?.[0]?.id || '';
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [severity, roleGroup]);

  const topRiskCells = useMemo(() => (overview?.riskHeatmap || []).slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 4), [overview]);

  const selectedAlert = useMemo(() => {
    if (!overview?.alerts?.length) return null;
    return overview.alerts.find((alert) => alert.id === selectedAlertId) || overview.alerts[0];
  }, [overview, selectedAlertId]);
  const selectedAlertDetail = useMemo(() => {
    if (drilldownAlert?.id === selectedAlertId) return drilldownAlert;
    return selectedAlert;
  }, [drilldownAlert, selectedAlertId, selectedAlert]);

  if (loading) return <section><div className="page-header"><h1>Loading Sentinel command center…</h1></div></section>;

  return (
    <section>
      <SeoHead title="Sentinel Intelligence | BlackCrest OS" description="AI Procurement Intelligence & Risk Monitoring Engine" canonicalPath="/intelligence" />
      <div className="page-header">
        <h1>Procurement Operational Command Center</h1>
        <p>Sentinel provides read-only intelligence. All recommendations require human approval before action.</p>
      </div>

      <article className="card" style={{ marginBottom: 16 }}>
        <strong>Sentinel Governance Layer</strong>
        <p style={{ margin: '8px 0' }}>Read-only intelligence layer · No autonomous PO creation · No customer-data shared model training · Governance-first operations.</p>
        <p style={{ margin: 0 }}>Data classifications: {(overview?.sentinel?.dataClassificationSupported || []).join(', ')}.</p>
      </article>

      <div className="grid four">
        <article className="card"><p className="metric-label">Procurement Health</p><h3>{overview?.kpis?.procurementHealthScore}/100</h3></article>
        <article className="card"><p className="metric-label">Active Alerts</p><h3>{overview?.kpis?.activeAlerts}</h3></article>
        <article className="card"><p className="metric-label">High Risk Suppliers</p><h3>{overview?.kpis?.highRiskSuppliers}</h3></article>
        <article className="card"><p className="metric-label">Annualized Margin Leakage</p><h3>{formatUsd(overview?.kpis?.marginLeakageAnnualizedUSD)}</h3></article>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3>Executive Alert Center</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="input" value={roleGroup} onChange={(e) => setRoleGroup(e.target.value)} style={{ maxWidth: 240 }}>
              {ROLE_VIEW_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label} View</option>)}
            </select>
            <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ maxWidth: 240 }}>
              <option value="">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Informational">Informational</option>
            </select>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Role priorities: {(overview?.rolePriorities || []).join(', ')}.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', marginTop: 12 }}>
            <thead><tr><th>Severity</th><th>Alert</th><th>Category</th><th>Status</th><th>Owner</th><th>Confidence</th></tr></thead>
            <tbody>
              {(overview?.alerts || []).map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => {
                    setSelectedAlertId(alert.id);
                    openAlert(alert.id);
                  }}
                  style={{ cursor: 'pointer', background: selectedAlert?.id === alert.id ? 'rgba(83, 137, 255, 0.16)' : 'transparent' }}
                >
                  <td>{alert.type}</td>
                  <td><strong>{alert.alertType || 'Alert'}</strong><br /><span>{alert.title}</span></td>
                  <td>{alert.category}</td>
                  <td>{alert.status}</td>
                  <td>{alert.owner}</td>
                  <td>{Math.round((alert.confidenceScore || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      <article className="card" style={{ marginTop: 16 }}>
        <h3>Alert Root-Cause Drilldown</h3>
        {!selectedAlertDetail ? (
          <p>No alert selected.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <p><strong>{selectedAlertDetail.alertType || selectedAlertDetail.type || 'Alert'}</strong> · {selectedAlertDetail.title}</p>
            <p><strong>What happened:</strong> {selectedAlertDetail.happened || selectedAlertDetail.summary || 'Sentinel detected a threshold breach requiring review.'}</p>
            <p><strong>What is driving it:</strong> {selectedAlertDetail.driver || selectedAlertDetail.aiReasoningSummary || 'Signal trend analysis indicates elevated procurement risk.'}</p>
            <p>
              <strong>Financial impact:</strong>{' '}
              {typeof selectedAlertDetail.financialImpact === 'string'
                ? selectedAlertDetail.financialImpact
                : `Weekly ${formatUsd(selectedAlertDetail.financialImpact?.estimatedWeeklyUSD)} · Monthly ${formatUsd(selectedAlertDetail.financialImpact?.estimatedMonthlyUSD)} · Annualized ${formatUsd(selectedAlertDetail.financialImpact?.annualizedUSD)}`}
            </p>
            <p><strong>Root cause:</strong> {selectedAlertDetail.rootCause}</p>
            <p>
              <strong>Related entities:</strong>
              {' '}Supplier: {selectedAlertDetail.relatedEntities?.supplier || selectedAlertDetail.affectedEntities?.suppliers?.[0] || 'N/A'} ·
              {' '}PO: {selectedAlertDetail.relatedEntities?.po || 'N/A'} ·
              {' '}Category: {selectedAlertDetail.relatedEntities?.category || selectedAlertDetail.affectedEntities?.categories?.[0] || 'N/A'} ·
              {' '}Contract: {selectedAlertDetail.relatedEntities?.contract || 'N/A'} ·
              {' '}Buyer: {selectedAlertDetail.relatedEntities?.buyer || selectedAlertDetail.owner || 'N/A'} ·
              {' '}Item: {selectedAlertDetail.relatedEntities?.item || 'N/A'}
            </p>
            <div>
              <strong>Evidence:</strong>
              <ul style={{ marginTop: 6 }}>
                {(selectedAlertDetail.evidence || selectedAlertDetail.sourceSignals?.map((signal) => `${signal.signal}: ${signal.value}`) || []).map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
            <p><strong>Recommended corrective action:</strong> {selectedAlertDetail.recommendedAction || selectedAlertDetail.recommendedActions?.[0] || 'Route to responsible leader for remediation plan approval.'}</p>
            <p><strong>Priority level:</strong> {selectedAlertDetail.priorityLevel || selectedAlertDetail.severity || selectedAlertDetail.type}</p>
            <p><strong>Owner / responsible role:</strong> {selectedAlertDetail.responsibleRole || selectedAlertDetail.owner || 'Procurement leadership'}</p>
            <p><strong>Next best action:</strong> {selectedAlertDetail.nextBestAction || selectedAlertDetail.recommendedActions?.[1] || 'Review alert details and assign owner with due date.'}</p>
          </div>
        )}
      </article>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card">
          <h3>Executive Narrative Engine</h3>
          <ul>{(overview?.executiveNarratives || []).map((line) => <li key={line}>{line}</li>)}</ul>
        </article>
        <article className="card">
          <h3>Category Risk Heatmap (Top 4)</h3>
          <ul>{topRiskCells.map((cell) => <li key={cell.category}>{cell.category}: risk {cell.riskScore}, concentration {cell.supplierConcentration}%</li>)}</ul>
        </article>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card">
          <h3>Margin Leak Detection Engine</h3>
          <p>Weekly: {formatUsd(overview?.marginLeakage?.weeklyLeakageEstimate)} · Monthly: {formatUsd(overview?.marginLeakage?.monthlyLeakageEstimate)}</p>
          <h4>Top Drivers</h4>
          <ul>{(overview?.marginLeakage?.topDrivers || []).map((driver) => <li key={driver.driver}>{driver.driver}: {formatUsd(driver.estimatedLoss)}</li>)}</ul>
        </article>
        <article className="card">
          <h3>Supplier Risk Radar</h3>
          <ul>
            {(overview?.supplierRiskRadar || []).slice(0, 4).map((supplier) => (
              <li key={supplier.supplierId}>{supplier.supplierName}: health {supplier.supplierHealthScore}/100 · {supplier.trendDirection}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Sentinel Audit Activity Feed</h3>
        <ul>
          {(overview?.activityFeed || []).slice(0, 6).map((event) => (
            <li key={event.id}>{new Date(event.timestamp).toLocaleString()} · {event.eventType} · {event.detail} · {event.auditReference}</li>
          ))}
        </ul>
      </article>

      <AlertDrilldownModal alert={drilldownAlert} onClose={() => setDrilldownAlert(null)} />
    </section>
  );
}

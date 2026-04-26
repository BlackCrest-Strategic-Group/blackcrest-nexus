import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const formatUsd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

export default function IntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [overview, setOverview] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/sentinel/overview', { params: severity ? { severity } : {} });
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
  }, [severity]);

  const topRiskCells = useMemo(() => (overview?.riskHeatmap || []).slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 4), [overview]);

  const selectedAlert = useMemo(() => {
    if (!overview?.alerts?.length) return null;
    return overview.alerts.find((alert) => alert.id === selectedAlertId) || overview.alerts[0];
  }, [overview, selectedAlertId]);

  if (loading) return <section><div className="page-header"><h1>Loading Sentinel command center…</h1></div></section>;

  return (
    <section>
      <SeoHead title="Sentinel Intelligence | BlackCrest OS" description="AI Procurement Intelligence & Risk Monitoring Engine" canonicalPath="/intelligence" />
      <div className="page-header">
        <h1>Sentinel Procurement Command Center</h1>
        <p>Live procurement risk monitoring, signal detection, and executive guidance.</p>
      </div>

      <div className="grid four">
        <article className="card"><p className="metric-label">Procurement Health</p><h3>{overview?.kpis?.procurementHealthScore}/100</h3></article>
        <article className="card"><p className="metric-label">Active Alerts</p><h3>{overview?.kpis?.activeAlerts}</h3></article>
        <article className="card"><p className="metric-label">High Risk Suppliers</p><h3>{overview?.kpis?.highRiskSuppliers}</h3></article>
        <article className="card"><p className="metric-label">Projected Savings</p><h3>{formatUsd(overview?.kpis?.projectedSavingsUSD)}</h3></article>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3>Executive Alert Center</h3>
          <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ maxWidth: 240 }}>
            <option value="">All severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Informational">Informational</option>
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', marginTop: 12 }}>
            <thead><tr><th>Severity</th><th>Alert</th><th>Category</th><th>Status</th><th>Owner</th></tr></thead>
            <tbody>
              {(overview?.alerts || []).map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  style={{ cursor: 'pointer', background: selectedAlert?.id === alert.id ? 'rgba(83, 137, 255, 0.16)' : 'transparent' }}
                >
                  <td>{alert.type}</td>
                  <td><strong>{alert.alertType || 'Alert'}</strong><br /><span>{alert.title}</span></td>
                  <td>{alert.category}</td>
                  <td>{alert.status}</td>
                  <td>{alert.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      <article className="card" style={{ marginTop: 16 }}>
        <h3>Alert Root-Cause Drilldown</h3>
        {!selectedAlert ? (
          <p>No alert selected.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <p><strong>{selectedAlert.alertType}</strong> · {selectedAlert.title}</p>
            <p><strong>What happened:</strong> {selectedAlert.happened}</p>
            <p><strong>What is driving it:</strong> {selectedAlert.driver}</p>
            <p><strong>Financial impact:</strong> {selectedAlert.financialImpact}</p>
            <p><strong>Root cause:</strong> {selectedAlert.rootCause}</p>
            <p>
              <strong>Related entities:</strong>
              {' '}Supplier: {selectedAlert.relatedEntities?.supplier} ·
              {' '}PO: {selectedAlert.relatedEntities?.po} ·
              {' '}Category: {selectedAlert.relatedEntities?.category} ·
              {' '}Contract: {selectedAlert.relatedEntities?.contract} ·
              {' '}Buyer: {selectedAlert.relatedEntities?.buyer} ·
              {' '}Item: {selectedAlert.relatedEntities?.item}
            </p>
            <div>
              <strong>Evidence:</strong>
              <ul style={{ marginTop: 6 }}>
                {(selectedAlert.evidence || []).map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
            <p><strong>Recommended corrective action:</strong> {selectedAlert.recommendedAction}</p>
            <p><strong>Priority level:</strong> {selectedAlert.priorityLevel}</p>
            <p><strong>Owner / responsible role:</strong> {selectedAlert.responsibleRole}</p>
            <p><strong>Next best action:</strong> {selectedAlert.nextBestAction}</p>
          </div>
        )}
      </article>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card">
          <h3>Signals Engine</h3>
          <ul>{(overview?.signals || []).map((s) => <li key={s.id}>{s.label} · {s.severity} · {s.delta}</li>)}</ul>
        </article>
        <article className="card">
          <h3>Category Risk Heatmap (Top 4)</h3>
          <ul>{topRiskCells.map((cell) => <li key={cell.category}>{cell.category}: risk {cell.riskScore}, concentration {cell.supplierConcentration}%</li>)}</ul>
        </article>
      </div>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Operational Recommendations</h3>
        <ul>{(overview?.recommendations || []).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
    </section>
  );
}

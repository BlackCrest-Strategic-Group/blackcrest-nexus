import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const formatUsd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

export default function IntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/sentinel/overview', { params: severity ? { severity } : {} });
        if (mounted) setOverview(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [severity]);

  const topRiskCells = useMemo(() => (overview?.riskHeatmap || []).slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 4), [overview]);

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
                <tr key={alert.id}><td>{alert.type}</td><td>{alert.title}</td><td>{alert.category}</td><td>{alert.status}</td><td>{alert.owner}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

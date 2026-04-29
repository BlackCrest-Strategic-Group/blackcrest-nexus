import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const formatUsd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
const pct = (v) => (v === null || v === undefined ? 'N/A' : `${Math.round(v * 100)}%`);

const ROLE_VIEW_OPTIONS = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'manager', label: 'Procurement Manager' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
  { value: 'admin', label: 'Admin' }
];

const DEMO_CSV = `supplier,item,category,poNumber,quantity,unitCost,sellPrice,orderDate,dueDate,receiptDate
ABC Metals,Aluminum Housing,Raw Materials,PO-1001,100,42,48,2026-03-01,2026-03-15,2026-03-18
ABC Metals,Bracket Assembly,Raw Materials,PO-1002,75,31,38,2026-03-04,2026-03-20,2026-03-20
Nova Circuits,Controller Board,Electronics,PO-1003,50,210,245,2026-03-05,2026-03-22,2026-03-29
Helios Gas Systems,Valve Assembly,Industrial Gases,PO-1004,40,122,138,2026-03-07,2026-03-18,2026-03-24
Boxline Partners,Corrugate Sheet,Packaging,PO-1005,1200,1.82,2.05,2026-03-02,2026-03-12,2026-03-12`;

function AlertDrilldownModal({ alert, onClose }) {
  if (!alert) return null;

  const sourceSignals = Array.isArray(alert.sourceSignals)
    ? alert.sourceSignals
    : Object.entries(alert.sourceSignals || {}).map(([signal, value]) => ({ signal, value }));

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(5, 18, 34, 0.65)', zIndex: 40, padding: 16, overflow: 'auto' }}>
      <article className="card" style={{ maxWidth: 980, margin: '24px auto', padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0 }}>{alert.title}</h3>
            <p style={{ margin: '4px 0 0 0' }}>Severity: <strong>{alert.severity || alert.type}</strong> · Category: {alert.category}</p>
          </div>
          <button className="btn" type="button" onClick={onClose}>Close</button>
        </header>

        <div className="grid two" style={{ marginTop: 14 }}>
          <section>
            <h4>Operational Cause</h4>
            <p>{alert.rootCause || alert.driver || 'Operational signal breach detected.'}</p>
            <h4>Recommended Action</h4>
            <p>{alert.recommendedAction || alert.recommendedActions?.[0] || 'Assign an owner and validate the underlying records.'}</p>
          </section>

          <section>
            <h4>Business Impact</h4>
            <p>{typeof alert.financialImpact === 'number' ? formatUsd(alert.financialImpact) : alert.financialImpact || 'Impact requires source data.'}</p>
            <h4>Source Signals</h4>
            <ul>{sourceSignals.map((signal) => <li key={signal.signal}>{signal.signal}: {String(signal.value)}</li>)}</ul>
            <p>Confidence Score: <strong>{Math.round((alert.confidenceScore || 0) * 100)}%</strong></p>
          </section>
        </div>
      </article>
    </div>
  );
}

function LiveUploadPanel({ onAnalysis }) {
  const [csv, setCsv] = useState(DEMO_CSV);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    setUploading(true);
    setError('');
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await api.post('/api/procurement-live/analyze-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        onAnalysis(response.data.analysis);
      } else {
        response = await api.post('/api/procurement-live/analyze-upload', { csv });
        onAnalysis(response.data.analysis);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to analyze procurement data.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <article className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Live Procurement Intelligence Upload</h3>
          <p className="muted" style={{ margin: 0 }}>Upload CSV procurement data or run the included sample to generate live margin, supplier, and delivery intelligence.</p>
        </div>
        <button className="btn primary" type="button" onClick={analyze} disabled={uploading}>{uploading ? 'Analyzing…' : 'Run Live Analysis'}</button>
      </div>
      <div className="grid two" style={{ marginTop: 12 }}>
        <label>
          <span className="metric-label">CSV Upload</span>
          <input className="input" type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <label>
          <span className="metric-label">Paste CSV / Sample Data</span>
          <textarea className="input" rows={6} value={csv} onChange={(e) => { setCsv(e.target.value); setFile(null); }} />
        </label>
      </div>
      {error ? <p style={{ color: '#b42318', marginTop: 8 }}>{error}</p> : null}
    </article>
  );
}

export default function IntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [roleGroup, setRoleGroup] = useState('executive');
  const [overview, setOverview] = useState(null);
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [drilldownAlert, setDrilldownAlert] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState('');
  const [loadError, setLoadError] = useState('');

  async function openAlert(alertId) {
    const liveAlert = liveAnalysis?.alerts?.find((alert) => alert.id === alertId);
    if (liveAlert) {
      setDrilldownAlert(liveAlert);
      return;
    }
    try {
      const { data } = await api.get(`/api/sentinel/alerts/${alertId}`, { params: { roleGroup } });
      setDrilldownAlert(data);
    } catch {
      const fallback = overview?.alerts?.find((alert) => alert.id === alertId);
      setDrilldownAlert(fallback || null);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await api.get('/api/sentinel/overview', { params: { ...(severity ? { severity } : {}), roleGroup } });
        if (mounted) {
          setOverview(data);
          setSelectedAlertId((current) => current || data.alerts?.[0]?.id || '');
        }
      } catch (err) {
        if (mounted) setLoadError(err.response?.data?.message || 'Sentinel overview unavailable. Live upload workflow remains available.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [severity, roleGroup]);

  const commandKpis = liveAnalysis?.kpis || overview?.kpis || {};
  const alerts = liveAnalysis?.alerts?.length ? liveAnalysis.alerts : (overview?.alerts || []);
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) || alerts[0] || null;

  const topRiskCells = useMemo(() => {
    if (liveAnalysis?.categorySpend?.length) return liveAnalysis.categorySpend.slice(0, 4).map((c) => ({ category: c.category, riskScore: Math.round(c.spend / Math.max(1, commandKpis.totalSpend || c.spend) * 100), supplierConcentration: c.lineCount }));
    return (overview?.riskHeatmap || []).slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  }, [overview, liveAnalysis, commandKpis.totalSpend]);

  if (loading) return <section><div className="page-header"><h1>Loading command center…</h1></div></section>;

  return (
    <section>
      <SeoHead title="Global Procurement Intelligence | BlackCrest AI" description="Upload-driven procurement intelligence for supplier risk, margin recovery, and governance-safe operations." canonicalPath="/intelligence" />
      <div className="page-header">
        <h1>Global Procurement Intelligence Command Center</h1>
        <p>Live upload-driven analytics for margin recovery, supplier risk, delivery exposure, and executive procurement actions.</p>
      </div>

      {loadError ? <article className="card" style={{ marginBottom: 16 }}><strong>Notice:</strong> {loadError}</article> : null}
      <LiveUploadPanel onAnalysis={(analysis) => { setLiveAnalysis(analysis); setSelectedAlertId(analysis.alerts?.[0]?.id || ''); }} />

      <article className="card" style={{ marginBottom: 16 }}>
        <strong>Enterprise Governance Posture</strong>
        <p style={{ margin: '8px 0' }}>Read-only intelligence layer · Human approval before procurement action · No autonomous PO creation · Customer-controlled data ingestion.</p>
        <p style={{ margin: 0 }}>Platform mode: <strong>{liveAnalysis ? 'Live procurement upload intelligence' : 'Sentinel governed fallback'}</strong></p>
      </article>

      <div className="grid four">
        <article className="card"><p className="metric-label">Rows / Health</p><h3>{commandKpis.rowCount || commandKpis.procurementHealthScore || 0}{commandKpis.procurementHealthScore ? '/100' : ''}</h3></article>
        <article className="card"><p className="metric-label">Active Alerts</p><h3>{commandKpis.activeAlertCount ?? commandKpis.activeAlerts ?? alerts.length}</h3></article>
        <article className="card"><p className="metric-label">Supplier Count / Risk</p><h3>{commandKpis.supplierCount || commandKpis.highRiskSuppliers || 0}</h3></article>
        <article className="card"><p className="metric-label">Annualized Recovery</p><h3>{formatUsd(commandKpis.projectedAnnualRecoveryUSD || overview?.kpis?.marginLeakageAnnualizedUSD)}</h3></article>
      </div>

      {liveAnalysis?.executiveSummary ? <article className="card" style={{ marginTop: 16 }}><h3>Executive Summary</h3><p>{liveAnalysis.executiveSummary}</p></article> : null}

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
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', marginTop: 12 }}>
            <thead><tr><th>Severity</th><th>Alert</th><th>Category</th><th>Status</th><th>Impact</th><th>Confidence</th></tr></thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} onClick={() => { setSelectedAlertId(alert.id); openAlert(alert.id); }} style={{ cursor: 'pointer', background: selectedAlert?.id === alert.id ? 'rgba(83, 137, 255, 0.16)' : 'transparent' }}>
                  <td>{alert.type || alert.severity}</td>
                  <td><strong>{alert.alertType || alert.category || 'Alert'}</strong><br /><span>{alert.title}</span></td>
                  <td>{alert.category}</td>
                  <td>{alert.status || 'Open'}</td>
                  <td>{typeof alert.financialImpact === 'number' ? formatUsd(alert.financialImpact) : alert.owner || 'Review'}</td>
                  <td>{Math.round((alert.confidenceScore || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Alert Root-Cause Drilldown</h3>
        {!selectedAlert ? <p>No alert selected.</p> : (
          <div style={{ display: 'grid', gap: 10 }}>
            <p><strong>{selectedAlert.alertType || selectedAlert.category || selectedAlert.type}</strong> · {selectedAlert.title}</p>
            <p><strong>What is driving it:</strong> {selectedAlert.rootCause || selectedAlert.driver || selectedAlert.aiReasoningSummary || 'Signal trend analysis indicates elevated procurement risk.'}</p>
            <p><strong>Financial impact:</strong> {typeof selectedAlert.financialImpact === 'number' ? formatUsd(selectedAlert.financialImpact) : selectedAlert.financialImpact || 'Impact requires source records.'}</p>
            <p><strong>Recommended corrective action:</strong> {selectedAlert.recommendedAction || selectedAlert.recommendedActions?.[0] || 'Route to responsible leader for remediation plan approval.'}</p>
          </div>
        )}
      </article>

      {liveAnalysis?.supplierScorecards?.length ? (
        <div className="grid two" style={{ marginTop: 16 }}>
          <article className="card">
            <h3>Supplier Risk Scorecards</h3>
            <ul>{liveAnalysis.supplierScorecards.slice(0, 6).map((s) => <li key={s.supplier}>{s.supplier}: {s.riskLevel} risk · spend {formatUsd(s.spend)} · OTD {pct(s.onTimeDelivery)}</li>)}</ul>
          </article>
          <article className="card">
            <h3>Margin Recovery Engine</h3>
            <p>Low-margin lines: {liveAnalysis.marginLeakage?.lowMarginLineCount || 0}</p>
            <p>Annualized recovery opportunity: {formatUsd(liveAnalysis.marginLeakage?.annualizedRecoveryOpportunity)}</p>
            <ul>{(liveAnalysis.marginLeakage?.topDrivers || []).slice(0, 5).map((driver) => <li key={`${driver.supplier}-${driver.item}-${driver.poNumber}`}>{driver.supplier} · {driver.item}: {formatUsd(driver.estimatedRecovery)}</li>)}</ul>
          </article>
        </div>
      ) : (
        <div className="grid two" style={{ marginTop: 16 }}>
          <article className="card">
            <h3>Executive Narrative Engine</h3>
            <ul>{(overview?.executiveNarratives || []).map((line) => <li key={line}>{line}</li>)}</ul>
          </article>
          <article className="card">
            <h3>Category Risk Heatmap</h3>
            <ul>{topRiskCells.map((cell) => <li key={cell.category}>{cell.category}: risk {cell.riskScore}, concentration {cell.supplierConcentration}%</li>)}</ul>
          </article>
        </div>
      )}

      <AlertDrilldownModal alert={drilldownAlert} onClose={() => setDrilldownAlert(null)} />
    </section>
  );
}

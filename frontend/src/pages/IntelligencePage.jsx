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

const ENTERPRISE_PROCUREMENT_ANALYTICS = {
  executiveSummary: { keyRisks: 4, estimatedSavingsUSD: 4870000, supplierHealthScore: 76, operationalEfficiencyScore: 82 },
  analytics: {
    marginLeakage: { leakageRate: 0.067, annualLeakageUSD: 2120000, topLeakCategory: 'Electronics Assemblies' },
    supplierPerformance: { onTimeDelivery: 0.89, qualityAcceptance: 0.94, strategicSupplierCoverage: 0.71 },
    sourcingEfficiency: { avgSourcingCycleDays: 34, eventWinRate: 0.63, competitiveBidRatio: 0.77 },
    operationalBottlenecks: [
      { area: 'Contract Approval', delayDays: 6.4, severity: 'High' },
      { area: 'Inbound QA Sign-off', delayDays: 4.1, severity: 'Medium' },
      { area: 'PO Change Orders', delayDays: 3.8, severity: 'High' }
    ],
    procurementCycle: [
      { stage: 'Requisition', days: 5 },
      { stage: 'RFx & Evaluation', days: 11 },
      { stage: 'Negotiation', days: 7 },
      { stage: 'Approval', days: 6 },
      { stage: 'PO Release', days: 5 }
    ],
    spendAnomalies: [
      { category: 'Precision Castings', variancePct: 0.23, exposureUSD: 640000 },
      { category: 'Industrial Gases', variancePct: 0.18, exposureUSD: 390000 },
      { category: 'Packaging Film', variancePct: 0.14, exposureUSD: 240000 }
    ]
  },
  insights: {
    costSavings: [
      'Renegotiate top 12 MRO SKUs indexed above market to unlock $1.1M annual savings.',
      'Shift 18% of spot-buy volume into catalog contracts for $740K savings.'
    ],
    supplierConsolidation: 'Consolidate tier-2 electrical suppliers from 14 to 9 to reduce admin overhead and improve leverage.',
    riskAlerts: [
      'Single-source dependency exceeds 45% in avionics connectors.',
      'Late-delivery risk elevated for two critical suppliers supporting Q3 programs.'
    ],
    sourcingOptimization: 'Deploy dual-track RFx process for high-volatility categories to cut sourcing cycle time by 19%.'
  },
  visualizations: {
    spendHeatmap: {
      rows: ['North America', 'EMEA', 'APAC'],
      cols: ['Raw Materials', 'Electronics', 'MRO', 'Logistics'],
      values: [[72, 88, 54, 43], [51, 62, 48, 58], [67, 79, 38, 64]]
    },
    supplierRiskMap: [
      { supplier: 'Nova Circuits', impact: 86, risk: 74 },
      { supplier: 'Helios Gas Systems', impact: 72, risk: 68 },
      { supplier: 'Atlas Machining', impact: 65, risk: 49 },
      { supplier: 'Boxline Partners', impact: 58, risk: 33 }
    ],
    savingsTrend: [
      { month: 'Jan', usd: 420000 }, { month: 'Feb', usd: 510000 }, { month: 'Mar', usd: 690000 }, { month: 'Apr', usd: 780000 }, { month: 'May', usd: 920000 }
    ],
    procurementVelocity: [
      { lane: 'Direct Materials', eventsPerMonth: 14 },
      { lane: 'Indirect / MRO', eventsPerMonth: 21 },
      { lane: 'Services', eventsPerMonth: 9 }
    ]
  }
};

const DEMO_CSV = `supplier,item,category,poNumber,quantity,unitCost,sellPrice,orderDate,dueDate,receiptDate\nABC Metals,Aluminum Housing,Raw Materials,PO-1001,100,42,48,2026-03-01,2026-03-15,2026-03-18`;

function LiveUploadPanel({ onAnalysis }) { const [csv, setCsv] = useState(DEMO_CSV); const [uploading, setUploading] = useState(false); async function analyze() { setUploading(true); try { const response = await api.post('/api/procurement-live/analyze-upload', { csv }); onAnalysis(response.data.analysis); } finally { setUploading(false); } } return <article className="card" style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><div><h3 style={{ marginBottom: 4 }}>Live Procurement Intelligence Upload</h3><p className="muted" style={{ margin: 0 }}>Upload or run sample data to blend real-time signals into Truth Serum Analytics.</p></div><button className="btn primary" type="button" onClick={analyze} disabled={uploading}>{uploading ? 'Analyzing…' : 'Run Live Analysis'}</button></div><label><span className="metric-label">Paste CSV / Sample Data</span><textarea className="input" rows={5} value={csv} onChange={(e) => setCsv(e.target.value)} /></label></article>; }



const WAR_ROOM_METRICS = [
  {
    id: 'totalSpend',
    label: 'Total Spend',
    value: '$2.9M',
    source: 'SOURCE: ERP + AP Ledger (Apr 2026)',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Atlas Machining', 'Direct Materials', 'INV-48112', 'Program build release', '$1.12M'],
      ['Helios Circuits', 'Electronics', 'INV-77831', 'Controller board replenishment', '$860K'],
      ['Nova Polymers', 'MRO', 'INV-55209', 'Plant maintenance kits', '$540K'],
      ['BlueLine Logistics', 'Logistics', 'INV-19300', 'Expedite freight surcharge', '$380K'],
    ],
  },
  {
    id: 'marginLeakage',
    label: 'Margin Leakage',
    value: '$434K',
    source: 'SOURCE: AP Exception Monitor + Contract Guardrails',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Helios Circuits', 'Electronics', 'INV-77831', 'Overbilling', '$156K'],
      ['BlueLine Logistics', 'Logistics', 'INV-19300', 'Duplicate invoice', '$98K'],
      ['Rapid Facility Works', 'MRO', 'INV-44018', 'Maverick spend', '$112K'],
      ['Atlas Machining', 'Direct Materials', 'INV-48177', 'Overbilling', '$68K'],
    ],
  },
  {
    id: 'riskReduction',
    label: 'Risk Reduction',
    value: '31%',
    source: 'SOURCE: Supplier Risk Radar + QA Audit Trail',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Northline Metals', 'Direct Materials', 'INV-47220', 'High → Low after alternate source qualification', 'N/A'],
      ['Sierra Components', 'Electronics', 'INV-73410', 'High → Low after OTD recovery + PPAP closure', 'N/A'],
      ['Atlas Freight', 'Logistics', 'INV-19043', 'High → Low after route stabilization and SLA controls', 'N/A'],
    ],
  },
  {
    id: 'activeSuppliers',
    label: 'Active Suppliers',
    value: '40',
    source: 'SOURCE: Supplier Master + Truth Serum Scoring',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Nova Circuits', 'Electronics', 'INV-73140', 'Risk: Low · Truth Serum 91', 'N/A'],
      ['Atlas Machining', 'Direct Materials', 'INV-48112', 'Risk: Medium · Truth Serum 82', 'N/A'],
      ['BlueLine Logistics', 'Logistics', 'INV-19300', 'Risk: Medium · Truth Serum 78', 'N/A'],
      ['Rapid Facility Works', 'MRO', 'INV-44018', 'Risk: High · Truth Serum 61', 'N/A'],
    ],
  },
  {
    id: 'openPos',
    label: 'Open POs',
    value: '29',
    source: 'SOURCE: PO Control Tower',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Atlas Machining', 'Direct Materials', 'PO-90217', 'Status: Approved / Pending shipment', '$402K'],
      ['Helios Circuits', 'Electronics', 'PO-90402', 'Status: Partial receipt', '$318K'],
      ['BlueLine Logistics', 'Logistics', 'PO-90141', 'Status: Delayed at terminal', '$89K'],
      ['Rapid Facility Works', 'MRO', 'PO-90355', 'Status: Awaiting compliance release', '$61K'],
    ],
  },
  {
    id: 'complianceScore',
    label: 'Compliance Score',
    value: '89%',
    source: 'SOURCE: Sentinel Compliance Controls',
    columns: ['Supplier', 'Category', 'Invoice #', 'Reason', 'Amount'],
    rows: [
      ['Atlas Machining', 'Direct Materials', 'INV-48112', 'Compliant: Contract pricing + approvals', 'N/A'],
      ['Nova Circuits', 'Electronics', 'INV-73140', 'Compliant: Doc pack complete', 'N/A'],
      ['BlueLine Logistics', 'Logistics', 'INV-19300', 'Flagged: Accessorial charge mismatch', 'N/A'],
      ['Rapid Facility Works', 'MRO', 'INV-44018', 'Flagged: Off-contract maverick spend', 'N/A'],
    ],
  },
];

function WarRoomMetricCard({ metric, expanded, onToggle }) {
  return (
    <article className="card" style={{ background: '#0f172a', borderColor: '#334155' }}>
      <button type="button" onClick={onToggle} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0, color: 'inherit', padding: 0, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p className="metric-label">{metric.label}</p>
            <h3>{metric.value}</h3>
          </div>
          <span aria-hidden="true" style={{ color: '#94a3b8', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>
      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid #334155', paddingTop: 12 }}>
          <p style={{ margin: '0 0 10px 0', fontSize: 11, letterSpacing: '0.08em', color: '#22d3ee', fontWeight: 700 }}>{metric.source}</p>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>{metric.columns.map((col) => <th key={`${metric.id}-${col}`}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {metric.rows.map((row, idx) => (
                  <tr key={`${metric.id}-${idx}`}>{row.map((cell, cidx) => <td key={`${metric.id}-${idx}-${cidx}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}

export default function IntelligencePage() {
  const [roleGroup, setRoleGroup] = useState('executive');
  const [overview, setOverview] = useState(null);
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [expandedMetricId, setExpandedMetricId] = useState(null);

  useEffect(() => { (async () => { try { const { data } = await api.get('/api/sentinel/overview', { params: { roleGroup } }); setOverview(data); } catch { setOverview(null); } })(); }, [roleGroup]);

  const commandKpis = liveAnalysis?.kpis || overview?.kpis || {};
  const seeded = ENTERPRISE_PROCUREMENT_ANALYTICS;
  const savingsMax = Math.max(...seeded.visualizations.savingsTrend.map((m) => m.usd));

  return (
    <section>
      <SeoHead title="Truth Serum Analytics | BlackCrest Nexus" description="Advanced procurement analytics dashboard with enterprise visual intelligence and AI recommendations." canonicalPath="/intelligence" />
      <div className="page-header"><h1>Truth Serum Analytics Module</h1><p>Advanced enterprise procurement analytics with AI-style insights, seeded with realistic operational data.</p></div>
      <LiveUploadPanel onAnalysis={setLiveAnalysis} />

      <section className="card" style={{ marginBottom: 16, background: '#020617', borderColor: '#334155' }}>
        <h3 style={{ marginBottom: 12 }}>War Room Dashboard</h3>
        <div className="grid three" style={{ gap: 12 }}>
          {WAR_ROOM_METRICS.map((metric) => (
            <WarRoomMetricCard
              key={metric.id}
              metric={metric}
              expanded={expandedMetricId === metric.id}
              onToggle={() => setExpandedMetricId((current) => (current === metric.id ? null : metric.id))}
            />
          ))}
        </div>
      </section>

      <div className="grid four">
        <article className="card"><p className="metric-label">Key Risks</p><h3>{seeded.executiveSummary.keyRisks}</h3></article>
        <article className="card"><p className="metric-label">Estimated Savings</p><h3>{formatUsd(seeded.executiveSummary.estimatedSavingsUSD)}</h3></article>
        <article className="card"><p className="metric-label">Supplier Health</p><h3>{seeded.executiveSummary.supplierHealthScore}/100</h3></article>
        <article className="card"><p className="metric-label">Operational Efficiency</p><h3>{seeded.executiveSummary.operationalEfficiencyScore}/100</h3></article>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card"><h3>Procurement Analytics Sections</h3><ul>
          <li>Margin leakage: {pct(seeded.analytics.marginLeakage.leakageRate)} · {formatUsd(seeded.analytics.marginLeakage.annualLeakageUSD)} leakage</li>
          <li>Supplier performance: OTD {pct(seeded.analytics.supplierPerformance.onTimeDelivery)} · Quality {pct(seeded.analytics.supplierPerformance.qualityAcceptance)}</li>
          <li>Sourcing efficiency: {seeded.analytics.sourcingEfficiency.avgSourcingCycleDays} day cycle · Win rate {pct(seeded.analytics.sourcingEfficiency.eventWinRate)}</li>
          <li>Operational bottlenecks: {seeded.analytics.operationalBottlenecks.map((b) => `${b.area} (${b.delayDays}d)`).join(', ')}</li>
          <li>Procurement cycle analysis: {seeded.analytics.procurementCycle.reduce((s, c) => s + c.days, 0)} days end-to-end</li>
          <li>Spend anomalies: {seeded.analytics.spendAnomalies.length} high-variance categories flagged</li>
        </ul></article>

        <article className="card"><h3>AI-Style Insights Engine</h3><ul>
          {seeded.insights.costSavings.map((i) => <li key={i}><strong>Cost savings recommendation:</strong> {i}</li>)}
          <li><strong>Supplier consolidation suggestion:</strong> {seeded.insights.supplierConsolidation}</li>
          {seeded.insights.riskAlerts.map((r) => <li key={r}><strong>Risk alert:</strong> {r}</li>)}
          <li><strong>Sourcing optimization recommendation:</strong> {seeded.insights.sourcingOptimization}</li>
        </ul></article>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card"><h3>Spend Heatmap</h3>{seeded.visualizations.spendHeatmap.rows.map((r, i) => <div key={r} style={{ marginBottom: 8 }}><p className="metric-label" style={{ marginBottom: 4 }}>{r}</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>{seeded.visualizations.spendHeatmap.values[i].map((v, idx) => <div key={`${r}-${idx}`} style={{ background: `rgba(37,99,235,${0.2 + (v / 120)})`, color: '#fff', textAlign: 'center', borderRadius: 8, padding: '8px 4px' }}>{v}</div>)}</div></div>)}</article>
        <article className="card"><h3>Supplier Risk Map</h3>{seeded.visualizations.supplierRiskMap.map((s) => <div key={s.supplier} style={{ marginBottom: 10 }}><p style={{ margin: '0 0 4px 0' }}>{s.supplier}</p><div style={{ height: 10, borderRadius: 999, background: '#1f2937' }}><div style={{ width: `${s.risk}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }} /></div><small>Risk {s.risk} · Impact {s.impact}</small></div>)}</article>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card"><h3>Savings Trend Analysis</h3>{seeded.visualizations.savingsTrend.map((point) => <div key={point.month} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ width: 34 }}>{point.month}</span><div style={{ flex: 1, height: 12, borderRadius: 8, background: '#1f2937' }}><div style={{ width: `${(point.usd / savingsMax) * 100}%`, height: '100%', borderRadius: 8, background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)' }} /></div><span>{formatUsd(point.usd)}</span></div>)}</article>
        <article className="card"><h3>Procurement Velocity Charts</h3>{seeded.visualizations.procurementVelocity.map((lane) => <div key={lane.lane} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ width: 140 }}>{lane.lane}</span><div style={{ flex: 1, height: 12, borderRadius: 8, background: '#1f2937' }}><div style={{ width: `${lane.eventsPerMonth * 4}%`, height: '100%', borderRadius: 8, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} /></div><span>{lane.eventsPerMonth}/mo</span></div>)}</article>
      </div>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Live Overlay KPI</h3>
        <p>Rows/Health: {commandKpis.rowCount || commandKpis.procurementHealthScore || 0} · Active Alerts: {commandKpis.activeAlertCount ?? commandKpis.activeAlerts ?? 0} · Supplier Count/Risk: {commandKpis.supplierCount || commandKpis.highRiskSuppliers || 0}</p>
      </article>
    </section>
  );
}

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const sampleRows = [
  { supplier: 'Acme Metals', category: 'Raw Materials', po: 'PO1001', spend: 2100, marginPct: 0.276, daysLate: 5, risk: 58 },
  { supplier: 'Titan Fasteners', category: 'Hardware', po: 'PO1002', spend: 425, marginPct: 0.190, daysLate: 0, risk: 18 },
  { supplier: 'Orion Plastics', category: 'Components', po: 'PO1003', spend: 2400, marginPct: 0.111, daysLate: 11, risk: 82 },
  { supplier: 'Nova Electronics', category: 'Electronics', po: 'PO1010', spend: 2664, marginPct: -0.021, daysLate: 4, risk: 91 },
  { supplier: 'Cobalt Supply', category: 'MRO', po: 'PO1008', spend: 540, marginPct: 0.118, daysLate: 11, risk: 77 }
];

const buyerProfiles = [
  ['ERP implementation firm', 'Add AI procurement intelligence to existing SAP, Oracle, Infor, NetSuite, Epicor, or Dynamics clients.'],
  ['Procurement consultancy', 'Turn advisory work into recurring software revenue and automated client diagnostics.'],
  ['GovCon advisory firm', 'Offer supplier risk, sourcing readiness, and procurement visibility to defense suppliers.'],
  ['Supply-chain SaaS company', 'Expand from tracking workflows into decision intelligence and executive reporting.']
];

const commercialization = [
  ['Days 1-30', 'Polish demo, connect sample ERP workflows, package onboarding, target 25 strategic partners.'],
  ['Days 31-60', 'Run pilot conversations, collect procurement feedback, define implementation partner motion.'],
  ['Days 61-90', 'Convert first pilots, launch white-label offer, price enterprise implementation packages.']
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

export default function StrategicDemoPage() {
  const [annualSpend, setAnnualSpend] = useState(50000000);
  const [leakagePct, setLeakagePct] = useState(1.5);
  const [recoveryPct, setRecoveryPct] = useState(35);

  const roi = useMemo(() => {
    const leakage = annualSpend * (leakagePct / 100);
    const recovered = leakage * (recoveryPct / 100);
    const platformCost = 120000;
    const net = recovered - platformCost;
    const multiple = platformCost ? recovered / platformCost : 0;
    return { leakage, recovered, platformCost, net, multiple };
  }, [annualSpend, leakagePct, recoveryPct]);

  const totalSpend = sampleRows.reduce((sum, row) => sum + row.spend, 0);
  const lateRows = sampleRows.filter((row) => row.daysLate > 0).length;
  const highRisk = sampleRows.filter((row) => row.risk >= 70).length;
  const marginLeak = sampleRows.filter((row) => row.marginPct < 0.18).length;

  return (
    <main className="landing-page strategic-demo-page">
      <SeoHead title="BlackCrest Strategic Demo" description="Buyer-ready strategic demo for BlackCrest Procurement Intelligence OS." canonicalPath="/strategic-demo" robots="noindex, nofollow" />

      <section className="card hero">
        <p className="eyebrow">Buyer-Ready Strategic Demo</p>
        <h1>The ERP-connected intelligence layer procurement teams are missing.</h1>
        <p>BlackCrest turns procurement data into supplier risk visibility, margin leakage alerts, late delivery exposure, sourcing actions, and executive reporting. This page packages the product as a strategic acquisition asset, not a raw codebase.</p>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <a className="btn" href="/sample-erp-procurement-data.csv" download>Download Sample ERP Data</a>
          <Link className="btn ghost" to="/acquisition-room">Acquisition Room</Link>
          <Link className="btn ghost" to="/investor-demo">Investor Demo</Link>
        </div>
      </section>

      <section className="grid four">
        <article className="card glass-panel"><p className="metric-label">Sample spend analyzed</p><h3>{formatCurrency(totalSpend)}</h3></article>
        <article className="card glass-panel"><p className="metric-label">Late delivery signals</p><h3>{lateRows}</h3></article>
        <article className="card glass-panel"><p className="metric-label">High-risk suppliers</p><h3>{highRisk}</h3></article>
        <article className="card glass-panel"><p className="metric-label">Margin leak lines</p><h3>{marginLeak}</h3></article>
      </section>

      <section className="grid two">
        <article className="card glass-panel">
          <h2>Live procurement intelligence preview</h2>
          <p>The sample data demonstrates what the platform is built to expose once connected to ERP exports or read-only procurement data.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Category</th><th>Spend</th><th>Margin</th><th>Late</th><th>Risk</th></tr></thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr key={row.po}>
                    <td>{row.supplier}</td>
                    <td>{row.category}</td>
                    <td>{formatCurrency(row.spend)}</td>
                    <td>{Math.round(row.marginPct * 100)}%</td>
                    <td>{row.daysLate}d</td>
                    <td><span className={`severity-chip ${row.risk >= 80 ? 'critical' : row.risk >= 60 ? 'high' : 'medium'}`}>{row.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card glass-panel">
          <h2>Executive actions generated</h2>
          <ul className="timeline-list">
            <li>Escalate Nova Electronics due to negative margin and delivery risk.</li>
            <li>Review Orion Plastics for chronic lateness and low margin exposure.</li>
            <li>Launch RFQ for components category to reduce supplier concentration.</li>
            <li>Move recurring hardware lines into blanket PO planning.</li>
            <li>Route high-risk suppliers to Sentinel review before executive reporting.</li>
          </ul>
        </article>
      </section>

      <section className="card glass-panel">
        <h2>Buyer ROI model</h2>
        <p>Use this to show a strategic buyer how small procurement improvements can justify serious acquisition or licensing economics.</p>
        <div className="grid three">
          <label className="card nested">Annual procurement spend<input value={annualSpend} onChange={(event) => setAnnualSpend(Number(event.target.value || 0))} type="number" /></label>
          <label className="card nested">Estimated leakage %<input value={leakagePct} onChange={(event) => setLeakagePct(Number(event.target.value || 0))} type="number" step="0.1" /></label>
          <label className="card nested">Recoverable leakage %<input value={recoveryPct} onChange={(event) => setRecoveryPct(Number(event.target.value || 0))} type="number" /></label>
        </div>
        <div className="grid four" style={{ marginTop: '1rem' }}>
          <article className="card nested"><p className="metric-label">Estimated leakage</p><h3>{formatCurrency(roi.leakage)}</h3></article>
          <article className="card nested"><p className="metric-label">Recoverable value</p><h3>{formatCurrency(roi.recovered)}</h3></article>
          <article className="card nested"><p className="metric-label">Illustrative annual cost</p><h3>{formatCurrency(roi.platformCost)}</h3></article>
          <article className="card nested"><p className="metric-label">Value / cost multiple</p><h3>{roi.multiple.toFixed(1)}x</h3></article>
        </div>
      </section>

      <section className="grid two">
        <article className="card glass-panel">
          <h2>Strategic buyer fit</h2>
          {buyerProfiles.map(([title, copy]) => <div className="card nested" key={title}><h3>{title}</h3><p>{copy}</p></div>)}
        </article>
        <article className="card glass-panel">
          <h2>90-day commercialization plan</h2>
          {commercialization.map(([title, copy]) => <div className="card nested" key={title}><h3>{title}</h3><p>{copy}</p></div>)}
        </article>
      </section>

      <section className="card glass-panel">
        <h2>The $1.2M acquisition framing</h2>
        <p>The codebase-only transaction is the low-end offer. The strategic offer is the broader product foundation: commercial rights, roadmap, demo assets, ERP-data intelligence logic, buyer packaging, technical handoff, and a clear path for a buyer with distribution to monetize it.</p>
      </section>
    </main>
  );
}

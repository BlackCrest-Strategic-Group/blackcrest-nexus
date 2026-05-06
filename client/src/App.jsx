import React, { useMemo, useState } from 'react';
import './styles.css';

const modules = [
  'Executive Dashboard',
  'Procurement Intelligence',
  'Sourcing Command Center',
  'Supplier Marketplace',
  'Proposal Generator',
  'Funding Bridge',
  'ERP Connector Center',
  'Settings'
];

const spendTrend = [5.4, 6.8, 7.1, 6.4, 8.2, 9.6, 10.1, 11.4];
const heatmap = [
  { supplier: 'Atlas Components', quality: 94, delivery: 87, cost: 91 },
  { supplier: 'IronPeak Industrial', quality: 89, delivery: 92, cost: 84 },
  { supplier: 'Nova Source Global', quality: 96, delivery: 79, cost: 88 }
];

const mockSuppliers = [
  { id: 1, name: 'Atlas Components', category: 'Electronics', region: 'North America', certification: 'ISO 9001', rating: 4.8, capabilities: 'PCBA, wire harness, enclosures' },
  { id: 2, name: 'IronPeak Industrial', category: 'Machining', region: 'Europe', certification: 'AS9100', rating: 4.5, capabilities: 'CNC, tooling, forgings' },
  { id: 3, name: 'Nova Source Global', category: 'Plastics', region: 'APAC', certification: 'ISO 14001', rating: 4.6, capabilities: 'Injection molding, precision plastics' }
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState(modules[0]);
  const [selectedSupplier, setSelectedSupplier] = useState(mockSuppliers[0]);

  const [rfqs, setRfqs] = useState([
    { id: 'RFQ-1001', item: 'Servo Motor', qty: 250, status: 'Open', stage: 'Qualification' },
    { id: 'RFQ-1002', item: 'Hydraulic Valve', qty: 480, status: 'Quoted', stage: 'Quote Review' },
    { id: 'RFQ-1003', item: 'Industrial Sensor', qty: 720, status: 'Awarding', stage: 'Award' }
  ]);
  const [proposalSaved, setProposalSaved] = useState(false);
  const [proposal, setProposal] = useState({ customer: '', scope: '', value: '' });
  const [supplierQuery, setSupplierQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'All', region: 'All', certification: 'All' });

  const [calc, setCalc] = useState({
    supplier: 'Atlas Components', duration: '12 Months', release: 'Monthly', moq: 500, tieredPricing: '1K @ $38.50 / 5K @ $36.10',
    partNumber: 'BC-2093', description: 'Control board assembly', contractQty: 12000, unitCost: 37.8, markup: 18, leadTime: 34
  });

  const calcResults = useMemo(() => {
    const extended = Number(calc.contractQty) * Number(calc.unitCost);
    const sellPrice = Number(calc.unitCost) * (1 + Number(calc.markup) / 100);
    const margin = sellPrice > 0 ? ((sellPrice - Number(calc.unitCost)) / sellPrice) * 100 : 0;
    const riskScore = Math.max(0, 100 - Number(calc.leadTime) - margin / 2);
    return {
      extended,
      sellPrice,
      margin,
      risk: riskScore > 55 ? 'Elevated' : 'Controlled',
      savings: extended * 0.072,
      forecast: extended * 1.14
    };
  }, [calc]);

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierQuery.toLowerCase()) &&
    (filters.category === 'All' || s.category === filters.category) &&
    (filters.region === 'All' || s.region === filters.region) &&
    (filters.certification === 'All' || s.certification === filters.certification)
  );

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>BlackCrest Nexus</h1>
        <p className="side-sub">Procurement Intelligence OS</p>
        {modules.map((m) => (
          <button key={m} className={active === m ? 'active' : ''} onClick={() => setActive(m)}>{m}</button>
        ))}
      </aside>
      <main>
        <header className="topbar"><h2>{active}</h2><span className="status">System Integrity: Secure • Live</span></header>
        <section className="panel">
          {active === 'Executive Dashboard' && <div>
            <div className="kpi-grid">{[
              ['Spend Under Management', '$48.2M'], ['Active RFQs', '126'], ['Identified Savings', '$3.8M'], ['Supplier Risk Alerts', '14'], ['Proposal Pipeline', '$12.4M'], ['ERP Readiness', '87%']
            ].map(([label, value]) => <article key={label} className="kpi"><p>{label}</p><h3>{value}</h3></article>)}</div>
            <div className="two-col">
              <article className="card chart-card"><h3>Spend Analytics</h3><div className="bars">{spendTrend.map((v, i) => <div key={i} className="bar" style={{ height: `${v * 8}px` }}><span>Q{i + 1}</span></div>)}</div></article>
              <article className="card"><h3>Supplier Performance Heatmap</h3>{heatmap.map((row) => <div key={row.supplier} className="heat-row"><b>{row.supplier}</b><span className="pill">Q {row.quality}</span><span className="pill">D {row.delivery}</span><span className="pill">C {row.cost}</span></div>)}</article>
            </div>
            <div className="three-col">
              <article className="card"><h3>Procurement Pipeline Timeline</h3><ul><li>Discovery complete — 14 categories</li><li>RFQ release window — May 12</li><li>Supplier award gates — May 18 to May 25</li><li>Contract activation — June 1</li></ul></article>
              <article className="card"><h3>Recent Sourcing Activity</h3><ul><li>Tier-1 electronics rebid initiated</li><li>Freight consolidation scenario approved</li><li>MRO consolidation opportunity scored at 91</li></ul></article>
              <article className="card"><h3>Risk Alert Feed</h3><ul><li>Alloy shortage watchlist: medium escalation</li><li>Single-source dependence exceeded threshold</li><li>Late shipment cluster in APAC lane</li></ul></article>
            </div>
          </div>}

          {active === 'Procurement Intelligence' && <div>
            <div className="dropzone">Drop procurement files here • XLSX/CSV support placeholder • Drag and drop upload zone</div>
            <div className="two-col">
              <article className="card"><h3>Parsed Procurement Table Preview</h3><table><thead><tr><th>Part #</th><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Status</th></tr></thead><tbody><tr><td>BC-2093</td><td>Control board assembly</td><td>12000</td><td>$37.80</td><td>Ready</td></tr><tr><td>BC-1438</td><td>Drive housing</td><td>6700</td><td>$52.40</td><td>Needs review</td></tr></tbody></table></article>
              <article className="card"><h3>Approval Workflow Panel</h3><p>Reviewer: Category Director</p><p>Finance Check: Pending</p><p>Legal Terms: Ready</p><p>Executive Approval SLA: 36h</p></article>
            </div>
            <article className="card"><h3>Blanket PO Builder</h3><div className="grid">{[
              ['supplier', 'Supplier selector'], ['duration', 'Blanket agreement duration'], ['release', 'Release schedule'], ['moq', 'MOQ'], ['tieredPricing', 'Tiered pricing'], ['leadTime', 'Lead time tracking'], ['markup', 'Margin analysis']
            ].map(([k, p]) => <input key={k} placeholder={p} value={calc[k]} onChange={(e) => setCalc({ ...calc, [k]: e.target.value })} />)}</div>
              <div className="kpi-grid slim"><article className="kpi"><p>Spend Forecasting</p><h3>${calcResults.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></article><article className="kpi"><p>Savings Estimate</p><h3>${calcResults.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></article><article className="kpi"><p>Risk Scoring</p><h3>{calcResults.risk}</h3></article></div>
              <button className="gold">Generate Blanket PO Strategy</button>
              <div className="summary">Professional summary output panel: Multi-release blanket strategy with tier migration at 5K units, lead-time buffer by lane, and contract margin guardrails.</div>
            </article>
          </div>}

          {active === 'Sourcing Command Center' && <div className="two-col"><article className="card"><h3>RFQ Kanban Board</h3><div className="kanban">{['Qualification', 'Quote Review', 'Award'].map((stage) => <div key={stage}><h4>{stage}</h4>{rfqs.filter((r) => r.stage === stage).map((r) => <div className="kanban-card" key={r.id}>{r.id}<small>{r.item} • Qty {r.qty}</small></div>)}</div>)}</div><button onClick={() => setRfqs([...rfqs, { id: `RFQ-${1000 + rfqs.length + 1}`, item: 'Bearing Assembly', qty: 100 + rfqs.length * 25, status: 'Open', stage: 'Qualification' }])}>Create Mock RFQ</button></article><article className="card"><h3>Supplier Quote Comparison Matrix</h3><table><thead><tr><th>Supplier</th><th>Price</th><th>Lead Time</th><th>Quality</th></tr></thead><tbody><tr><td>Atlas</td><td>$38.00</td><td>35 days</td><td>94</td></tr><tr><td>IronPeak</td><td>$40.20</td><td>28 days</td><td>91</td></tr><tr><td>Nova Source</td><td>$39.10</td><td>31 days</td><td>95</td></tr></tbody></table><p>Supplier Rankings: 1) Nova Source 2) Atlas 3) IronPeak</p><p>Award recommendation panel: award 60/40 split to Nova Source + Atlas to reduce concentration risk.</p><p>Timeline workflow: RFQ issue → technical validation → commercial round → executive award.</p></article></div>}

          {active === 'Supplier Marketplace' && <div><div className="grid"><input placeholder="Search suppliers" value={supplierQuery} onChange={(e) => setSupplierQuery(e.target.value)} />{['category', 'region', 'certification'].map((f) => <select key={f} value={filters[f]} onChange={(e) => setFilters({ ...filters, [f]: e.target.value })}><option>All</option>{[...new Set(mockSuppliers.map((s) => s[f]))].map((v) => <option key={v}>{v}</option>)}</select>)}</div><div className="market-grid">{filteredSuppliers.map((s) => <div className="card market" key={s.id} onClick={() => setSelectedSupplier(s)}><b>{s.name}</b><p>{s.category} • {s.region}</p><small>Certifications: {s.certification}</small><div className="score">Performance score {Math.round(s.rating * 20)}</div></div>)}</div><article className="card"><h3>Supplier Profile Drawer</h3><p><b>{selectedSupplier.name}</b></p><p>Capabilities: {selectedSupplier.capabilities}</p><p>Certifications: {selectedSupplier.certification}</p><p>Geographic filters active: {filters.region}</p><p>Supplier performance scores: {selectedSupplier.rating} / 5.0</p></article></div>}

          {active === 'Proposal Generator' && <div className="two-col"><article className="card"><h3>Executive Proposal Builder Workflow</h3><input placeholder='Customer' value={proposal.customer} onChange={(e) => setProposal({ ...proposal, customer: e.target.value })} /><input placeholder='Scope' value={proposal.scope} onChange={(e) => setProposal({ ...proposal, scope: e.target.value })} /><input placeholder='Estimated Contract Value' value={proposal.value} onChange={(e) => setProposal({ ...proposal, value: e.target.value })} /><p>Opportunity scoring: 89 / 100</p><p>Pricing summary: blended margin 17.8%, payback 5.3 months.</p><button onClick={() => setProposalSaved(true)}>Export Proposal</button>{proposalSaved && <p className='success'>Export panel complete: package generated.</p>}</article><article className="card"><h3>AI-generated proposal summary card</h3><p>Strategic sourcing program with dual-source resiliency, ERP harmonization, and KPI-linked savings governance designed for 12-month execution.</p></article></div>}

          {active === 'Funding Bridge' && <div><div className='three-col'><div className='card'><h3>Working Capital Estimate</h3><p>$2.6M for 90-day cycle support</p></div><div className='card'><h3>PO Financing Example</h3><p>$840K funded against RFQ-1002</p></div><div className='card'><h3>Funding Status Indicator</h3><p>Capital readiness: 82/100</p></div></div><article className='card'><h3>Capital Readiness Workflow</h3><p>Data package → lender fit check → covenant review → disbursement schedule.</p><button>Prepare Funding Packet</button></article></div>}

          {active === 'ERP Connector Center' && <div><div className="market-grid">{['SAP', 'Oracle', 'NetSuite', 'Infor', 'Microsoft Dynamics'].map((n) => <article key={n} className="card"><h3>{n}</h3><p>Connection state: Connected (demo)</p><p>Read-only status: Enabled</p><p>Sync readiness: 87%</p><p>Token security status: Rotated + encrypted</p></article>)}</div></div>}
          {active === 'Settings' && <p>Organization profile, user controls, and platform preferences.</p>}
        </section>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  return <div className="login"><div className="bg-orb" /><div className="panel login-card"><div><h1>BlackCrest Nexus</h1><p>Trusted procurement intelligence infrastructure.</p><ul><li>Enterprise-grade sourcing workflows</li><li>Executive KPI command center</li><li>Secure ERP orchestration layer</li></ul></div><div><h2>Secure Operator Login</h2><input placeholder="Email" /><input placeholder="Password" type="password" /><button onClick={onLogin}>Login</button></div></div></div>;
}

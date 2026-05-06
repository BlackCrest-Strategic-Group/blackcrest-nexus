import React, { useMemo, useState } from 'react';
import './styles.css';

const modules = [
  'Executive Command Center','Procurement Operations','Manufacturing Operations','Supplier Intelligence','Capacity Planning','Revenue Risk Engine','Open Orders','Shortage Management','Blanket PO Builder','Proposal Generator','Funding Bridge','Global Marketplace','ERP Integrations','AI Command Center','Reports & Exports','Admin Settings'
];

const initialAlerts = [
  { id: 'ALT-401', type: 'Line Down Risk', severity: 'Critical', owner: 'Plant Ops', eta: '2h' },
  { id: 'ALT-402', type: 'Late Supplier Recovery', severity: 'High', owner: 'Buyer Team 2', eta: '8h' },
  { id: 'ALT-403', type: 'Capacity Overload', severity: 'Medium', owner: 'Planning', eta: '24h' }
];

const productionLines = [
  { line: 'Line A - Drive Units', utilization: 93, bottleneck: 'CNC-04', shortages: 2, revenueRisk: 1.2 },
  { line: 'Line B - Sensor Pods', utilization: 81, bottleneck: 'SMT-02', shortages: 1, revenueRisk: 0.6 },
  { line: 'Line C - Power Modules', utilization: 97, bottleneck: 'Test Bay-7', shortages: 4, revenueRisk: 2.8 }
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState(modules[0]);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [buyerQueue, setBuyerQueue] = useState([
    { po: 'PO-88321', supplier: 'Atlas Components', issue: 'ETA slip 5 days', priority: 'High' },
    { po: 'PO-88344', supplier: 'Nova Source Global', issue: 'ASN missing', priority: 'Medium' }
  ]);
  const [riskScenario, setRiskScenario] = useState('Balanced');

  const executiveKpis = useMemo(() => ([
    ['Total Annual Spend', '$186.4M'], ['Revenue at Risk', '$9.7M'], ['Total Suppliers', '428'], ['Open PO Exposure', '$42.1M'], ['Late Supplier %', '12.8%'], ['Capacity Utilization', '89%'],
    ['Inventory Exposure', '$6.3M'], ['Margin Leakage', '$2.1M'], ['Critical Shortages', '17'], ['Expediting Costs', '$418K'], ['Supplier Responsiveness', '84/100'], ['Pipeline Value', '$74.9M']
  ]), []);

  const capacityData = useMemo(() => {
    const scenarioFactor = riskScenario === 'Aggressive' ? 1.1 : riskScenario === 'Conservative' ? 0.9 : 1;
    return productionLines.map((l) => ({ ...l, forecastGap: Math.round((l.utilization - 85) * scenarioFactor) }));
  }, [riskScenario]);

  const escalate = (po) => setAlerts([{ id: `ALT-${500 + alerts.length}`, type: `Escalated ${po}`, severity: 'High', owner: 'Director Procurement', eta: '4h' }, ...alerts]);

  if (!loggedIn) return <div className="login"><div className="panel login-card"><h1>BlackCrest Nexus</h1><p>Manufacturing & Procurement Intelligence OS</p><button onClick={() => setLoggedIn(true)}>Secure Login</button></div></div>;

  return (
    <div className="app-shell">
      <aside className="sidebar"><h1>BlackCrest Nexus</h1><p className="side-sub">Operational Command Center</p>{modules.map((m) => <button key={m} className={active === m ? 'active' : ''} onClick={() => setActive(m)}>{m}</button>)}</aside>
      <main>
        <header className="topbar"><h2>{active}</h2><span className="status">Live Ops • Secure • Multi-Plant</span></header>
        <section className="panel">
          {active === 'Executive Command Center' && <>
            <div className="kpi-grid">{executiveKpis.map(([l,v]) => <article className="kpi" key={l}><p>{l}</p><h3>{v}</h3></article>)}</div>
            <article className="card"><h3>Forecasted Operational Risk</h3><p>Current posture: <b>{riskScenario}</b></p><select value={riskScenario} onChange={(e)=>setRiskScenario(e.target.value)}><option>Balanced</option><option>Aggressive</option><option>Conservative</option></select><p>Predictive alert model projects late shipment exposure between <b>$3.2M and $5.8M</b> over next 30 days.</p></article>
          </>}

          {active === 'Procurement Operations' && <div className="two-col"><article className="card"><h3>Supplier Follow-up Queue</h3>{buyerQueue.map((q)=><div key={q.po} className="heat-row"><b>{q.po}</b><span>{q.supplier}</span><span className="pill">{q.priority}</span><button onClick={()=>escalate(q.po)}>Escalate Risk</button></div>)}</article><article className="card"><h3>One-Click Supplier Actions</h3><button>Follow Up Supplier</button><button>Request Updated ETA</button><button>Expedite Shipment</button><p>AI draft email: "Please confirm revised ship date, constrained components, and recovery plan by EOD."</p></article></div>}

          {active === 'Manufacturing Operations' && <article className="card"><h3>Production Line Bottleneck Map</h3>{productionLines.map((l)=><div key={l.line} className="heat-row"><b>{l.line}</b><span className="pill">Util {l.utilization}%</span><span className="pill">Bottleneck {l.bottleneck}</span><span className="pill">Shortages {l.shortages}</span><span className="pill">Risk ${l.revenueRisk}M</span></div>)}</article>}

          {active === 'Capacity Planning' && <article className="card"><h3>Capacity Forecast</h3>{capacityData.map((l)=><p key={l.line}>{l.line}: Scheduled load {l.utilization}% • Forecast gap {l.forecastGap} hrs/week</p>)}</article>}

          {active === 'Revenue Risk Engine' && <article className="card"><h3>Revenue at Risk Scoring</h3>{alerts.map((a)=><div key={a.id} className="heat-row"><b>{a.id}</b><span>{a.type}</span><span className="pill">{a.severity}</span><span>{a.owner}</span><span>Mitigation SLA {a.eta}</span></div>)}</article>}

          {active === 'Shortage Management' && <article className="card"><h3>File Intake + Impact Mapper</h3><p>Upload parsers active for shortage reports, open orders, ERP exports, manufacturing schedules, and revenue files.</p><div className="dropzone">Drag report files here to map shortages to line-down risk and revenue exposure.</div></article>}

          {!['Executive Command Center','Procurement Operations','Manufacturing Operations','Capacity Planning','Revenue Risk Engine','Shortage Management'].includes(active) && <article className="card"><h3>{active}</h3><p>Interactive enterprise module scaffold with realistic workflow cards and live state connectivity.</p></article>}
        </section>
      </main>
    </div>
  );
}

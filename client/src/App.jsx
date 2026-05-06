import { useMemo, useState } from 'react';
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

const mockSuppliers = [
  { id: 1, name: 'Atlas Components', category: 'Electronics', region: 'North America', certification: 'ISO 9001', rating: 4.8 },
  { id: 2, name: 'IronPeak Industrial', category: 'Machining', region: 'Europe', certification: 'AS9100', rating: 4.5 },
  { id: 3, name: 'Nova Source Global', category: 'Plastics', region: 'APAC', certification: 'ISO 14001', rating: 4.6 }
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState(modules[0]);

  const [calc, setCalc] = useState({ partNumber: '', description: '', contractQty: 0, unitCost: 0, markup: 0, leadTime: 0 });
  const [rfqs, setRfqs] = useState([{ id: 'RFQ-1001', item: 'Servo Motor', qty: 250, status: 'Open' }]);
  const [selectedRfq, setSelectedRfq] = useState(rfqs[0]);
  const [proposalSaved, setProposalSaved] = useState(false);
  const [proposal, setProposal] = useState({ customer: '', scope: '', value: '' });
  const [supplierQuery, setSupplierQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'All', region: 'All', certification: 'All' });

  const calcResults = useMemo(() => {
    const extended = Number(calc.contractQty) * Number(calc.unitCost);
    const sellPrice = Number(calc.unitCost) * (1 + Number(calc.markup) / 100);
    const margin = sellPrice > 0 ? ((sellPrice - Number(calc.unitCost)) / sellPrice) * 100 : 0;
    const risk = Number(calc.leadTime) > 45 || margin < 12 ? 'High' : 'Normal';
    return { extended, sellPrice, margin, risk };
  }, [calc]);

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierQuery.toLowerCase()) &&
    (filters.category === 'All' || s.category === filters.category) &&
    (filters.region === 'All' || s.region === filters.region) &&
    (filters.certification === 'All' || s.certification === filters.certification)
  );

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Nexus</h1>
        {modules.map((m) => (
          <button key={m} className={active === m ? 'active' : ''} onClick={() => setActive(m)}>{m}</button>
        ))}
      </aside>
      <main>
        <header className="topbar"><h2>{active}</h2></header>
        <section className="panel">
          {active === 'Executive Dashboard' && <p>Enterprise snapshot: spend under management, sourcing velocity, supplier health, and margin protection KPIs.</p>}
          {active === 'Procurement Intelligence' && <div><h3>Manual Intake</h3><div className="grid">{['partNumber','description','contractQty','unitCost','markup','leadTime'].map((k)=><input key={k} placeholder={k} value={calc[k]} onChange={(e)=>setCalc({...calc,[k]:e.target.value})}/> )}</div><ul><li>Extended Cost: ${calcResults.extended.toFixed(2)}</li><li>Sell Price: ${calcResults.sellPrice.toFixed(2)}</li><li>Estimated Margin: {calcResults.margin.toFixed(1)}%</li><li>Risk Flag: {calcResults.risk}</li></ul></div>}
          {active === 'Sourcing Command Center' && <div><button onClick={()=>{const n={id:`RFQ-${1000+rfqs.length+1}`,item:'Bearing Assembly',qty:100+rfqs.length*25,status:'Open'}; setRfqs([...rfqs,n]);}}>Create Mock RFQ</button><table><thead><tr><th>ID</th><th>Item</th><th>Qty</th><th>Status</th></tr></thead><tbody>{rfqs.map(r=><tr key={r.id} onClick={()=>setSelectedRfq(r)}><td>{r.id}</td><td>{r.item}</td><td>{r.qty}</td><td>{r.status}</td></tr>)}</tbody></table><p>RFQ Detail: {selectedRfq?.id} • {selectedRfq?.item} • Qty {selectedRfq?.qty}</p><h4>Supplier Comparison</h4><table><tbody><tr><td>Atlas</td><td>$38.00</td><td>35 days</td></tr><tr><td>IronPeak</td><td>$40.20</td><td>28 days</td></tr></tbody></table></div>}
          {active === 'Supplier Marketplace' && <div><input placeholder="Search suppliers" value={supplierQuery} onChange={(e)=>setSupplierQuery(e.target.value)} /><div className="grid">{['category','region','certification'].map((f)=><select key={f} value={filters[f]} onChange={(e)=>setFilters({...filters,[f]:e.target.value})}><option>All</option>{[...new Set(mockSuppliers.map(s=>s[f]))].map(v=><option key={v}>{v}</option>)}</select>)}</div>{filteredSuppliers.map(s=><div className="card" key={s.id}><b>{s.name}</b><p>{s.category} • {s.region} • {s.certification}</p><small>Supplier Detail Panel: Rating {s.rating}</small></div>)}</div>}
          {active === 'Proposal Generator' && <div><input placeholder='Customer' value={proposal.customer} onChange={(e)=>setProposal({...proposal, customer:e.target.value})}/><input placeholder='Scope' value={proposal.scope} onChange={(e)=>setProposal({...proposal, scope:e.target.value})}/><input placeholder='Estimated Contract Value' value={proposal.value} onChange={(e)=>setProposal({...proposal, value:e.target.value})}/><p>Mock AI Summary: This proposal aligns sourcing strategy, cost controls, and implementation milestones for accelerated procurement outcomes.</p><button onClick={()=>setProposalSaved(true)}>Export Proposal</button>{proposalSaved && <p className='success'>Proposal exported successfully.</p>}</div>}
          {active === 'Funding Bridge' && <div><div className='card'>Meridian Capital — Working Capital Line</div><div className='card'>Summit Trade Finance — PO-backed funding</div><p>Funding Readiness Score: 82/100</p><button>Prepare Funding Packet</button></div>}
          {active === 'ERP Connector Center' && <div><table><tbody>{[['SAP','Demo Mode'],['Oracle','Read-only Ready'],['NetSuite','Token Required'],['Infor','Demo Mode'],['Microsoft Dynamics','Read-only Ready']].map(([n,s])=><tr key={n}><td>{n}</td><td><span className='badge'>{s}</span></td></tr>)}</tbody></table></div>}
          {active === 'Settings' && <p>Organization profile, user controls, and platform preferences.</p>}
        </section>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  return <div className="login"><div className="panel"><h1>BlackCrest Nexus</h1><p>Enterprise Procurement OS</p><input placeholder="Email"/><input placeholder="Password" type="password"/><button onClick={onLogin}>Login</button></div></div>;
}

import React, { useMemo, useState } from 'react';

const api = 'http://localhost:4000/api';

const money = (v) => `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function App() {
  const [step, setStep] = useState('landing');
  const [analysis, setAnalysis] = useState(null);
  const [selected, setSelected] = useState([]);
  const [proposal, setProposal] = useState('');
  const [marketplace, setMarketplace] = useState([]);
  const [category, setCategory] = useState('');
  const [fundingResult, setFundingResult] = useState(null);

  const uploadFile = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${api}/upload`, { method: 'POST', body: form });
    const data = await res.json();
    setAnalysis(data);
    setStep('dashboard');
  };

  const poSummary = useMemo(() => {
    if (!analysis) return [];
    const picked = analysis.items.filter((i) => selected.includes(i.part_number));
    return Object.values(picked.reduce((acc, i) => {
      if (!acc[i.supplier]) acc[i.supplier] = { supplier: i.supplier, quantity: 0, totalCost: 0 };
      acc[i.supplier].quantity += i.quantity;
      acc[i.supplier].totalCost += i.cost * i.quantity;
      return acc;
    }, {}));
  }, [analysis, selected]);

  const loadMarketplace = async (cat = '') => {
    const q = cat ? `?category=${encodeURIComponent(cat)}` : '';
    const res = await fetch(`${api}/marketplace${q}`);
    setMarketplace(await res.json());
  };

  const generateProposal = () => {
    if (!analysis) return;
    const text = `BlackCrest Nexus Proposal\n\nTotal Cost: ${money(analysis.kpis.totalSpend)}\nRecommended Pricing Uplift: 12% average\nDetected Savings: ${money(analysis.kpis.detectedSavings)}\nAt-Risk Suppliers: ${analysis.kpis.atRiskSuppliers}\nAverage Margin: ${analysis.kpis.avgMargin.toFixed(2)}%`;
    setProposal(text);
    setStep('proposal');
  };

  const downloadProposal = () => {
    const blob = new Blob([proposal], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blackcrest-proposal.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return <div className="app">{step === 'landing' && <section className="card hero"><h1>Upload your procurement data. Instantly uncover savings, sourcing options, and funding.</h1><p>No ERP required. Works in minutes.</p><button onClick={() => setStep('upload')}>Try Demo</button></section>}
    {step === 'upload' && <section className="card"><h2>Upload Data</h2><input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])} /><p className="muted">Expected columns: part_number, description, quantity, cost, price, supplier, lead_time</p></section>}
    {step === 'dashboard' && analysis && <section className="card"><h2>Dashboard Results</h2><div className="kpis">{Object.entries({ 'Total Spend': money(analysis.kpis.totalSpend), 'Detected Savings': money(analysis.kpis.detectedSavings), 'At-Risk Suppliers': analysis.kpis.atRiskSuppliers, 'Avg Margin %': analysis.kpis.avgMargin.toFixed(2) }).map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
      <h3>Category Spend</h3><ul>{Object.entries(analysis.categories).map(([k, v]) => <li key={k}>{k}: {money(v)}</li>)}</ul>
      <table><thead><tr><th></th><th>Part</th><th>Description</th><th>Supplier</th><th>Qty</th><th>Cost</th><th>Price</th><th>Lead</th><th>Margin%</th></tr></thead><tbody>
        {analysis.items.map((i) => <tr key={i.part_number} className={`${i.marginPct < 15 ? 'low' : ''} ${i.lead_time > 30 ? 'risk' : ''}`}><td><input type="checkbox" checked={selected.includes(i.part_number)} onChange={() => setSelected((s) => s.includes(i.part_number) ? s.filter((x) => x !== i.part_number) : [...s, i.part_number])} /></td><td>{i.part_number}</td><td>{i.description}</td><td>{i.supplier}</td><td>{i.quantity}</td><td>{money(i.cost)}</td><td>{money(i.price)}</td><td>{i.lead_time}d</td><td>{i.marginPct.toFixed(2)}</td></tr>)}
      </tbody></table>
      <h3>ERP Integration Ready</h3><p>BlackCrest Nexus works standalone today and is API-ready for SAP, Oracle, NetSuite, and Microsoft Dynamics workflows.</p>
      <div className="actions"><button onClick={generateProposal}>Generate Proposal</button><button onClick={() => { setStep('marketplace'); loadMarketplace(); }}>Marketplace</button><button onClick={() => setStep('funding')}>Funding</button></div>
      <h3>Blanket PO Summary</h3><table><thead><tr><th>Supplier</th><th>Total Qty</th><th>Total Cost</th></tr></thead><tbody>{poSummary.map((p) => <tr key={p.supplier}><td>{p.supplier}</td><td>{p.quantity}</td><td>{money(p.totalCost)}</td></tr>)}</tbody></table>
    </section>}
    {step === 'proposal' && <section className="card"><h2>Proposal Generator</h2><pre>{proposal}</pre><button onClick={downloadProposal}>Download Proposal</button><button onClick={() => setStep('marketplace')}>Next: Marketplace</button></section>}
    {step === 'marketplace' && <section className="card"><h2>Marketplace</h2><div className="actions"><input placeholder="Filter category" value={category} onChange={(e) => setCategory(e.target.value)} /><button onClick={() => loadMarketplace(category)}>Filter</button><button onClick={() => setStep('funding')}>Next: Funding</button></div><table><thead><tr><th>Supplier</th><th>Category</th><th>Region</th><th>Action</th></tr></thead><tbody>{marketplace.map((m) => <tr key={m.name}><td>{m.name}</td><td>{m.category}</td><td>{m.region}</td><td><button onClick={() => fetch(`${api}/request-quote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) })}>Request Quote</button></td></tr>)}</tbody></table></section>}
    {step === 'funding' && <Funding onSubmit={setFundingResult} result={fundingResult} />}
  </div>;
}

function Funding({ onSubmit, result }) {
  const [poValue, setPoValue] = useState('');
  const [neededCapital, setNeededCapital] = useState('');

  const submit = async () => {
    const res = await fetch('http://localhost:4000/api/funding-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poValue, neededCapital })
    });
    onSubmit(await res.json());
  };

  return <section className="card"><h2>Funding</h2><input placeholder="PO Value" value={poValue} onChange={(e) => setPoValue(e.target.value)} /><input placeholder="Needed Capital" value={neededCapital} onChange={(e) => setNeededCapital(e.target.value)} /><button onClick={submit}>Match Funding</button>{result && <p>Matched with capital partner: <strong>{result.partner}</strong> | Estimated approval: <strong>{result.estimatedApproval}</strong></p>}</section>;
}

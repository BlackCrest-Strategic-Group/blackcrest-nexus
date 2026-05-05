import { useMemo, useState } from 'react';
import './styles.css';

const menuItems = ['Opportunities', 'Pipeline', 'Sourcing', 'Marketplace', 'Funding', 'Analytics'];

const initialForm = { title: '', value: '', category: '', region: '' };

export default function App() {
  const [activeMenu, setActiveMenu] = useState('Opportunities');
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [sourcing, setSourcing] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [ceoSummary, setCeoSummary] = useState(null);

  const canAnalyze = !!uploadResult;
  const canSource = !!analysis;
  const canOptimize = !!sourcing;
  const canPropose = !!optimization;
  const canSummarize = !!proposal;

  const uploadOpportunity = async () => {
    const payload = { opportunityData: form };

    if (file) {
      const content = await file.text();
      payload.fileInfo = { fileName: file.name, fileType: file.type || 'application/octet-stream', fileSize: file.size, preview: content.slice(0, 500) };
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    setUploadResult(json);
  };

  const postStep = async (path, setter) => {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    setter(await res.json());
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/ceo-summary');
    setCeoSummary(await res.json());
  };

  const totalCostPct = useMemo(() => {
    if (!analysis) return null;
    return (analysis.costBreakdown.material + analysis.costBreakdown.labor + analysis.costBreakdown.overhead).toFixed(2);
  }, [analysis]);

  return (
    <div className="nexus-shell">
      <header className="topbar">
        <h1>BlackCrest Nexus</h1>
        <select value={activeMenu} onChange={(e) => setActiveMenu(e.target.value)}>
          {menuItems.map((item) => <option key={item}>{item}</option>)}
        </select>
      </header>

      <main className="dashboard-grid">
        <section className="panel">
          <h2>1) Opportunity Input</h2>
          <input type="file" accept=".pdf,.csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="form-grid">
            {Object.keys(form).map((key) => (
              <input key={key} placeholder={`Opportunity ${key}`} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            ))}
          </div>
          <button onClick={uploadOpportunity}>Capture Opportunity</button>
          {uploadResult && <p className="hint">{uploadResult.message}</p>}
        </section>

        <section className="panel">
          <h2>2) Procurement Analysis</h2>
          <button disabled={!canAnalyze} onClick={() => postStep('/api/analyze', setAnalysis)}>Run Analysis</button>
          {analysis && <div className="kv">
            <p><strong>Estimated Margin:</strong> {analysis.margin}%</p>
            <p><strong>Risk Level:</strong> {analysis.risk}</p>
            <p><strong>Recommendation:</strong> {analysis.recommendation}</p>
            <p><strong>Cost Breakdown:</strong> Material {analysis.costBreakdown.material}%, Labor {analysis.costBreakdown.labor}%, Overhead {analysis.costBreakdown.overhead}% (Total {totalCostPct}%)</p>
          </div>}
        </section>

        <section className="panel">
          <h2>3) Sourcing Plan</h2>
          <button disabled={!canSource} onClick={() => postStep('/api/source', setSourcing)}>Generate Sourcing Plan</button>
          {sourcing && <>
            <ul>{sourcing.suppliers.map((s) => <li key={s.name}>{s.name} — {s.leadTime} — {s.risk} risk</li>)}</ul>
            <p>{sourcing.notes}</p>
            <button>Build RFQ</button>
          </>}
        </section>

        <section className="panel">
          <h2>4) Category Optimization</h2>
          <button disabled={!canOptimize} onClick={() => postStep('/api/optimize', setOptimization)}>Apply Optimization</button>
          {optimization && <div className="kv"><p><strong>Cost Savings:</strong> {optimization.savingsOpportunity}</p><p><strong>Strategy:</strong> {optimization.strategy}</p></div>}
        </section>

        <section className="panel">
          <h2>5) Proposal Generator</h2>
          <button disabled={!canPropose} onClick={() => postStep('/api/proposal', setProposal)}>Generate Proposal</button>
          {proposal && <pre>{proposal.proposalText}</pre>}
        </section>

        <section className="panel">
          <h2>6) CEO Summary</h2>
          <button disabled={!canSummarize} onClick={fetchSummary}>Generate CEO Briefing</button>
          {ceoSummary && <div className="kv">
            <p><strong>Total Opportunity Value:</strong> ${ceoSummary.totalValue.toLocaleString()}</p>
            <p><strong>Margin Summary:</strong> {ceoSummary.marginSummary}</p>
            <p><strong>Risk Alerts:</strong> {ceoSummary.risks.join(' | ')}</p>
            <p><strong>Strategic Recommendation:</strong> {ceoSummary.recommendation}</p>
            <p><strong>Next Best Action:</strong> {ceoSummary.nextAction}</p>
          </div>}
        </section>
      </main>
    </div>
  );
}

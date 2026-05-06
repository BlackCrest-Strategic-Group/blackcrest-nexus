import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  Download,
  Factory,
  FileSpreadsheet,
  Filter,
  Flame,
  HandCoins,
  LayoutDashboard,
  LoaderCircle,
  PackageCheck,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Wallet
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const formatNumber = (value) => (typeof value === 'number' ? value.toLocaleString() : value ?? '-');
const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '-';

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];
  rows.forEach((row) => {
    const values = headers.map((key) => `"${String(Array.isArray(row[key]) ? row[key].join(' | ') : row[key] ?? '').replace(/"/g, '""')}"`);
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
};

const downloadBlob = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const initialManualRows = [
  { item: 'MCU-32 ARM Controller', supplier: 'Aegis Components', qty: 12000, unitPrice: 6.4, status: 'Ready' },
  { item: 'Power Module PM-8', supplier: 'Nova Electrics', qty: 4200, unitPrice: 14.2, status: 'Review' }
];

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualRows, setManualRows] = useState(initialManualRows);

  const dashboardKpis = useMemo(() => {
    if (!data) {
      return [
        ['Spend Under Management', '$14.8M', CircleDollarSign], ['Active RFQs', '26', LayoutDashboard], ['Cost Savings Identified', '$1.9M', Sparkles],
        ['Supplier Risk Alerts', '4', ShieldAlert], ['Open Proposals', '11', FileSpreadsheet], ['ERP Readiness', '92%', Database]
      ];
    }
    return [
      ['Spend Under Management', formatCurrency(data.demandSummary?.totalEstimatedSpend), CircleDollarSign],
      ['Active RFQs', formatNumber(data.vendorSummary?.length), LayoutDashboard],
      ['Cost Savings Identified', formatCurrency((data.demandSummary?.totalEstimatedSpend || 0) * 0.11), Sparkles],
      ['Supplier Risk Alerts', formatNumber(data.exceptions?.length), ShieldAlert],
      ['Open Proposals', formatNumber(data.blanketRecommendations?.length), FileSpreadsheet],
      ['ERP Readiness', `${data.exceptions?.length ? 86 : 96}%`, Database]
    ];
  }, [data]);

  const handleUpload = async () => {
    if (!file) return setError('Please select CSV/XLS/XLSX file first.');
    setLoading(true); setError('');
    try {
      const formData = new FormData(); formData.append('file', file);
      const response = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Upload failed');
      setData(payload);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const updateManualRow = (idx, key, value) => {
    setManualRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  return <div className="app-shell">...{renderApp({ dashboardKpis, file, setFile, loading, handleUpload, error, manualMode, setManualMode, manualRows, updateManualRow, data })}</div>;
}

function renderApp(ctx) {
  const { dashboardKpis, file, setFile, loading, handleUpload, error, manualMode, setManualMode, manualRows, updateManualRow, data } = ctx;
  return (<>
    <header className="hero"><h1>BlackCrest Nexus</h1><p>Enterprise Procurement & Sourcing Control Center</p></header>
    <section className="kpi-grid">{dashboardKpis.map(([label, value, Icon]) => <article key={label} className="kpi-card"><Icon size={18}/><span>{label}</span><strong>{value}</strong></article>)}</section>

    <section className="panel two-col">
      <div>
        <h2><UploadCloud size={18}/> Procurement Intelligence</h2>
        <div className="upload-zone"><FileSpreadsheet size={22}/><p>{file ? file.name : 'Drop CSV/XLSX or browse to upload demand data'}</p><input type="file" accept=".xlsx,.xls,.csv" onChange={(e)=>setFile(e.target.files?.[0]||null)} /></div>
        <div className="actions"><button onClick={handleUpload} disabled={loading}>{loading ? <><LoaderCircle className="spin" size={16}/> Processing</> : 'Upload & Analyze'}</button><button className="ghost" onClick={()=>setManualMode(!manualMode)}>{manualMode ? 'Use Upload Mode' : 'Manual Entry'}</button></div>
        {error && <p className="error"><AlertTriangle size={14}/> {error}</p>}
      </div>
      <div className="subpanel"><h3>Generated Outputs</h3><ul><li>Estimated annual spend <strong>$12.4M</strong></li><li>Estimated savings <strong>$1.3M</strong></li><li>Margin impact <strong>+2.8%</strong></li><li>Risk score <strong>Low / 24</strong></li></ul></div>
    </section>

    {manualMode && <section className="panel"><h3>Editable Line Items</h3><DataTable title="Manual Demand Entry" rows={manualRows} columns={[['item','Item'],['supplier','Supplier'],['qty','Qty'],['unitPrice','Unit Price'],['status','Status']]} editable onEdit={updateManualRow}/></section>}

    <section className="panel"><h2><BarChart3 size={18}/> Dashboard Intelligence</h2><div className="feature-grid">{['Activity feed','Supplier risk heatmap','Recent sourcing events','Proposal pipeline preview','Funding readiness panel'].map((x,i)=><div className="feature" key={x}><span>{x}</span><small>{['12 updates in last 24h','Tier-2 exposure in APAC reduced','3 RFQs approaching deadline','4 deals in approval stage','82% complete for lender packet'][i]}</small></div>)}</div></section>
    <section className="panel"><h2><PackageCheck size={18}/> Blanket PO Builder Workflow</h2><div className="tag-row">{['Supplier','Contract Period','MOQ','Pricing Tiers','Release Schedule','Lead Times','Margin Calculation','Approval Status'].map(t=><span key={t} className="badge">{t}</span>)}</div></section>
    <section className="panel"><h2><LayoutDashboard size={18}/> Sourcing Command Center</h2><div className="tag-row">{['Modern sourcing board','RFQ cards','Supplier comparison matrix','Quote ranking','Timeline/status tracking'].map(t=><span key={t} className="badge neutral">{t}</span>)}</div></section>
    <section className="panel"><h2><Building2 size={18}/> Supplier Marketplace</h2><div className="toolbar"><div><Search size={14}/> Search suppliers</div><div><Filter size={14}/> Filters</div></div><div className="cards-3">{['Orion Industrial','Vertex Metals','Argent Motion'].map(name=><article key={name} className="supplier"><h4>{name}</h4><p>Capabilities: CNC, Forging, Assemblies</p><p>Certifications: ISO 9001, AS9100</p><button className="ghost">Open Profile Drawer</button></article>)}</div></section>
    <section className="panel cards-3">{[['Proposal Generator',Flame],['Funding Bridge',HandCoins],['ERP Connector Center',Factory]].map(([t,I])=><article key={t} className="module"><h3><I size={17}/> {t}</h3><p>{t === 'Proposal Generator' ? 'Step-by-step workflow UI, pricing breakdown and export button.' : t === 'Funding Bridge' ? 'Capital partner cards, readiness meter, working capital estimate, approval flow.' : 'ERP integration cards with connection states, read-only indicators and token-auth placeholders.'}</p><button>{t === 'Proposal Generator' ? 'Export Proposal' : 'Open Module'}</button></article>)}</section>

    {data && <section className="panel"><h2>Analysis Data Exports</h2><div className="actions wrap">
      <button className="ghost" onClick={() => downloadBlob(toCsv(data.processedRows), 'processed-rows.csv', 'text/csv')}><Download size={14}/> Processed</button>
      <button className="ghost" onClick={() => downloadBlob(toCsv(data.vendorSummary), 'vendor-summary.csv', 'text/csv')}><Download size={14}/> Vendors</button>
      <button className="ghost" onClick={() => downloadBlob(JSON.stringify(data, null, 2), 'full-response.json', 'application/json')}><Download size={14}/> JSON</button>
    </div></section>}
  </>);
}

function DataTable({ title, rows, columns, editable = false, onEdit }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(([k,l])=><th key={k}>{l}</th>)}</tr></thead><tbody>{rows?.length ? rows.map((row,idx)=><tr key={`${title}-${idx}`}>{columns.map(([k])=><td key={k}>{editable ? <input value={row[k]} onChange={(e)=>onEdit(idx,k,e.target.value)} /> : String(row[k] ?? '-')}</td>)}</tr>) : <tr><td colSpan={columns.length}>No data available.</td></tr>}</tbody></table></div>;
}

export default App;

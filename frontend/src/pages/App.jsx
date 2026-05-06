import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

function LandingPage() {
  return <main className="min-h-screen bg-zinc-950 text-zinc-100 px-8 py-12">
    <section className="max-w-6xl mx-auto">
      <p className="text-amber-400 tracking-widest uppercase text-xs">BlackCrestAI</p>
      <h1 className="text-5xl font-bold mt-4">Procurement decisions in minutes, not days.</h1>
      <p className="text-zinc-300 mt-6 max-w-3xl">Upload RFQs, quotes, and sourcing documents. BlackCrestAI compares suppliers, flags risk, and generates procurement intelligence instantly.</p>
      <div className="mt-8 flex gap-4"><Link to="/dashboard" className="bg-amber-500 text-black px-6 py-3 font-semibold">Upload Procurement Package</Link><button className="border border-zinc-600 px-6 py-3">Book Demo</button></div>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card title="Operational workflow" text="Ingest RFQs, RFPs, quote PDFs, XLSX BOMs, and SOWs into one secure analysis run." />
        <Card title="Supplier comparison" text="Normalize supplier pricing, lead time, and quote coverage in one executive comparison." />
        <Card title="Enterprise trust" text="SOC2-ready architecture language, role-based access controls, and AI governance posture." />
      </div>
    </section>
  </main>;
}

function Card({ title, text }) { return <article className="bg-zinc-900 border border-zinc-800 p-6"><h3 className="mt-1 font-semibold text-amber-400">{title}</h3><p className="text-zinc-400 mt-2 text-sm">{text}</p></article>; }

function LoginPage() {
  return <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8"><div className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md"><h2 className="text-2xl text-white font-semibold">Enterprise Login</h2><input className="w-full mt-6 bg-zinc-800 p-3 text-white" placeholder="Email"/><input className="w-full mt-3 bg-zinc-800 p-3 text-white" type="password" placeholder="Password"/><button className="w-full bg-amber-500 text-black py-3 mt-4 font-semibold">Sign in</button><button className="w-full border border-zinc-700 text-zinc-200 py-3 mt-3">Continue with Google (placeholder)</button><button className="w-full border border-zinc-700 text-zinc-200 py-3 mt-3">Continue with Outlook (placeholder)</button></div></main>;
}

function Dashboard() {
  const [files, setFiles] = React.useState([]);
  const [analysis, setAnalysis] = React.useState(null);
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onFileChange = async (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    const formData = new FormData();
    selected.forEach((file) => formData.append('files', file));
    const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFiles(uploadRes.data.files);
  };

  const runAnalysis = async () => {
    setLoading(true);
    const analyzeRes = await api.post('/analyze', { files });
    setAnalysis(analyzeRes.data.analysis);
    const summaryRes = await api.post('/summary', { analysis: analyzeRes.data.analysis });
    setSummary(summaryRes.data.summary);
    setLoading(false);
  };

  return <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
    <div className="grid lg:grid-cols-3 gap-6">
      <section className="bg-zinc-900 border border-zinc-800 p-5">
        <h3 className="font-semibold">Upload Panel</h3>
        <label className="mt-4 p-8 border border-dashed border-zinc-600 text-center cursor-pointer block">
          <input type="file" multiple className="hidden" onChange={onFileChange} />
          Select RFQ/RFP/Quote/BOM files
        </label>
        <button disabled={!files.length || loading} onClick={runAnalysis} className="mt-4 w-full bg-amber-500 text-black py-3 disabled:opacity-50">{loading ? 'Analyzing...' : 'Run AI Analysis'}</button>
      </section>
      <section className="bg-zinc-900 border border-zinc-800 p-5"><h3 className="font-semibold">Processing Pipeline</h3><p className="text-zinc-400 text-sm mt-2">Ingest → Parse PDF/XLSX/DOCX → AI compare → Risk scoring → Executive summary.</p><ul className="mt-4 text-sm text-zinc-300 space-y-2">{files.map((f) => <li key={f.storedName}>{f.fileName}</li>)}</ul></section>
      <section className="bg-zinc-900 border border-zinc-800 p-5"><h3 className="font-semibold">AI Procurement Summary</h3><p className="text-zinc-300 text-sm mt-3 whitespace-pre-wrap">{summary || 'No summary generated yet.'}</p></section>
    </div>
    <section className="bg-zinc-900 border border-zinc-800 p-5 mt-6 overflow-x-auto">
      <h3 className="font-semibold">Supplier Comparison</h3>
      <table className="w-full mt-4 text-sm">
        <thead><tr className="text-left text-zinc-400"><th>Supplier</th><th>Total Price</th><th>Lead Time</th><th>Risk Score</th><th>Anomaly Flags</th><th>Recommendation</th></tr></thead>
        <tbody>{(analysis?.supplierComparison || []).map((row) => <tr key={row.supplier} className="border-t border-zinc-800"><td className="py-2">{row.supplier}</td><td>${row.totalPrice}</td><td>{row.leadTimeDays} days</td><td>{row.riskScore}</td><td>{(row.anomalyFlags || []).join(', ')}</td><td>{row.recommendation}</td></tr>)}</tbody>
      </table>
    </section>
  </main>;
}

export default function App() {
  return <BrowserRouter><Routes><Route path='/' element={<LandingPage/>}/><Route path='/login' element={<LoginPage/>}/><Route path='/dashboard' element={<Dashboard/>}/><Route path='*' element={<Navigate to='/' replace/>}/></Routes></BrowserRouter>;
}

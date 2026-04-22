import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CategoryPage() {
  const [form, setForm] = useState({ categoryName: '', product: '', notes: '', geography: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const load = () => api.get('/category-intelligence/history').then((res) => {
    const safeItems = Array.isArray(res.data) ? res.data : [];
    setHistory(safeItems);
  });
  useEffect(load, []);

  const analyze = async () => setResult((await api.post('/category-intelligence/analyze', form)).data);
  const save = async () => { await api.post('/category-intelligence/save', { ...form, output: result.output }); load(); };

  const safeHistory = Array.isArray(history) ? history : [];
  const output = result && typeof result.output === 'object' && result.output !== null ? result.output : null;
  const safeSignals = Array.isArray(output?.signals) ? output.signals : [];
  const safeRisks = Array.isArray(output?.risks) ? output.risks : [];
  const safeRecommendations = Array.isArray(output?.recommendations) ? output.recommendations : [];

  return <div><h1>Category Intelligence</h1><div className="card form">{['categoryName','product','notes','geography'].map((k)=><input key={k} placeholder={k} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<div className="row"><button className="btn" onClick={analyze}>Analyze</button>{result && <button className="btn ghost" onClick={save}>Save Snapshot</button>}</div></div>{output && <section className="card"><h3>{output.summary || 'Analysis complete'}</h3><p><strong>Signals:</strong> {safeSignals.join(' | ')}</p><p><strong>Risks:</strong> {safeRisks.join(' | ')}</p><p><strong>Recommendations:</strong> {safeRecommendations.join(' | ')}</p><p>Confidence: {output.confidenceScore ?? 'N/A'}</p></section>}<section className="card"><h3>History</h3><ul>{safeHistory.map((h)=><li key={h?._id || h?.categoryName}>{h?.categoryName || 'Category'} - {h?.createdAt ? new Date(h.createdAt).toLocaleString() : 'Unknown time'}</li>)}</ul></section></div>;
}

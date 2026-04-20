import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CategoryPage() {
  const [form, setForm] = useState({ categoryName: '', product: '', notes: '', geography: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const load = () => api.get('/category-intelligence/history').then((res) => setHistory(res.data));
  useEffect(load, []);

  const analyze = async () => setResult((await api.post('/category-intelligence/analyze', form)).data);
  const save = async () => { await api.post('/category-intelligence/save', { ...form, output: result.output }); load(); };

  return <div><h1>Category Intelligence</h1><div className="card form">{['categoryName','product','notes','geography'].map((k)=><input key={k} placeholder={k} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<div className="row"><button className="btn" onClick={analyze}>Analyze</button>{result && <button className="btn ghost" onClick={save}>Save Snapshot</button>}</div></div>{result && <section className="card"><h3>{result.output.summary}</h3><p><strong>Signals:</strong> {result.output.signals.join(' | ')}</p><p><strong>Risks:</strong> {result.output.risks.join(' | ')}</p><p><strong>Recommendations:</strong> {result.output.recommendations.join(' | ')}</p><p>Confidence: {result.output.confidenceScore}</p></section>}<section className="card"><h3>History</h3><ul>{history.map((h)=><li key={h._id}>{h.categoryName} - {new Date(h.createdAt).toLocaleString()}</li>)}</ul></section></div>;
}

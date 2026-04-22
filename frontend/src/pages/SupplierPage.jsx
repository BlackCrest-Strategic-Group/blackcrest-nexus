import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', location: '', capabilities: '', notes: '', risks: '', tags: '', relationshipScore: 60 });
  const [analysis, setAnalysis] = useState(null);
  const load = () => api.get('/supplier-intelligence').then((res) => {
    const safeItems = Array.isArray(res.data) ? res.data : [];
    setSuppliers(safeItems);
  });
  useEffect(load, []);

  const create = async () => { await api.post('/supplier-intelligence', { ...form, capabilities: form.capabilities.split(',').map((x) => x.trim()), risks: form.risks.split(',').map((x) => x.trim()).filter(Boolean), tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean) }); load(); };
  const runAnalysis = async (id) => setAnalysis((await api.post(`/supplier-intelligence/${id}/analyze`, {})).data);

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const analysisSupplier = analysis && typeof analysis.supplier === 'object' ? analysis.supplier : {};
  const analysisOutput = analysis && typeof analysis.output === 'object' ? analysis.output : {};
  const safeStrengths = Array.isArray(analysisOutput.strengths) ? analysisOutput.strengths : [];
  const safeAnalysisRisks = Array.isArray(analysisOutput.risks) ? analysisOutput.risks : [];

  return <div><h1>Supplier Intelligence</h1><div className="card form">{['name','category','location','capabilities','notes','risks','tags'].map((k)=><input key={k} placeholder={k} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<button className="btn" onClick={create}>Add Supplier</button></div><div className="grid two">{safeSuppliers.map((s)=><article className="card" key={s?._id || s?.name}><h3>{s?.name || 'Supplier'}</h3><p>{s?.category || 'Unknown'} • {s?.location || 'Unknown'}</p><p>Relationship Score: {s?.relationshipScore ?? 'N/A'}</p><button className="btn ghost" onClick={()=>runAnalysis(s?._id)} disabled={!s?._id}>Evaluate</button></article>)}</div>{analysis && <section className="card"><h3>{analysisSupplier.name || 'Supplier'} Evaluation</h3><p>Fit Score: {analysisOutput.fitScore ?? 'N/A'}</p><p>Strengths: {safeStrengths.join(' | ')}</p><p>Risks: {safeAnalysisRisks.join(' | ')}</p><p>Next Action: {analysisOutput.nextAction || 'Pending recommendation'}</p></section>}</div>;
}

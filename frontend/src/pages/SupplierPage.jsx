import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', location: '', capabilities: '', notes: '', risks: '', tags: '', relationshipScore: 60 });
  const [analysis, setAnalysis] = useState(null);
  const load = () => api.get('/supplier-intelligence').then((res) => setSuppliers(res.data));
  useEffect(load, []);

  const create = async () => { await api.post('/supplier-intelligence', { ...form, capabilities: form.capabilities.split(',').map((x) => x.trim()), risks: form.risks.split(',').map((x) => x.trim()).filter(Boolean), tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean) }); load(); };
  const runAnalysis = async (id) => setAnalysis((await api.post(`/supplier-intelligence/${id}/analyze`, {})).data);
  return <div><h1>Supplier Intelligence</h1><div className="card form">{['name','category','location','capabilities','notes','risks','tags'].map((k)=><input key={k} placeholder={k} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<button className="btn" onClick={create}>Add Supplier</button></div><div className="grid two">{suppliers.map((s)=><article className="card" key={s._id}><h3>{s.name}</h3><p>{s.category} • {s.location}</p><p>Relationship Score: {s.relationshipScore}</p><button className="btn ghost" onClick={()=>runAnalysis(s._id)}>Evaluate</button></article>)}</div>{analysis && <section className="card"><h3>{analysis.supplier.name} Evaluation</h3><p>Fit Score: {analysis.output.fitScore}</p><p>Strengths: {analysis.output.strengths.join(' | ')}</p><p>Risks: {analysis.output.risks.join(' | ')}</p><p>Next Action: {analysis.output.nextAction}</p></section>}</div>;
}

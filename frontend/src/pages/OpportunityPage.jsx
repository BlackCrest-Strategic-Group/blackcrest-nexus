import React, { useState } from 'react';
import api from '../services/api';

export default function OpportunityPage() {
  const [form, setForm] = useState({ title: '', text: '', linkedCategorySnapshotId: '', linkedSupplierIds: '' });
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    const data = new FormData();
    data.append('title', form.title);
    data.append('text', form.text);
    if (file) data.append('file', file);
    setResult((await api.post('/opportunity-intelligence/analyze', data)).data);
  };

  const save = async () => {
    await api.post('/opportunity-intelligence/save', {
      title: form.title,
      linkedCategorySnapshotId: form.linkedCategorySnapshotId || null,
      linkedSupplierIds: form.linkedSupplierIds ? form.linkedSupplierIds.split(',').map((x) => x.trim()) : [],
      output: result.output
    });
    alert('Opportunity analysis saved.');
  };

  return <div><h1>Opportunity / RFP Intelligence</h1><div className="card form"><input placeholder="Opportunity title" onChange={(e)=>setForm({...form,title:e.target.value})} /><textarea placeholder="Paste RFP text" onChange={(e)=>setForm({...form,text:e.target.value})} /><input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} /><input placeholder="Link category snapshot id (optional)" onChange={(e)=>setForm({...form,linkedCategorySnapshotId:e.target.value})} /><input placeholder="Link supplier ids comma-separated (optional)" onChange={(e)=>setForm({...form,linkedSupplierIds:e.target.value})} /><div className="row"><button className="btn" onClick={analyze}>Analyze Opportunity</button>{result && <button className="btn ghost" onClick={save}>Save Analysis</button>}</div></div>{result && <section className="card"><h3>{result.output.summary}</h3><p><b>Requirements:</b> {result.output.requirements.join(' | ')}</p><p><b>Compliance Flags:</b> {result.output.complianceFlags.join(' | ')}</p><p><b>Risk Factors:</b> {result.output.risks.join(' | ')}</p><p><b>Effort:</b> {result.output.effortEstimate}</p><p><b>Bid/No-Bid:</b> {result.output.bidRecommendation}</p><p><b>Next Steps:</b> {result.output.nextSteps.join(' | ')}</p></section>}</div>;
}

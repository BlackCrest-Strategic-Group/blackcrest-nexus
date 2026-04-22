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
    const safeOutput = result && typeof result.output === 'object' && result.output !== null ? result.output : {};
    await api.post('/opportunity-intelligence/save', {
      title: form.title,
      linkedCategorySnapshotId: form.linkedCategorySnapshotId || null,
      linkedSupplierIds: form.linkedSupplierIds ? form.linkedSupplierIds.split(',').map((x) => x.trim()) : [],
      output: safeOutput
    });
    alert('Opportunity analysis saved.');
  };

  const output = result && typeof result.output === 'object' && result.output !== null ? result.output : null;
  const safeRequirements = Array.isArray(output?.requirements) ? output.requirements : [];
  const safeComplianceFlags = Array.isArray(output?.complianceFlags) ? output.complianceFlags : [];
  const safeRisks = Array.isArray(output?.risks) ? output.risks : [];
  const safeNextSteps = Array.isArray(output?.nextSteps) ? output.nextSteps : [];

  return <div><h1>Opportunity / RFP Intelligence</h1><div className="card form"><input placeholder="Opportunity title" onChange={(e)=>setForm({...form,title:e.target.value})} /><textarea placeholder="Paste RFP text" onChange={(e)=>setForm({...form,text:e.target.value})} /><input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} /><input placeholder="Link category snapshot id (optional)" onChange={(e)=>setForm({...form,linkedCategorySnapshotId:e.target.value})} /><input placeholder="Link supplier ids comma-separated (optional)" onChange={(e)=>setForm({...form,linkedSupplierIds:e.target.value})} /><div className="row"><button className="btn" onClick={analyze}>Analyze Opportunity</button>{result && <button className="btn ghost" onClick={save}>Save Analysis</button>}</div></div>{output && <section className="card"><h3>{output.summary || 'Analysis complete'}</h3><p><b>Requirements:</b> {safeRequirements.join(' | ')}</p><p><b>Compliance Flags:</b> {safeComplianceFlags.join(' | ')}</p><p><b>Risk Factors:</b> {safeRisks.join(' | ')}</p><p><b>Effort:</b> {output.effortEstimate || 'N/A'}</p><p><b>Bid/No-Bid:</b> {output.bidRecommendation || 'Pending review'}</p><p><b>Next Steps:</b> {safeNextSteps.join(' | ')}</p></section>}</div>;
}

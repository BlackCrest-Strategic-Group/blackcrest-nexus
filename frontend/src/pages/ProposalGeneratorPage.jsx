import React, { useMemo, useState } from 'react';
import { proposalBuilderApi } from '../utils/api';

const emptyRow = { partNumber: '', description: '', quantity: 1, cost: 0, markup: 0.2, mfgLeadTime: 0, deliveryLeadTime: 0 };

export default function ProposalGeneratorPage() {
  const [lineItems, setLineItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [proposal, setProposal] = useState(null);

  const totals = useMemo(() => {
    const rows = lineItems.map((item) => ({ ...item, sellPrice: item.cost * (1 + item.markup), extendedPrice: item.quantity * item.cost * (1 + item.markup), totalLeadTime: item.mfgLeadTime + item.deliveryLeadTime }));
    return {
      rows,
      totalProposalValue: rows.reduce((a, b) => a + b.extendedPrice, 0),
      maxLeadTime: rows.reduce((a, b) => Math.max(a, b.totalLeadTime), 0)
    };
  }, [lineItems]);

  const onFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await proposalBuilderApi.upload(formData);
    setLineItems(data.lineItems || []);
  };

  const update = (idx, key, value) => setLineItems((prev) => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  const generate = async () => setProposal((await proposalBuilderApi.generate({ lineItems })).data.proposal);
  const pdf = async () => {
    const res = await proposalBuilderApi.pdf({ proposal: proposal || { lineItems: totals.rows, totals } });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'proposal.pdf'; a.click();
  };

  return <div className="p-6 text-slate-100 space-y-4">
    <h1 className="text-2xl font-semibold">AI Proposal Generator</h1>
    <div onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={(e)=>{e.preventDefault();setDragOver(false);onFile(e.dataTransfer.files[0]);}} className={`rounded-2xl border-2 border-dashed p-8 ${dragOver ? 'border-cyan-400 bg-slate-800' : 'border-slate-600 bg-slate-900'}`}>
      <p>Drag & drop CSV/XLSX file here or <input type="file" accept=".csv,.xls,.xlsx" onChange={(e)=>onFile(e.target.files[0])} /></p>
    </div>
    <button className="px-3 py-2 rounded bg-slate-700" onClick={()=>setLineItems((p)=>[...p, {...emptyRow}])}>+ Add line</button>
    <div className="overflow-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800"><tr>{['partNumber','description','quantity','cost','markup','mfgLeadTime','deliveryLeadTime'].map((k)=><th key={k} className="p-2 text-left">{k}</th>)}</tr></thead><tbody>{lineItems.map((r,idx)=><tr key={idx} className="border-t border-slate-700">{Object.keys(emptyRow).map((k)=><td key={k} className="p-1"><input className="w-full bg-slate-900 p-1 rounded" value={r[k]} onChange={(e)=>update(idx,k,['description','partNumber'].includes(k)?e.target.value:Number(e.target.value))} /></td>)}</tr>)}</tbody></table></div>
    <div className="grid md:grid-cols-3 gap-3">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">Total: ${totals.totalProposalValue.toFixed(2)}</div>
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">Lead Time: {totals.maxLeadTime} days</div>
      {totals.totalProposalValue > 100000 && <div className="bg-emerald-900/40 border border-emerald-500 rounded-xl p-4">Funding Opportunity unlocked</div>}
    </div>
    <div className="flex gap-2"><button onClick={generate} className="px-4 py-2 rounded bg-cyan-600">Generate Proposal</button><button onClick={pdf} className="px-4 py-2 rounded bg-indigo-600">Download PDF</button><button onClick={()=>window.alert('Export to Word is available via backend payload transform.')} className="px-4 py-2 rounded bg-slate-700">Export to Word</button></div>
    {proposal && <pre className="bg-slate-950 p-4 rounded-xl text-xs overflow-auto">{JSON.stringify(proposal, null, 2)}</pre>}
  </div>;
}

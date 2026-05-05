import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => { api.get('/api/demo').then((res) => setAnalysis(res.data.analysis)); }, []);

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setAnalysis(res.data.analysis);
  };

  if (!analysis) return <section><div className='page-header'><h1>Loading dashboard…</h1></div></section>;
  return <section>
    <div className='page-header'><h1>Procurement Intelligence Dashboard</h1><p>Alerts, cost savings, supplier performance with drill-down.</p></div>
    <article className='card'><h3>Upload procurement file (CSV/JSON)</h3><input type='file' accept='.csv,.json' onChange={uploadFile} /></article>
    <div className='grid three' style={{marginTop:'1rem'}}>
      <article className='card'><h3>Cost Savings</h3><p className='metric'>${analysis.summary.totalSavingsOpportunity.toLocaleString()}</p></article>
      <article className='card'><h3>Alerts</h3><p className='metric'>{analysis.riskFlags.length}</p></article>
      <article className='card'><h3>Supplier Performance</h3><p className='metric'>{analysis.supplierPerformance.length}</p><p>suppliers scored</p></article>
    </div>

    <article className='card sentinel-panel' style={{ marginTop: '1rem' }}>
      <h3>System Status</h3>
      <p className='status-row'><span className='status-dot active' /> Sentinel Active</p>
      <p>AI Governance: ENABLED</p>
      <p>Data Mode: Read-Only</p>
    </article>

    <div className='grid two' style={{marginTop:'1rem'}}>
      <article className='card'><h3>Risk Alerts</h3><ul>{analysis.riskFlags.map((a, idx)=><li key={idx}><button className='btn ghost' onClick={()=>setSelectedAlert(a)}>{a.supplier}: {a.type}</button></li>)}</ul></article>
      <article className='card'><h3>Drill-down</h3>{selectedAlert ? <p>{selectedAlert.supplier} · {selectedAlert.item} · {selectedAlert.message}</p> : <p>Select an alert to drill down.</p>}</article>
    </div>
  </section>;
}

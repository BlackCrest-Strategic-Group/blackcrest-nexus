import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DemoPage() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => { api.get('/api/demo').then((res) => setData(res.data)); }, []);
  if (!data) return <main className='auth-page'><section className='auth-card'><h2>Loading demo...</h2></section></main>;
  const { analysis } = data;
  return <main className='auth-page'><section className='auth-card' style={{maxWidth:'1000px'}}>
    <h1>Demo Procurement Intelligence Dashboard</h1>
    <p>Cost savings opportunity: <strong>${analysis.summary.totalSavingsOpportunity.toLocaleString()}</strong></p>
    <p>RFQ Activity: {Object.entries(analysis.summary.rfqActivity).map(([k,v])=>`${k}:${v}`).join(' · ')}</p>
    <h3>Alerts</h3><ul>{analysis.riskFlags.map((f,i)=><li key={i}>{f.supplier}: {f.message}</li>)}</ul>
    <h3>Supplier Performance</h3>
    <table><thead><tr><th>Supplier</th><th>Score</th></tr></thead><tbody>{analysis.supplierPerformance.map((s)=><tr key={s.supplier} onClick={()=>setSelected(s)}><td>{s.supplier}</td><td>{s.score}</td></tr>)}</tbody></table>
    {selected && <div><h4>Drill-down: {selected.supplier}</h4><p>On-time: {(selected.avgOnTimeDelivery*100).toFixed(0)}% · Lead time: {selected.avgLeadTimeDays}d</p></div>}
  </section></main>;
}

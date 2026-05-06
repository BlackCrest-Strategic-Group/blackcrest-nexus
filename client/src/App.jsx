import { NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';

const roles = ['BUYER', 'OPERATIONS', 'EXECUTIVE'];

function Dashboard({ role }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`http://localhost:3000/api/nexus/overview?role=${role}`).then(r => r.json()).then(setData); }, [role]);
  const kpis = useMemo(() => data ? ({ atRiskSuppliers: data.suppliers.filter(s => s.riskScore > 65).length, delayedPOs: data.purchaseOrders.filter(p => p.status.includes('LATE')).length, blockedJobs: data.jobs.filter(j => j.materialStatus === 'SHORTAGE').length }) : {}, [data]);
  if (!data) return <div className='p-6 text-zinc-200'>Loading operational graph...</div>;
  return <div className='p-6 space-y-6'>
    <div className='grid md:grid-cols-3 gap-4'>{Object.entries(kpis).map(([k,v]) => <div key={k} className='bg-zinc-900 border border-amber-600/30 p-4 rounded'><div className='text-xs text-zinc-400'>{k}</div><div className='text-2xl text-amber-300'>{v}</div></div>)}</div>
    <div className='grid md:grid-cols-2 gap-4'>
      <div className='bg-zinc-900 p-4 rounded border border-zinc-700 h-72'><h3>Supplier Risk Radar</h3><ResponsiveContainer><BarChart data={data.suppliers}><XAxis dataKey='supplierName'/><YAxis/><Tooltip/><Bar dataKey='riskScore' fill='#f59e0b'/></BarChart></ResponsiveContainer></div>
      <div className='bg-zinc-900 p-4 rounded border border-zinc-700 h-72'><h3>Lead Time Trend</h3><ResponsiveContainer><LineChart data={data.suppliers}><XAxis dataKey='supplierName'/><YAxis/><Tooltip/><Line dataKey='leadTimeAverage' stroke='#fcd34d'/></LineChart></ResponsiveContainer></div>
    </div>
    <div className='bg-zinc-900 p-4 rounded border border-zinc-700'><h3>Active Alerts</h3>{data.alerts.map(a => <div key={a.id} className='border-b border-zinc-700 py-2'><div className='text-amber-300'>{a.alertType} ({a.severity})</div><div className='text-zinc-300 text-sm'>{a.aiSummary}</div></div>)}</div>
  </div>;
}

export default function App(){
  const [role, setRole] = useState('EXECUTIVE');
  return <div className='min-h-screen bg-zinc-950 text-zinc-100'>
    <header className='border-b border-zinc-800 p-4 flex justify-between items-center'><div className='font-semibold text-amber-400'>BlackCrest Nexus</div><select value={role} onChange={e=>setRole(e.target.value)} className='bg-zinc-900 border border-zinc-700 p-2'>{roles.map(r=><option key={r}>{r}</option>)}</select></header>
    <nav className='p-3 border-b border-zinc-800 space-x-4'><NavLink to='/'>Command Center</NavLink><NavLink to='/workflows'>Workflows</NavLink></nav>
    <Routes>
      <Route path='/' element={<Dashboard role={role}/>}/>
      <Route path='/workflows' element={<div className='p-6'><button className='bg-amber-500 text-black px-4 py-2 rounded' onClick={async()=>{const d=await fetch('http://localhost:3000/api/nexus/overview').then(r=>r.json()); await fetch(`http://localhost:3000/api/nexus/workflows/supplier-escalation/${d.suppliers[0].id}`,{method:'POST'}); location.reload();}}>Run Supplier Risk Escalation</button></div>} />
    </Routes>
  </div>
}

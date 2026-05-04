import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Marketplace() {
  const [suppliers, setSuppliers] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', quantity: '' });
  const [response, setResponse] = useState({ supplierName: '', message: '' });

  const load = async () => {
    const [s, r] = await Promise.all([api.get('/api/marketplace/suppliers'), api.get('/api/marketplace/rfqs')]);
    setSuppliers(s.data); setRfqs(r.data);
  };
  useEffect(() => { load(); }, []);

  const postRfq = async (e) => { e.preventDefault(); await api.post('/api/marketplace/rfqs', form); setForm({ title:'', category:'', quantity:''}); load(); };
  const respond = async (rfqId) => { await api.post(`/api/marketplace/rfqs/${rfqId}/respond`, response); setResponse({ supplierName:'', message:''}); alert('Response submitted'); };

  return <section>
    <div className='page-header'><h1>Marketplace MVP</h1></div>
    <div className='grid two'>
      <article className='card'><h3>Post RFQ</h3><form onSubmit={postRfq}><input className='input' placeholder='Title' value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/><input className='input' placeholder='Category' value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}/><input className='input' placeholder='Quantity' value={form.quantity} onChange={(e)=>setForm({...form,quantity:e.target.value})}/><button className='btn'>Post RFQ</button></form></article>
      <article className='card'><h3>Browse Suppliers</h3><ul>{suppliers.map((s)=><li key={s.id}>{s.name} · {s.category} · ⭐{s.rating}</li>)}</ul></article>
    </div>
    <article className='card' style={{marginTop:'1rem'}}><h3>Open RFQs</h3>{rfqs.map((r)=><div key={r.id} style={{borderBottom:'1px solid #333',padding:'8px 0'}}><strong>{r.title}</strong> ({r.category})
      <div><input className='input' placeholder='Supplier name' value={response.supplierName} onChange={(e)=>setResponse({...response,supplierName:e.target.value})}/><input className='input' placeholder='Response note' value={response.message} onChange={(e)=>setResponse({...response,message:e.target.value})}/><button className='btn ghost' onClick={()=>respond(r.id)}>Respond to RFQ</button></div>
    </div>)}</article>
  </section>;
}

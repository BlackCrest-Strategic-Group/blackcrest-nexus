import React, { useEffect, useState } from 'react';
import api from '../services/api';

const statuses = ['stable', 'watch', 'risk', 'action needed', 'promising'];

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemType: 'category', itemId: '', label: '', status: 'watch', notes: '' });
  const load = () => api.get('/watchlist').then((res) => {
    const safeItems = Array.isArray(res.data) ? res.data : [];
    setItems(safeItems);
  });
  useEffect(load, []);
  const save = async () => { await api.post('/watchlist', form); setForm({ ...form, itemId: '', label: '', notes: '' }); load(); };

  const safeStatuses = Array.isArray(statuses) ? statuses : [];
  const safeItems = Array.isArray(items) ? items : [];

  return <div><h1>Watchlist System</h1><div className="card form"><select onChange={(e)=>setForm({...form,itemType:e.target.value})}><option>category</option><option>supplier</option><option>opportunity</option></select><input placeholder="item id" value={form.itemId} onChange={(e)=>setForm({...form,itemId:e.target.value})} /><input placeholder="label" value={form.label} onChange={(e)=>setForm({...form,label:e.target.value})} /><select onChange={(e)=>setForm({...form,status:e.target.value})}>{safeStatuses.map((s)=><option key={s}>{s}</option>)}</select><input placeholder="notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} /><button className="btn" onClick={save}>Add to Watchlist</button></div><div className="grid two">{safeItems.map((i)=><article className="card" key={i?._id || i?.label}><h3>{i?.label || 'Watch item'}</h3><p>{i?.itemType || 'unknown'} • {i?.status || 'unknown'}</p><p>{i?.notes || ''}</p></article>)}</div></div>;
}

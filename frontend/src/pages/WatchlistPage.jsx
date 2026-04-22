import React, { useEffect, useState } from 'react';
import api from '../services/api';

const statuses = ['stable', 'watch', 'risk', 'action needed', 'promising'];
const FALLBACK_ITEMS = [
  { _id: 'demo-1', label: 'VA telehealth recompete', itemType: 'opportunity', status: 'promising', notes: 'Strong fit with incumbent partner strategy.' },
  { _id: 'demo-2', label: 'Managed cloud subcontractor', itemType: 'supplier', status: 'watch', notes: 'Monitor SLA performance and delivery staffing.' }
];

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemType: 'category', itemId: '', label: '', status: 'watch', notes: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await api.get('/watchlist');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load watchlist. Showing fallback entries for demo readiness.');
      setItems(FALLBACK_ITEMS);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.label.trim()) {
      setError('Label is required.');
      return;
    }

    try {
      await api.post('/watchlist', form);
      setForm((prev) => ({ ...prev, itemId: '', label: '', notes: '' }));
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save watchlist item.');
    }
  };

  const safeStatuses = Array.isArray(statuses) ? statuses : [];
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div>
      <h1>Watchlist System</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card form">
        <select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
          <option value="category">category</option>
          <option value="supplier">supplier</option>
          <option value="opportunity">opportunity</option>
        </select>
        <input placeholder="item id" value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })} />
        <input placeholder="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {safeStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn" onClick={save}>Add to Watchlist</button>
      </div>
      <div className="grid two">
        {safeItems.map((i) => (
          <article className="card" key={i?._id || i?.label}>
            <h3>{i?.label || 'Watch item'}</h3>
            <p>{i?.itemType || 'unknown'} • {i?.status || 'unknown'}</p>
            <p>{i?.notes || ''}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

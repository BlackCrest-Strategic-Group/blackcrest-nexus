import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const initialSupplier = { name: '', category: '', location: '', notes: '' };
const initialFollowUp = { supplierName: '', followUpDate: '', channel: 'email', status: 'open', notes: '' };

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [spendByYear, setSpendByYear] = useState([]);
  const [poStatus, setPoStatus] = useState({ openPos: 0, latePos: 0, totalRows: 0 });
  const [supplierForm, setSupplierForm] = useState(initialSupplier);
  const [followUpForm, setFollowUpForm] = useState(initialFollowUp);

  async function loadSupplierWorkspace() {
    const { data } = await api.get('/api/procurement-intelligence/suppliers');
    setSuppliers(data.suppliers || []);
    setFollowUps(data.followUps || []);
    setSpendByYear(data.spendByYear || []);
    setPoStatus(data.poStatus || { openPos: 0, latePos: 0, totalRows: 0 });
  }

  useEffect(() => {
    loadSupplierWorkspace();
  }, []);

  async function saveSupplier(event) {
    event.preventDefault();
    await api.post('/api/procurement-intelligence/suppliers', supplierForm);
    setSupplierForm(initialSupplier);
    await loadSupplierWorkspace();
  }

  async function saveFollowUp(event) {
    event.preventDefault();
    await api.post('/api/procurement-intelligence/suppliers/follow-ups', followUpForm);
    setFollowUpForm(initialFollowUp);
    await loadSupplierWorkspace();
  }

  return (
    <section>
      <SeoHead title="Supplier Intelligence | BlackCrest OS" description="Supplier profiles, follow-ups, and PO status analytics." canonicalPath="/suppliers" />
      <div className="page-header">
        <h1>Supplier Form & Performance Workspace</h1>
        <p>Track supplier records with open POs, late POs, annual spend, and follow-up history.</p>
      </div>

      <div className="grid three" style={{ marginBottom: 12 }}>
        <article className="card"><h3>Open POs</h3><p className="metric-label">{poStatus.openPos || 0}</p></article>
        <article className="card"><h3>Late POs</h3><p className="metric-label">{poStatus.latePos || 0}</p></article>
        <article className="card"><h3>Rows Ingested</h3><p className="metric-label">{poStatus.totalRows || 0}</p></article>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>Add Supplier</h3>
          <form onSubmit={saveSupplier} className="stack">
            <input className="input" placeholder="Supplier name" value={supplierForm.name} onChange={(e) => setSupplierForm((s) => ({ ...s, name: e.target.value }))} required />
            <input className="input" placeholder="Category" value={supplierForm.category} onChange={(e) => setSupplierForm((s) => ({ ...s, category: e.target.value }))} required />
            <input className="input" placeholder="Location" value={supplierForm.location} onChange={(e) => setSupplierForm((s) => ({ ...s, location: e.target.value }))} />
            <textarea className="input" placeholder="Notes" value={supplierForm.notes} onChange={(e) => setSupplierForm((s) => ({ ...s, notes: e.target.value }))} />
            <button className="btn" type="submit">Save Supplier</button>
          </form>
        </article>

        <article className="card">
          <h3>Log Follow-up</h3>
          <form onSubmit={saveFollowUp} className="stack">
            <input className="input" placeholder="Supplier name" value={followUpForm.supplierName} onChange={(e) => setFollowUpForm((s) => ({ ...s, supplierName: e.target.value }))} required />
            <input className="input" type="date" value={followUpForm.followUpDate} onChange={(e) => setFollowUpForm((s) => ({ ...s, followUpDate: e.target.value }))} />
            <select className="input" value={followUpForm.channel} onChange={(e) => setFollowUpForm((s) => ({ ...s, channel: e.target.value }))}>
              <option value="email">Email</option><option value="call">Call</option><option value="meeting">Meeting</option>
            </select>
            <select className="input" value={followUpForm.status} onChange={(e) => setFollowUpForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="open">Open</option><option value="closed">Closed</option><option value="pending">Pending</option>
            </select>
            <textarea className="input" placeholder="Follow-up notes" value={followUpForm.notes} onChange={(e) => setFollowUpForm((s) => ({ ...s, notes: e.target.value }))} />
            <button className="btn" type="submit">Save Follow-up</button>
          </form>
        </article>
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <article className="card">
          <h3>Spend by Year</h3>
          <ul>
            {spendByYear.map((item) => <li key={item.year}>{item.year}: ${Math.round(item.spend).toLocaleString()}</li>)}
            {!spendByYear.length ? <li>No uploaded spend data yet.</li> : null}
          </ul>
        </article>
        <article className="card">
          <h3>Follow-up History</h3>
          <ul>
            {followUps.map((f) => <li key={f._id}>{f.supplierName} · {f.followUpDate || 'No date'} · {f.channel} · {f.status}</li>)}
            {!followUps.length ? <li>No follow-ups logged yet.</li> : null}
          </ul>
        </article>
      </div>

      <article className="card" style={{ marginTop: 12 }}>
        <h3>Supplier Registry</h3>
        <ul>
          {suppliers.map((supplier) => <li key={supplier._id}>{supplier.name} · {supplier.category} · {supplier.location || 'No location'}</li>)}
          {!suppliers.length ? <li>No suppliers added yet.</li> : null}
        </ul>
      </article>
    </section>
  );
}

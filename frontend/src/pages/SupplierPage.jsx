import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

export default function SupplierPage() {
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await api.get('/api/sentinel/suppliers', { params: { q, risk } });
      if (mounted) setSuppliers(data.suppliers || []);
    })();
    return () => { mounted = false; };
  }, [q, risk]);

  return (
    <section>
      <SeoHead title="Supplier Intelligence | BlackCrest OS" description="Supplier profiles, scorecards, risk, and performance intelligence." canonicalPath="/suppliers" />
      <div className="page-header"><h1>Supplier Intelligence</h1><p>Searchable supplier command center with live risk and performance KPIs.</p></div>
      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <input className="input" placeholder="Search supplier, category, or region" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 280, flex: 1 }} />
        <select className="input" value={risk} onChange={(e) => setRisk(e.target.value)} style={{ width: 180 }}>
          <option value="">All risk levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div className="grid three">
        {suppliers.map((supplier) => (
          <article className="card" key={supplier.id}>
            <h3>{supplier.name}</h3>
            <p>{supplier.category} · {supplier.region}</p>
            <ul>
              <li>Risk: {supplier.riskLevel}</li>
              <li>Supplier Score: {supplier.score}</li>
              <li>On-Time Delivery: {supplier.onTimeDelivery}%</li>
              <li>Quality Rating: {supplier.qualityRating}%</li>
              <li>Avg Lead Time: {supplier.avgLeadTimeDays} days</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

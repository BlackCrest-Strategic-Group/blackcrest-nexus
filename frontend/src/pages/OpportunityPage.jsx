import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const fmtUsd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

export default function OpportunityPage() {
  const [naics, setNaics] = useState('');
  const [pursuit, setPursuit] = useState('');
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await api.get('/api/sentinel/opportunities', { params: { naics, pursuit } });
      if (mounted) setOpportunities(data.opportunities || []);
    })();
    return () => { mounted = false; };
  }, [naics, pursuit]);

  return (
    <section>
      <SeoHead title="Opportunity Pipeline | BlackCrest OS" description="Operational opportunity tracking with fit scoring and pursuit recommendations." canonicalPath="/opportunities" />
      <div className="page-header"><h1>Opportunity Pipeline</h1><p>Track SAM-aligned opportunities, pursuit status, owners, and fit scores.</p></div>

      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <input className="input" placeholder="Filter by NAICS (e.g. 541512)" value={naics} onChange={(e) => setNaics(e.target.value)} style={{ minWidth: 280, flex: 1 }} />
        <select className="input" value={pursuit} onChange={(e) => setPursuit(e.target.value)} style={{ width: 200 }}>
          <option value="">All pursuit statuses</option>
          <option value="Qualify">Qualify</option>
          <option value="Pursue">Pursue</option>
          <option value="Watch">Watch</option>
          <option value="No-Bid">No-Bid</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }} className="card">
        <table className="table" style={{ width: '100%' }}>
          <thead><tr><th>Opportunity</th><th>Agency</th><th>NAICS</th><th>Due Date</th><th>Fit</th><th>Pursuit</th><th>Value</th><th>Owner</th></tr></thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id}>
                <td>{opp.title}</td><td>{opp.agency}</td><td>{opp.naics}</td><td>{opp.dueDate}</td><td>{opp.fitScore}</td><td>{opp.pursuit}</td><td>{fmtUsd(opp.estimatedValue)}</td><td>{opp.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

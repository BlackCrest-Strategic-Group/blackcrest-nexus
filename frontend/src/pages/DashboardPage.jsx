import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const roles = ['CEO', 'Procurement Director', 'Category Manager', 'Sourcing Manager', 'Buyer', 'Purchasing Assistant'];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('CEO');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dashboardRes, demoRes] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/investor-demo/summary')
        ]);
        if (mounted) {
          setDashboard(dashboardRes.data);
          setDemo(demoRes.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const roleNotes = useMemo(() => ({
    CEO: 'Board-level rollup across spend, leakage, risk, and opportunity value.',
    'Procurement Director': 'Supplier scorecards, buyer workload, open sourcing actions, and watchlist pipeline.',
    'Category Manager': 'Spend concentration, consolidation opportunities, variance alerts, and alternate suppliers.',
    'Sourcing Manager': 'RFP queue, bid/no-bid scoring, compliance checklist, and shortlist management.',
    Buyer: 'PO and blanket PO builder, validation issues, grouping recommendations, CSV and ERP previews.',
    'Purchasing Assistant': 'Upload queue, missing columns, duplicates, cleanup suggestions, and buyer-ready output.'
  }), []);

  if (loading) return <section><div className="page-header"><h1>Loading dashboard…</h1></div></section>;

  return (
    <section>
      <SeoHead title="Dashboard | BlackCrest OS" description="Role-based procurement operations dashboard." canonicalPath="/dashboard" />
      <div className="page-header">
        <h1>Executive Role-Based Dashboard</h1>
        <p>{dashboard?.personalization?.company || 'Enterprise Workspace'} · Demo mode defaults to public/synthetic data.</p>
      </div>

      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {roles.map((role) => <button key={role} className={`btn ${selectedRole === role ? '' : 'ghost'}`} onClick={() => setSelectedRole(role)}>{role}</button>)}
      </div>

      <article className="card" style={{ marginTop: '1rem' }}>
        <h3>{selectedRole} View</h3>
        <p>{roleNotes[selectedRole]}</p>
      </article>

      <div className="grid four" style={{ marginTop: '1rem' }}>
        <article className="card"><p className="metric-label">Total Spend Under Review</p><h3>${demo?.kpis?.totalSpendUnderReview?.toLocaleString() || 0}</h3></article>
        <article className="card"><p className="metric-label">Estimated Margin Leakage</p><h3>${demo?.kpis?.estimatedMarginLeakage?.toLocaleString() || 0}</h3></article>
        <article className="card"><p className="metric-label">Supplier Risk Exposure</p><h3>{demo?.kpis?.supplierRiskExposure || 0}%</h3></article>
        <article className="card"><p className="metric-label">Open Opportunity Value</p><h3>${demo?.kpis?.openOpportunityValue?.toLocaleString() || 0}</h3></article>
      </div>

      <div className="grid two" style={{ marginTop: '1rem' }}>
        <article className="card"><h3>Investor Story</h3><p>{demo?.narrative}</p></article>
        <article className="card"><h3>Data Handling</h3><p>Confidential customer data is only processed when users intentionally upload files or connect approved systems.</p></article>
      </div>
    </section>
  );
}

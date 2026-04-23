import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const roles = ['CEO', 'Procurement Director', 'Category Manager', 'Sourcing Manager', 'Buyer', 'Purchasing Assistant'];

function AnimatedCounter({ value = 0, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <h3 className="kpi-value">{prefix}{display.toLocaleString()}{suffix}</h3>;
}

const severityByRole = {
  CEO: 'critical',
  'Procurement Director': 'high',
  'Category Manager': 'high',
  'Sourcing Manager': 'medium',
  Buyer: 'medium',
  'Purchasing Assistant': 'low'
};

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

  const timeline = [
    'Q1: Ingested PO history and supplier master files from sample data.',
    'Q2: Margin leak engine flagged concentrated spend and price variance.',
    'Q3: Supplier recommendation engine identified diversified alternatives.',
    'Q4: RFP intelligence converted narrative requirements into action lists.'
  ];

  if (loading) return <section><div className="page-header"><h1>Loading dashboard…</h1></div></section>;

  return (
    <section className="dashboard-transition">
      <SeoHead title="Dashboard | BlackCrest OS" description="Role-based procurement operations dashboard." canonicalPath="/dashboard" />
      <div className="page-header">
        <h1>Executive Role-Based Dashboard</h1>
        <p>{dashboard?.personalization?.company || 'Enterprise Workspace'} · Dark-mode intelligence workspace.</p>
      </div>

      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {roles.map((role) => <button key={role} className={`btn ${selectedRole === role ? '' : 'ghost'}`} onClick={() => setSelectedRole(role)}>{role}</button>)}
      </div>

      <article className="card glass-panel" style={{ marginTop: '1rem' }}>
        <h3>{selectedRole} View <span className={`severity-chip ${severityByRole[selectedRole]}`}>{severityByRole[selectedRole]}</span></h3>
        <p>{roleNotes[selectedRole]}</p>
      </article>

      <div className="grid four" style={{ marginTop: '1rem' }}>
        <article className="card glass-panel"><p className="metric-label">Total Spend Under Review</p><AnimatedCounter value={demo?.kpis?.totalSpendUnderReview || 0} prefix="$" /></article>
        <article className="card glass-panel"><p className="metric-label">Estimated Margin Leakage</p><AnimatedCounter value={demo?.kpis?.estimatedMarginLeakage || 0} prefix="$" /></article>
        <article className="card glass-panel"><p className="metric-label">Supplier Risk Exposure</p><AnimatedCounter value={demo?.kpis?.supplierRiskExposure || 0} suffix="%" /></article>
        <article className="card glass-panel"><p className="metric-label">Open Opportunity Value</p><AnimatedCounter value={demo?.kpis?.openOpportunityValue || 0} prefix="$" /></article>
      </div>

      <div className="grid two" style={{ marginTop: '1rem' }}>
        <article className="card glass-panel">
          <h3>Procurement Timeline</h3>
          <div className="timeline">
            {timeline.map((event) => <div key={event} className="timeline-item">{event}</div>)}
          </div>
        </article>
        <article className="card glass-panel insight-feed">
          <h3>AI Insight Feed</h3>
          <ul className="timeline-list">
            <li>Top 5 margin leak alerts prioritized with role-based ownership.</li>
            <li>Supplier recommendation confidence rose after category normalization.</li>
            <li>Blanket PO candidate groups auto-identified from recurring line items.</li>
            <li>RFP bid/no-bid score indicates conditional pursuit for demo opportunity.</li>
            <li>No customer confidential data in current demo workspace.</li>
          </ul>
        </article>
      </div>

      <div className="grid two" style={{ marginTop: '1rem' }}>
        <article className="card glass-panel"><h3>Investor Story</h3><p>{demo?.narrative}</p></article>
        <article className="card glass-panel">
          <h3>Guided Next Actions</h3>
          <ul>
            <li>Open Report Center and generate the Executive Summary packet.</li>
            <li>Review ERP Connector Center for read-only connector posture.</li>
            <li>Upload sample spreadsheet in Blanket PO Builder for buyer workflow demo.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

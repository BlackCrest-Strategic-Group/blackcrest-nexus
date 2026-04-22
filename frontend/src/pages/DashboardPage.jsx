import React from 'react';
import SeoHead from '../components/SeoHead';

const kpis = [
  ['Active sourcing projects', '24'],
  ['Qualified opportunities', '67'],
  ['Supplier risk alerts', '12'],
  ['Spend under management', '$148M']
];

export default function DashboardPage() {
  return (
    <section>
      <SeoHead title="Dashboard | BlackCrest OS" description="Executive procurement dashboard for sourcing, supplier risk, and opportunity intelligence." canonicalPath="/dashboard" />
      <div className="page-header"><h1>Executive Dashboard</h1><p>Unified procurement command center with KPI, risk, and opportunity signals.</p></div>
      <div className="grid four">{kpis.map(([label, value]) => <article key={label} className="card"><p className="metric-label">{label}</p><h3>{value}</h3></article>)}</div>
      <div className="grid two">
        <article className="card"><h3>Opportunity pipeline</h3><div className="chart-bars">{[88,70,56,49,40].map((n,i)=><span key={i} style={{height:`${n}%`}} />)}</div></article>
        <article className="card"><h3>Supplier risk indicators</h3><ul><li>2 critical logistics disruptions</li><li>4 medium financial stress alerts</li><li>6 contracts need mitigation updates</li></ul></article>
      </div>
      <div className="grid two">
        <article className="card"><h3>AI insights panel</h3><p>Recommend dual-source strategy for high-volatility electronics category. Estimated continuity uplift: 14%.</p></article>
        <article className="card"><h3>Recent intelligence activity</h3><p>Sentinel captured 118 market signals and generated 9 decision-ready recommendations in the last 24 hours.</p></article>
      </div>
    </section>
  );
}

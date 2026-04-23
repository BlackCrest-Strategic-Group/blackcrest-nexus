import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

export default function SentinelLandingPage() {
  return (
    <main className="marketing-page">
      <SeoHead title="Sentinel | AI Procurement Intelligence & Risk Monitoring" description="Standalone Sentinel platform for procurement risk monitoring, supplier intelligence, and executive alerts." canonicalPath="/sentinel" />
      <section className="hero">
        <h1>SENTINEL</h1>
        <p>AI Procurement Intelligence & Risk Monitoring Engine</p>
        <p>Operational monitoring for sourcing teams, procurement leadership, and supply chain decision makers.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn" to="/register">Start Sentinel Trial</Link>
          <Link className="btn btn-secondary" to="/intelligence">Open Command Center</Link>
        </div>
      </section>

      <section className="section">
        <h2>Command center capabilities</h2>
        <div className="grid three">
          <article className="card"><h3>Risk Monitoring Dashboard</h3><p>Supplier risk scoring, contract expiration alerts, sourcing bottlenecks, and disruption indicators.</p></article>
          <article className="card"><h3>Procurement Signals Engine</h3><p>Detect quote inconsistencies, velocity slowdowns, pricing anomalies, and milestone risks.</p></article>
          <article className="card"><h3>Executive Alert Center</h3><p>Critical-to-informational alerts with acknowledgement, filtering, and resolution tracking workflows.</p></article>
        </div>
      </section>

      <section className="section">
        <h2>Built standalone or embedded</h2>
        <p>Sentinel runs as an independent SaaS platform or as a fully integrated BlackCrest AI module with shared authentication and routing controls.</p>
      </section>
    </main>
  );
}

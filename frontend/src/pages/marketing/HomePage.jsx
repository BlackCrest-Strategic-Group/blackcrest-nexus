import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';

const platformModules = [
  {
    title: 'Procurement Intelligence',
    description: 'Supplier visibility, sourcing workflows, RFQ management, operational procurement dashboards, and ERP-ready intelligence.',
    path: '/procurement-intelligence'
  },
  {
    title: 'Truth Serum',
    description: 'Operational analytics, predictive insight, KPI intelligence, anomaly detection, and AI-powered recommendations.',
    path: '/truth-serum'
  },
  {
    title: 'Sentinel',
    description: 'Enterprise governance, AI containment, audit trails, role-based controls, and operational security oversight.',
    path: '/sentinel'
  }
];

const insights = [
  'Manufacturing Procurement Trends',
  'Supplier Risk & Continuity',
  'Industrial AI Governance',
  'Operational Visibility for Manufacturers',
  'ERP Modernization & Data Intelligence',
  'Global Sourcing Strategy'
];

export default function HomePage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="BlackCrest Platform | Industrial Intelligence for Modern Operators"
        description="BlackCrest combines procurement intelligence, operational analytics, supplier visibility, and AI governance into one modular industrial intelligence ecosystem."
        canonicalPath="/"
      />
      <main>
        <section className="hero-section container enterprise-hero" data-testid="landing-hero">
          <p className="eyebrow">BLACKCREST PLATFORM</p>
          <h1>Industrial Intelligence for Modern Operators.</h1>
          <p>
            BlackCrest helps manufacturers, procurement teams, and operational leaders reduce friction, improve supplier visibility,
            and make faster decisions through procurement intelligence, operational analytics, and enterprise AI governance.
          </p>
          <p>
            Built for the businesses that actually build things. Enterprise-level visibility without enterprise-level complexity.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Link className="btn" to="/features">Explore Platform</Link>
            <Link className="btn ghost" to="/procurement-intelligence">Procurement Intelligence</Link>
            <Link className="btn ghost" to="/truth-serum">Truth Serum</Link>
            <Link className="btn ghost" to="/sentinel">Sentinel</Link>
          </div>
          <div style={{ marginTop: 10 }}><Link data-testid="landing-signin" to="/login">Platform Login</Link></div>
        </section>

        <section className="container section-grid capability-grid">
          {platformModules.map((module) => (
            <article key={module.title} className="marketing-card">
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <Link className="btn ghost" to={module.path}>Explore Module</Link>
            </article>
          ))}
        </section>

        <section className="container marketing-card">
          <h2>Built for Real Operational Environments</h2>
          <p>
            BlackCrest was designed around real procurement, sourcing, supplier management, and manufacturing workflows.
            From RFQ analysis and supplier intelligence to operational governance and executive reporting, the platform focuses on practical operational outcomes.
          </p>
        </section>

        <section className="container marketing-card">
          <h2>BlackCrest Insights</h2>
          <p>Daily operational intelligence, procurement strategy, manufacturing technology, and supplier visibility content.</p>
          <div className="section-grid">
            {insights.map((title) => (
              <article key={title} className="marketing-card">
                <h3>{title}</h3>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link className="btn" to="/insights">View Insights</Link>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}

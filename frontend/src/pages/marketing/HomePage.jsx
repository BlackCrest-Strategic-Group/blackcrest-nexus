import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';

const sections = [
  'Built for every procurement level',
  'RFP intelligence',
  'Margin leak detection',
  'Blanket PO builder',
  'Supplier recommendation engine',
  'ERP-ready architecture',
  'Public/synthetic demo by default',
  'Customer-controlled data security'
];

export default function HomePage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Procurement Intelligence for Teams That Can’t Afford Blind Spots"
        description="BlackCrest AI turns RFPs, supplier data, purchase history, and ERP exports into executive decisions, buyer actions, margin leak alerts, and sourcing recommendations."
        canonicalPath="/"
      />
      <main>
        <section className="hero-section container enterprise-hero" data-testid="landing-hero">
          <p className="eyebrow">PROCUREMENT INTELLIGENCE OPERATING SYSTEM</p>
          <h1>Procurement Intelligence for Teams That Can’t Afford Blind Spots.</h1>
          <p>BlackCrest AI turns RFPs, supplier data, purchase history, and ERP exports into executive decisions, buyer actions, margin leak alerts, and sourcing recommendations.</p>
          <p><strong>Default demo mode uses public/sample/synthetic data only.</strong> Customer confidential data is ingested only when the customer intentionally uploads files or connects approved systems.</p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Link className="btn" to="/investor-demo">Launch Investor Demo</Link>
            <Link className="btn ghost" to="/opportunities">Analyze RFP</Link>
            <Link className="btn ghost" to="/blanket-po-builder">Upload PO Spreadsheet</Link>
            <Link className="btn ghost" to="/erp-connector-center">View ERP Connector Center</Link>
            <Link className="btn ghost" to="/report-center">Generate Executive Report</Link>
          </div>
          <div style={{ marginTop: 10 }}><Link data-testid="landing-signin" to="/login">Sign in</Link></div>
        </section>

        <section className="container section-grid capability-grid">
          {sections.map((title) => <article key={title} className="marketing-card"><h2>{title}</h2></article>)}
        </section>

        <section className="container marketing-card">
          <h2>Investor/demo CTA</h2>
          <p>Load a full narrative demo: “BlackCrest identifies $428K in potential leakage, detects supplier concentration risk, recommends alternate suppliers, turns spreadsheet chaos into blanket PO structure, and converts RFPs into executive-ready decisions.”</p>
          <Link className="btn" to="/investor-demo">Load Investor Demo</Link>
        </section>
      </main>
    </MarketingLayout>
  );
}

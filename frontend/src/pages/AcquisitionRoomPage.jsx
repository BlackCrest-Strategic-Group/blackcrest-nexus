import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const metrics = [
  ['Strategic value target', '$1.2M'],
  ['Commercial paths', '5'],
  ['Buyer profiles', '6'],
  ['ERP posture', 'Read-only / customer-controlled'],
  ['Launch window', '30-90 days'],
  ['Asset type', 'Procurement intelligence foundation']
];

const modules = [
  ['Procurement Intelligence', 'Supplier visibility, sourcing workflows, opportunity qualification, purchasing dashboards, and buyer-ready decision support.'],
  ['Truth Serum', 'Operational analytics for margin leakage, late delivery exposure, supplier risk, recovery opportunities, and executive recommendations.'],
  ['Sentinel', 'Governance, audit visibility, data boundaries, role-based access, clean-room posture, and enterprise-safe AI controls.']
];

const buyerTypes = [
  'ERP implementation firms',
  'Procurement consultancies',
  'GovCon advisory firms',
  'Supply-chain software vendors',
  'Manufacturing tech integrators',
  'Private buyers building vertical AI products'
];

const assetStack = [
  'React/Vite frontend with buyer-facing module views',
  'Node/Express backend with route-based product architecture',
  'MongoDB/Mongoose persistence model',
  'JWT authentication and role-based access foundation',
  'Stripe billing framework',
  'CSV/ERP-style procurement data analysis engine',
  'Supplier risk, margin leakage, late delivery, and buyer-action logic',
  'Roadmap for ERP connectors, white-label deployment, and enterprise licensing'
];

export default function AcquisitionRoomPage() {
  return (
    <main className="landing-page acquisition-room">
      <SeoHead title="BlackCrest Acquisition Room" description="Strategic acquisition overview for BlackCrest Procurement Intelligence OS." canonicalPath="/acquisition-room" robots="noindex, nofollow" />

      <section className="card hero">
        <p className="eyebrow">Strategic Acquisition Room</p>
        <h1>BlackCrest Procurement Intelligence OS</h1>
        <p>An ERP-connected procurement intelligence platform foundation for manufacturers, GovCon suppliers, distributors, sourcing teams, and operational leaders.</p>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn" to="/investor-demo">View Investor Demo</Link>
          <Link className="btn ghost" to="/erp-connector-center">ERP Connector Center</Link>
          <Link className="btn ghost" to="/data-boundary">Data Boundary</Link>
        </div>
      </section>

      <section className="grid three">
        {metrics.map(([label, value]) => <article className="card glass-panel" key={label}><p className="metric-label">{label}</p><h3>{value}</h3></article>)}
      </section>

      <section className="card glass-panel">
        <h2>The acquisition thesis</h2>
        <p>Most procurement systems record activity. BlackCrest is designed to explain what the activity means and what a buyer, sourcing leader, procurement director, or executive should do next. The current asset is positioned as a transferable product foundation a strategic buyer can refactor, integrate, license, white-label, or commercialize.</p>
      </section>

      <section className="grid three">
        {modules.map(([title, copy]) => <article className="card glass-panel" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
      </section>

      <section className="grid two">
        <article className="card glass-panel"><h2>Transferable asset stack</h2><ul className="timeline-list">{assetStack.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article className="card glass-panel"><h2>Best strategic buyers</h2><ul className="timeline-list">{buyerTypes.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </section>

      <section className="card glass-panel">
        <h2>Deal structure ladder</h2>
        <div className="grid three">
          <article className="card nested"><h3>Codebase-only sale</h3><p><strong>$8.5K-$12K</strong></p><p>Repository as-is, setup notes, and limited transition. Brand, domain, exclusivity, and broader commercial thesis excluded unless negotiated.</p></article>
          <article className="card nested"><h3>Product foundation acquisition</h3><p><strong>$25K-$75K</strong></p><p>Codebase, product docs, architecture notes, demo package, roadmap, sample ERP data workflow, and structured handoff.</p></article>
          <article className="card nested"><h3>Strategic rights acquisition</h3><p><strong>$250K-$1.2M</strong></p><p>Negotiated commercial rights, white-label rights, territory/industry exclusivity, implementation rights, and broader platform positioning.</p></article>
        </div>
      </section>

      <section className="card glass-panel">
        <h2>Why the ERP dependency matters</h2>
        <p>BlackCrest becomes more valuable when connected to ERP or procurement data because procurement intelligence requires purchase orders, supplier records, receipts, dates, quantities, pricing, categories, and operational history.</p>
      </section>
    </main>
  );
}

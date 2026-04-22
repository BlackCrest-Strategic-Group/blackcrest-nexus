import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { defaultOrgSchema, softwareSchema, websiteSchema, SITE_URL } from '../../utils/seo';

const painPoints = [
  {
    title: 'Fragmented sourcing visibility',
    body: 'Procurement teams are forced to stitch together supplier signals, proposal deadlines, and ERP status updates from disconnected tools.'
  },
  {
    title: 'Delayed executive decisions',
    body: 'Leaders lack decision-ready briefings that translate procurement noise into clear recommendations and measurable operational risk.'
  },
  {
    title: 'Inconsistent bid/no-bid discipline',
    body: 'Opportunity qualification often depends on tribal knowledge instead of explainable scoring, compliance checks, and resource-readiness indicators.'
  }
];

const platformCapabilities = [
  'Bid/No-Bid Intelligence',
  'Supplier Risk Monitoring',
  'Proposal Scoring & Readiness',
  'Sourcing Visibility Dashboards',
  'Executive AI Briefings',
  'Procurement Health Scoring'
];

const erpConnectors = ['SAP', 'Oracle', 'Dynamics 365', 'NetSuite', 'Infor CSI / SyteLine'];

const tierCards = [
  { name: 'Starter', description: 'Opportunity visibility and baseline supplier intelligence for growing procurement teams.' },
  { name: 'Professional', description: 'Expanded Sentinel monitoring, executive briefings, and workflow automation for multi-team operations.' },
  { name: 'Enterprise', description: 'Advanced governance, SSO/MFA-ready controls, and ERP-connected operational procurement oversight.' },
  { name: 'Strategic Intelligence', description: 'Portfolio-level command center, white-glove analytics support, and executive decision advisory workflows.' }
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is BlackCrest OS designed for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BlackCrest OS supports procurement leaders, sourcing teams, GovCon operators, defense manufacturers, and enterprise supply chain organizations.'
      }
    },
    {
      '@type': 'Question',
      name: 'What business outcomes does BlackCrest OS improve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Teams use BlackCrest OS to accelerate qualification cycles, monitor supplier risk, improve sourcing visibility, and brief executives with actionable procurement intelligence.'
      }
    }
  ]
};

export default function HomePage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="BlackCrest OS | AI-Powered Procurement Intelligence for Faster Operational Decisions"
        description="BlackCrest OS is an AI-powered procurement intelligence operating system for supplier risk monitoring, sourcing visibility, proposal intelligence, and executive procurement decision support."
        keywords="procurement intelligence,supplier intelligence,procurement AI,sourcing intelligence,procurement analytics,supplier risk monitoring,procurement operating system,AI procurement platform,sourcing visibility,proposal intelligence"
        canonicalPath="/"
        schemas={[
          defaultOrgSchema,
          websiteSchema,
          faqSchema,
          softwareSchema({ pageUrl: SITE_URL, description: 'AI-Powered Procurement Intelligence for Faster Operational Decisions.' })
        ]}
      />
      <main>
        <section className="hero-section container enterprise-hero">
          <p className="eyebrow">BLACKCREST OS</p>
          <h1>AI-Powered Procurement Intelligence for Faster Operational Decisions</h1>
          <p>
            BlackCrest OS helps organizations monitor supplier risk, evaluate procurement opportunities, improve sourcing visibility,
            and generate AI-driven operational intelligence across federal and commercial environments.
          </p>
          <div className="row">
            <Link className="btn" to="/contact">Request Demo</Link>
            <Link className="btn ghost" to="/features">Explore Platform</Link>
          </div>
          <div className="hero-preview" aria-label="Operational dashboard preview">
            <div className="preview-grid">
              <article className="preview-panel">
                <h3>Sentinel Alerts</h3>
                <p className="muted">3 supplier anomalies flagged in last 24h</p>
                <div className="status-row"><span className="status-dot warning" />Raw material delivery volatility · Southeast region</div>
                <div className="status-row"><span className="status-dot danger" />Compliance drift · Critical supplier class B</div>
              </article>
              <article className="preview-panel">
                <h3>Executive Briefing</h3>
                <p className="muted">Procurement health score: 84/100</p>
                <ul>
                  <li>Bid pipeline weighted value: $18.2M</li>
                  <li>At-risk sourcing programs: 2</li>
                  <li>Recommended action: Activate secondary supplier lane</li>
                </ul>
              </article>
              <article className="preview-panel">
                <h3>Opportunity Scoring</h3>
                <p className="muted">Top opportunities aligned to win profile</p>
                <div className="kpi-bars">
                  <span style={{ height: '79%' }} />
                  <span style={{ height: '62%' }} />
                  <span style={{ height: '91%' }} />
                  <span style={{ height: '54%' }} />
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="container section-grid three-col">
          {painPoints.map((point) => (
            <article className="marketing-card" key={point.title}>
              <h2>{point.title}</h2>
              <p>{point.body}</p>
            </article>
          ))}
        </section>

        <section className="container section-grid capability-grid">
          <article className="marketing-card">
            <h2>Platform capabilities</h2>
            <p>Purpose-built intelligence workflows for procurement leaders, operations teams, and executive decision makers.</p>
            <ul className="feature-list">
              {platformCapabilities.map((capability) => <li key={capability}>{capability}</li>)}
            </ul>
          </article>
          <article className="marketing-card">
            <h2>Sentinel monitoring layer</h2>
            <p>Autonomous procurement monitoring that detects supplier anomalies, disruption patterns, and sourcing instability before they become operational failures.</p>
            <p><strong>Includes:</strong> AI-generated warnings, activity feeds, risk trend tracking, and command-center dashboards.</p>
          </article>
          <article className="marketing-card">
            <h2>Executive intelligence workflows</h2>
            <p>Daily AI briefings summarize procurement posture, supplier exposure, and proposal readiness so leaders can act quickly with confidence.</p>
            <p><strong>Outputs:</strong> recommendations, forecast snapshots, compliance indicators, and decision logs.</p>
          </article>
        </section>

        <section className="container section-grid capability-grid">
          <article className="marketing-card">
            <h2>ERP integrations</h2>
            <p>Connect operational procurement intelligence into existing enterprise systems without replacing your ERP foundation.</p>
            <ul className="feature-list">
              {erpConnectors.map((connector) => <li key={connector}>{connector}</li>)}
            </ul>
          </article>
          <article className="marketing-card">
            <h2>Acquisition-grade architecture</h2>
            <p>BlackCrest OS is structured for scale with modular services, audit logging, secure authentication, and enterprise-ready deployment patterns.</p>
            <p><strong>Enterprise controls:</strong> MFA-ready flows, role-based access, usage tracking, and subscription-aware feature gating.</p>
          </article>
          <article className="marketing-card">
            <h2>Industries served</h2>
            <p>Designed for GovCon teams, defense contractors, industrial manufacturers, enterprise sourcing groups, and procurement service operators.</p>
            <p><strong>Use cases:</strong> opportunity qualification, supplier oversight, proposal intelligence, and operational procurement monitoring.</p>
          </article>
        </section>

        <section className="container section-grid four-col">
          {tierCards.map((tier) => (
            <article className="marketing-card" key={tier.name}>
              <h2>{tier.name}</h2>
              <p>{tier.description}</p>
            </article>
          ))}
        </section>

        <section className="container marketing-card founder">
          <h2>Built to be operated, scaled, and monetized</h2>
          <p>
            BlackCrest OS is positioned as procurement intelligence infrastructure: a platform that can support recurring SaaS revenue,
            enterprise licensing, and operational deployment across multiple procurement-intensive industries.
          </p>
          <div className="row">
            <Link className="btn" to="/contact">Request Demo</Link>
            <Link className="btn ghost" to="/insights">Read Executive Insights</Link>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}

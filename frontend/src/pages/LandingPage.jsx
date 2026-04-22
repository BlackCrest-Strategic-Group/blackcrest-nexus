import React from 'react';
import { Link } from 'react-router-dom';

const heroSignals = [
  'Live opportunity scoring across SAM.gov + commercial pipelines',
  'Supplier risk, sanctions, tariff, and logistics visibility in one pane',
  'AI executive briefings with financial impact and margin protection moves'
];

const capabilityCards = [
  {
    title: 'Procurement Opportunity Intelligence',
    description: 'Continuously detect, rank, and triage opportunities with Truth Serum AI decision scoring.',
    bullets: ['Pursue / avoid / renegotiate recommendations', 'Cycle-timing intelligence', 'Proposal win probability modeling']
  },
  {
    title: 'Executive Command Center',
    description: 'A premium operational command surface for sourcing, supplier, risk, and financial intelligence.',
    bullets: ['Procurement health score', 'Commodity + FX movement', 'Contract expirations and disruption alerts']
  },
  {
    title: 'AI Procurement Agents',
    description: 'Autonomous agents monitor supply markets, supplier behavior, compliance, and margin leakage.',
    bullets: ['Capture Agent', 'Risk Agent', 'Commodity Agent', 'Executive Briefing Agent']
  }
];

const integrations = [
  'SAP',
  'Oracle',
  'Microsoft Dynamics',
  'Infor CSI / Syteline',
  'NetSuite',
  'Outlook + Gmail + Calendar'
];

export default function LandingPage() {
  return (
    <main className="landing-page command-theme" data-testid="landing-page">
      <section className="landing-hero card cinematic-panel" data-testid="landing-hero">
        <p className="landing-kicker">BlackCrest OpportunityOS · Powered by Truth Serum AI</p>
        <h1>The Bloomberg Terminal for Procurement Intelligence</h1>
        <p>
          BlackCrest unifies federal + commercial opportunity intelligence, supplier intelligence, sourcing intelligence,
          and executive decision support into one real-time operating system.
        </p>
        <ul className="hero-signal-list">
          {heroSignals.map((signal) => <li key={signal}>{signal}</li>)}
        </ul>
        <div className="row">
          <Link className="btn" to="/login" data-testid="landing-signin">Enter Command Center</Link>
          <Link className="btn ghost" to="/register" data-testid="landing-register">Request Enterprise Access</Link>
        </div>
      </section>

      <section className="grid three">
        {capabilityCards.map((card) => (
          <article key={card.title} className="card intelligence-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <ul className="landing-list">
              {card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Global Supplier Intelligence + Risk Memory Graph</h2>
          <p>
            Continuously map suppliers, contracts, commodities, margins, lead times, NAICS, performance, and geopolitical risk
            to generate smarter recommendations over time.
          </p>
          <p className="muted">Authentication required to access operational dashboards, autonomous agents, and workflow automation.</p>
        </article>
        <article className="card">
          <h2>Enterprise Connectors + Briefing Delivery</h2>
          <ul className="landing-list">
            {integrations.map((integration) => <li key={integration}>{integration}</li>)}
          </ul>
        </article>
      </section>

      <section className="card landing-trust">
        <h2>Security + Compliance Posture</h2>
        <p><strong>NIST-aligned architecture:</strong> non-classified enterprise deployment baseline.</p>
        <p><strong>SOC2-ready controls:</strong> audit logging, secure API gateway patterns, encryption-first data handling.</p>
        <p><strong>Secure integrations:</strong> tokenized read-only connectors with no plaintext credentials.</p>
      </section>

      <section className="card landing-cta">
        <h2>Ready to operationalize procurement intelligence?</h2>
        <p>Sign in to access BlackCrest OpportunityOS and activate Truth Serum AI executive decision support.</p>
        <div className="row">
          <Link className="btn" to="/login">Secure Login</Link>
          <Link className="btn ghost" to="/privacy">Privacy + Usage Boundary</Link>
        </div>
      </section>
    </main>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const procurementChallenges = [
  'Fragmented procurement visibility across ERP, SAM.gov, and supplier systems.',
  'Supplier concentration risk and limited disruption forecasting.',
  'Reactive sourcing decisions driven by lagging indicators.',
  'Limited operational intelligence across proposal and margin workflows.',
  'Disconnected category and contract-level analytics.',
  'Escalating compliance pressure with constrained analyst bandwidth.',
  'Persistent supply chain volatility impacting forecast confidence.'
];

const capabilityModules = [
  ['Procurement Intelligence', 'Continuously prioritize pursuits with AI scoring, timing, and resource alignment.', '◉'],
  ['Supplier Intelligence', 'Monitor supplier health, concentration, sanctions signals, and fulfillment reliability.', '◌'],
  ['Proposal Intelligence', 'Increase win probability with technical fit, pricing confidence, and timeline readiness.', '◎'],
  ['Risk Intelligence', 'Track geopolitical, commodity, logistics, and contract risk with proactive alerts.', '⬢'],
  ['Executive Intelligence', 'Deliver board-ready AI briefings with quantified margin and continuity implications.', '⬡'],
  ['Market Intelligence', 'Detect market shifts, competitor movement, and demand signals in near real time.', '▣'],
  ['Compliance Intelligence', 'Surface policy and regulatory exposure before it impacts sourcing decisions.', '▦']
];

const executiveBriefings = [
  'Supplier concentration risk detected in avionics castings (Critical Tier 1).',
  'Alternative sourcing options identified for Category 47 with 11% cost variance reduction.',
  'Margin exposure projected within 60 days due to long-lead electronics volatility.',
  'Proposal viability score increased to 78 after teaming strategy optimization.',
  'Logistics disruption warning detected for East Asia lane impacting Q3 continuity.'
];

const commandMetrics = [
  ['Supplier Risk Events', '27', '+8 in 24h'],
  ['High-Conviction Opportunities', '14', '+3 this week'],
  ['At-Risk Contracts', '9', '120-day window'],
  ['Procurement Health Score', '86/100', '+4.1 trend']
];

export default function LandingPage() {
  return (
    <main className="landing-page command-theme" data-testid="landing-page">
      <section className="landing-hero card cinematic-panel" data-testid="landing-hero">
        <div className="hero-grid-overlay" />
        <p className="landing-kicker">BlackCrest OS · Enterprise Procurement Intelligence</p>
        <h1>BlackCrest OS</h1>
        <h2>AI-Powered Procurement Intelligence for Faster Operational Decisions</h2>
        <p>
          BlackCrest OS helps organizations monitor supplier risk, evaluate procurement opportunities, improve sourcing visibility,
          and generate AI-driven operational intelligence across federal and commercial environments.
        </p>

        <div className="live-signal-row">
          <span className="pulse-dot" />
          <p>Sentinel is actively monitoring 4,281 procurement signals across 19 categories.</p>
        </div>

        <div className="hero-metric-grid">
          {commandMetrics.map(([label, value, delta]) => (
            <article key={label} className="hero-metric-card">
              <p>{label}</p>
              <h3>{value}</h3>
              <small>{delta}</small>
            </article>
          ))}
        </div>

        <div className="row">
          <Link className="btn" to="/register" data-testid="landing-request-demo">Request Demo</Link>
          <Link className="btn ghost" to="/login" data-testid="landing-explore-platform">Explore Platform</Link>
        </div>
      </section>

      <section className="card section-block">
        <div className="section-heading">
          <p className="landing-kicker">Section 1</p>
          <h2>Procurement Challenges</h2>
        </div>
        <div className="grid three challenge-grid">
          {procurementChallenges.map((item) => (
            <article key={item} className="card intelligence-card challenge-card">
              <span className="mini-dot" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-block">
        <div className="section-heading">
          <p className="landing-kicker">Section 2</p>
          <h2>BlackCrest OS Capabilities</h2>
        </div>
        <div className="grid three capability-grid">
          {capabilityModules.map(([title, description, icon]) => (
            <article key={title} className="card intelligence-card capability-card">
              <div className="capability-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-block sentinel-block cinematic-panel">
        <div className="section-heading">
          <p className="landing-kicker">Section 3 · Sentinel</p>
          <h2>Autonomous Procurement Monitoring & Intelligence</h2>
        </div>
        <div className="grid two">
          <article className="sentinel-console">
            <h3>Live Monitoring Console</h3>
            <ul>
              <li><span className="pulse-dot" /> Anomaly detection event raised: supplier lead-time divergence.</li>
              <li><span className="pulse-dot" /> Risk confidence index updated: 0.82 to 0.91.</li>
              <li><span className="pulse-dot" /> AI recommendation generated: diversify top-two suppliers.</li>
              <li><span className="pulse-dot" /> Procurement health scoring refresh complete.</li>
            </ul>
          </article>
          <article className="sentinel-feed">
            <h3>Live Event Feed</h3>
            <p>00:42 UTC · Logistics route volatility exceeds threshold · Warning</p>
            <p>00:39 UTC · Commodity index drift detected in titanium · Advisory</p>
            <p>00:37 UTC · Contract cycle acceleration opportunity identified · Action</p>
            <p>00:31 UTC · Supplier performance confidence improved · Positive</p>
          </article>
        </div>
      </section>

      <section className="card section-block">
        <div className="section-heading">
          <p className="landing-kicker">Section 4</p>
          <h2>Executive AI Briefings</h2>
        </div>
        <div className="grid two">
          {executiveBriefings.map((brief) => (
            <article key={brief} className="executive-brief-card">
              <p>{brief}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-block command-preview">
        <div className="section-heading">
          <p className="landing-kicker">Section 5</p>
          <h2>Command Center Preview</h2>
        </div>
        <div className="preview-grid">
          <div className="preview-panel"><h3>Supplier Risk Panel</h3><p>12 suppliers require mitigation actions.</p></div>
          <div className="preview-panel"><h3>Opportunity Scoring</h3><p>3 opportunities moved to high-conviction tier.</p></div>
          <div className="preview-panel"><h3>Procurement Heatmap</h3><p>Category 31 and 47 showing margin pressure.</p></div>
          <div className="preview-panel"><h3>AI Recommendations</h3><p>7 decisions pending executive approval.</p></div>
          <div className="preview-panel"><h3>Intelligence Feed</h3><p>24 alerts in rolling 6-hour window.</p></div>
          <div className="preview-panel"><h3>Operational Metrics</h3><p>Program continuity confidence: 91%.</p></div>
        </div>
      </section>

      <section className="card landing-cta section-block">
        <h2>See Procurement Intelligence in Action</h2>
        <div className="row">
          <Link className="btn" to="/register">Request Demo</Link>
          <Link className="btn ghost" to="/login">Access Platform</Link>
        </div>
      </section>
    </main>
  );
}

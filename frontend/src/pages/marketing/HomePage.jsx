import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';
import EarlyIndustryFeedback from './EarlyIndustryFeedback';

const systemActivity = [
  'Supplier Risk Detected: Apex Components (Delay Risk High)',
  'Cost Savings Identified: $182,430 Opportunity',
  'RFQ Optimization Complete: 17% Faster Cycle',
  'Margin Leakage Alert: Electronics Category',
  'Funding Signal Detected: Working Capital Opportunity'
];

const bridgeCards = [
  { title: 'Cost Intelligence', text: 'Find hidden savings in your procurement data' },
  { title: 'Risk Visibility', text: 'Understand supplier and operational exposure instantly' },
  { title: 'Funding Enablement', text: 'Turn procurement performance into capital opportunities' }
];

const demoMailTo = 'mailto:michael.allen.scott43@outlook.com?subject=BlackCrest Nexus Demo Request&body=Name:%0D%0ACompany:%0D%0AWhat are you looking to solve:%0D%0AUrgency (Optional):';

export default function HomePage() {
  return (
    <div className="nexus-premium">
      <SeoHead
        title="BlackCrest Nexus | Procurement + Funding Intelligence"
        description="Turn procurement data into cost savings, supplier intelligence, and funding-ready decisions in minutes."
        canonicalPath="/"
      />

      <main>
        <section className="premium-hero">
          <div className="nexus-container premium-hero__grid">
            <div>
              <h1>BlackCrest Nexus</h1>
              <p>
                Turn procurement data into cost savings, supplier intelligence, and funding-ready decisions in minutes.
              </p>
              <div className="premium-hero__actions">
                <Link to="/demo" className="nexus-cta">Try Live Demo</Link>
                <a href={demoMailTo} className="nexus-cta nexus-cta--ghost">Book Private Demo</a>
              </div>
              <Link to="/demo" className="premium-micro-link">See How Funding Connects →</Link>
            </div>

            <aside className="activity-panel" aria-label="Live System Activity Panel">
              <div className="activity-panel__head">
                <h2>Live System Activity Panel</h2>
                <span className="system-active"><span className="status-dot active" />System Active</span>
              </div>
              <ul>
                {systemActivity.map((item, i) => (
                  <li key={item} style={{ animationDelay: `${i * 0.2}s` }}>
                    <span className="status-dot active" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <EarlyIndustryFeedback />

        <section className="funding-bridge">
          <div className="nexus-container">
            <h2>From Procurement Insight to Capital Access</h2>
            <div className="bridge-pillars">
              <span>Identify savings</span>
              <span>Reduce supplier risk</span>
              <span>Unlock funding tied to your operations</span>
            </div>
            <div className="bridge-cards">
              {bridgeCards.map((card) => (
                <article key={card.title} className="bridge-card">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

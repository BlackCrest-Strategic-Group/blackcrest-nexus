import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

const trustPoints = [
  'Designed by procurement professionals',
  'Built for manufacturing, defense, and supplier-driven organizations',
  'Early access platform — onboarding founding users'
];

const dashboardCards = [
  {
    title: 'Spend Analysis',
    subtitle: 'Category variance and outlier spend trends',
    metric: '$1.2M Addressable Savings',
    bars: [68, 42, 83, 57, 73]
  },
  {
    title: 'Supplier Risk Scoring',
    subtitle: 'Lead-time volatility and disruption exposure',
    metric: '12 Critical Suppliers Flagged',
    bars: [33, 78, 51, 61, 86]
  },
  {
    title: 'Cost Leakage Detection',
    subtitle: 'Price variance, freight leakage, and maverick spend',
    metric: '7.4% Leakage Detected',
    bars: [44, 63, 71, 48, 80]
  }
];

const outcomes = [
  'Find hidden cost overruns before they hit your bottom line',
  'Identify unreliable suppliers before they delay operations',
  'Eliminate weeks of manual analysis'
];

export default function HomePage() {
  return (
    <div className="nexus-page">
      <SeoHead
        title="BlackCrest Nexus | Procurement Intelligence That Converts Risk Into Action"
        description="Upload procurement data and instantly uncover supplier risk, hidden cost leakage, and prioritized actions."
        canonicalPath="/"
      />

      <header className="nexus-nav" aria-label="Site header">
        <div className="nexus-container nexus-nav__inner">
          <Link to="/" className="nexus-brand" aria-label="BlackCrest Nexus home">
            <img src="/logos/blackcrest-logo.svg" alt="BlackCrest Nexus" className="nexus-brand__logo" />
            <span>BlackCrest Nexus</span>
          </Link>
          <nav className="nexus-nav__links" aria-label="Primary">
            <a href="#product">Product</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#demo">Demo</a>
          </nav>
          <Link className="nexus-cta" to="/contact">Request Access</Link>
        </div>
      </header>

      <main>
        <section className="nexus-hero">
          <div className="nexus-container nexus-hero__grid">
            <div className="nexus-reveal">
              <h1>Stop Losing Money to Supplier Risk, Delays, and Hidden Cost Leakage</h1>
              <p className="nexus-hero__sub">
                Upload your procurement data and instantly see where you&apos;re losing margin, which suppliers are risky, and what actions to take next.
              </p>
              <ul className="nexus-bullets">
                <li>Identify cost leakage in minutes</li>
                <li>Flag high-risk suppliers instantly</li>
                <li>No ERP integration required</li>
              </ul>
              <div className="nexus-hero__actions">
                <Link className="nexus-cta" to="/contact">Request Access</Link>
                <a className="nexus-text-link" href="#demo">Watch 60-Second Demo</a>
              </div>
            </div>
            <div className="nexus-video-frame nexus-reveal" id="demo">
              <div className="video-container">
                <iframe
                  src="https://drive.google.com/file/d/1CZ0porOk2JIfmbsNujocAmy58iJ_kTVY/preview"
                  title="BlackCrest Nexus demo"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="nexus-trust">
          <div className="nexus-container nexus-reveal">
            <h2>Built for Real Procurement Operators</h2>
            <div className="nexus-trust__grid">
              {trustPoints.map((point) => <p key={point}>{point}</p>)}
            </div>
          </div>
        </section>

        <section id="product" className="nexus-product">
          <div className="nexus-container nexus-reveal">
            <h2>See What You’ve Been Missing</h2>
            <div className="nexus-cards">
              {dashboardCards.map((card) => (
                <article key={card.title} className="nexus-card">
                  <h3>{card.title}</h3>
                  <p>{card.subtitle}</p>
                  <strong>{card.metric}</strong>
                  <div className="nexus-bars" aria-hidden="true">
                    {card.bars.map((height, index) => (
                      <span key={`${card.title}-${index}`} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="nexus-how">
          <div className="nexus-container nexus-reveal">
            <h2>From Data to Decisions in Minutes</h2>
            <div className="nexus-steps">
              <article><span>📤</span><p>Upload your procurement data</p></article>
              <article><span>⚡</span><p>Instantly analyze supplier performance and cost gaps</p></article>
              <article><span>✅</span><p>Take action with clear, prioritized insights</p></article>
            </div>
          </div>
        </section>

        <section className="nexus-value">
          <div className="nexus-container nexus-reveal">
            <h2>What This Actually Solves</h2>
            <ul>
              {outcomes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="nexus-demo">
          <div className="nexus-container nexus-reveal">
            <h2>See BlackCrest Nexus in Action</h2>
            <p>Real insights. Real visibility. No integration required.</p>
            <div className="nexus-video-frame nexus-video-frame--center">
              <div className="video-container">
                <iframe
                  src="https://drive.google.com/file/d/1CZ0porOk2JIfmbsNujocAmy58iJ_kTVY/preview"
                  title="BlackCrest Nexus product walkthrough"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="nexus-final-cta">
          <div className="nexus-container nexus-reveal">
            <h2>Stop Guessing. Start Seeing Where You’re Losing Money.</h2>
            <Link className="nexus-cta" to="/contact">Request Access</Link>
            <p>Limited onboarding for early users</p>
          </div>
        </section>
      </main>
    </div>
  );
}

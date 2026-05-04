import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

const proofPoints = [
  '$127K annual cost leakage identified',
  '18% supplier delay risk flagged',
  '32% spend in high-risk categories'
];

const features = [
  {
    title: 'Cost Savings Analysis',
    description: 'Quickly identify where money is being lost across suppliers and categories.'
  },
  {
    title: 'Supplier Risk Alerts',
    description: 'Detect delays, performance issues, and high-risk vendors early.'
  },
  {
    title: 'Procurement Dashboard',
    description: 'Get a clear, real-time view of procurement performance.'
  }
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <SeoHead
        title="Procurement Analytics Platform | Find Cost Savings and Supplier Risks"
        description="Upload procurement data to uncover hidden cost leaks, risky suppliers, and procurement performance gaps in seconds."
        canonicalPath="/"
      />

      <header className="landing-header" aria-label="Site header">
        <div className="landing-container landing-header__inner">
          <Link to="/" className="landing-brand" aria-label="BlackCrest home">
            BlackCrest
          </Link>
          <Link to="/login" className="landing-login">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero__content">
            <p className="landing-eyebrow">Procurement analytics for faster decisions</p>
            <h1>Find Cost Savings and Supplier Risks in Seconds</h1>
            <p className="landing-hero__subheadline">
              Upload your procurement data and instantly uncover hidden cost leaks, risky suppliers, and performance gaps.
            </p>
            <ul className="landing-hero__bullets" aria-label="Platform outcomes">
              <li>Identify hidden cost leaks in minutes</li>
              <li>Flag high-risk suppliers before they fail</li>
              <li>See a clear procurement performance dashboard</li>
            </ul>
            <div className="landing-hero__actions">
              <Link className="landing-primary-btn" to="/demo">Start Free Analysis</Link>
              <a className="landing-text-link" href="#live-demo">See Live Demo</a>
            </div>
          </div>
        </section>

        <section id="live-demo" className="landing-video-section">
          <div className="landing-container landing-section__centered">
            <h2>See It Find Cost Savings in Real Time</h2>
            <p>Watch how procurement data turns into actionable insights in seconds.</p>
            <div className="video-container" aria-label="Procurement analytics demo video">
              <iframe
                src="https://drive.google.com/file/d/1CZ0porOk2JIfmbsNujocAmy58iJ_kTVY/preview"
                title="Procurement analytics demo video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--contrast">
          <div className="landing-container">
            <h2>What This Platform Finds in Minutes</h2>
            <div className="landing-metric-grid">
              {proofPoints.map((proofPoint) => (
                <article className="landing-metric-card" key={proofPoint}>
                  <p>{proofPoint}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-container">
            <h2>What You Get</h2>
            <div className="landing-feature-grid">
              {features.map((feature) => (
                <article className="landing-feature-card" key={feature.title}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final-cta">
          <div className="landing-container landing-final-cta__inner">
            <h2>See what your procurement data is hiding</h2>
            <Link className="landing-primary-btn" to="/demo">Start Free Analysis</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

const metrics = [
  '$127K annual cost leakage identified',
  '18% supplier delay risk flagged',
  '32% spend in high-risk categories'
];

const features = [
  {
    title: 'Cost Savings Analysis',
    description: 'Spot duplicate spend, price drift, and missed contract savings from your uploaded data.'
  },
  {
    title: 'Supplier Risk Alerts',
    description: 'Flag late deliveries, concentration risk, and weak supplier performance before they hit operations.'
  },
  {
    title: 'Procurement Performance Dashboard',
    description: 'See savings, delays, category exposure, and supplier health in one clear view.'
  }
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <SeoHead
        title="Procurement Analytics Platform | Find Cost Savings and Supplier Risks"
        description="Upload procurement data to uncover cost savings, supplier risks, and procurement performance gaps without ERP integration or complex setup."
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
          <div className="landing-container landing-hero__grid">
            <div className="landing-hero__copy">
              <h1>Upload your procurement data. Instantly uncover cost savings and supplier risks.</h1>
              <p className="landing-hero__subheadline">
                See where you&apos;re losing money, which suppliers are failing, and what to fix—without ERP integration or complex setup.
              </p>
              <ul className="landing-hero__bullets" aria-label="Platform outcomes">
                <li>Identify hidden cost leaks in minutes</li>
                <li>Flag high-risk suppliers before they fail</li>
                <li>Get a clear procurement performance dashboard</li>
              </ul>
              <div className="landing-hero__actions">
                <Link className="landing-primary-btn" to="/demo">Start Free Analysis</Link>
                <Link className="landing-text-link" to="/demo">See Live Demo</Link>
              </div>
            </div>

            <figure className="landing-visual-card" aria-label="Procurement dashboard preview">
              <div className="dashboard-placeholder" role="img" aria-label="Dashboard showing savings, supplier risk, and category spend insights">
                <div className="dashboard-placeholder__topbar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="dashboard-placeholder__content">
                  <div className="dashboard-placeholder__metric dashboard-placeholder__metric--large">
                    <small>Potential savings</small>
                    <strong>$127K</strong>
                  </div>
                  <div className="dashboard-placeholder__metric">
                    <small>Delay risk</small>
                    <strong>18%</strong>
                  </div>
                  <div className="dashboard-placeholder__chart">
                    <span style={{ height: '42%' }} />
                    <span style={{ height: '68%' }} />
                    <span style={{ height: '55%' }} />
                    <span style={{ height: '82%' }} />
                    <span style={{ height: '47%' }} />
                  </div>
                  <div className="dashboard-placeholder__list">
                    <div><span /> Price drift found</div>
                    <div><span /> Supplier risk rising</div>
                    <div><span /> Category exposure high</div>
                  </div>
                </div>
              </div>
              <figcaption>Real-time procurement insights from your data</figcaption>
            </figure>
          </div>
        </section>

        <section className="landing-section landing-section--contrast">
          <div className="landing-container">
            <h2>What This Platform Finds in Minutes</h2>
            <div className="landing-metric-grid">
              {metrics.map((metric) => (
                <article className="landing-metric-card" key={metric}>
                  <p>{metric}</p>
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

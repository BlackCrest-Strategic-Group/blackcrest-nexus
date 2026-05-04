import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

const proofPoints = [
  '$127K annual cost leakage identified',
  '18% supplier delay risk flagged',
  '34% spend in volatile categories'
];

const exampleFindings = [
  '$127,000 in annual cost leakage',
  '2 high-risk suppliers causing 18% of delays',
  '34% of spend in volatile categories'
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
            <p className="landing-eyebrow">Procurement leakage and supplier risk analysis</p>
            <h1>Find Cost Savings and Supplier Risks in Seconds</h1>
            <p className="landing-hero__subheadline">
              Upload your procurement data to uncover hidden cost leaks, risky suppliers, and performance gaps.
            </p>
            <p className="landing-hero__urgency">
              Most procurement teams are unknowingly losing 5–15% in cost due to supplier inefficiencies and hidden pricing gaps.
            </p>
            <ul className="landing-hero__bullets" aria-label="Platform outcomes">
              <li>Compare supplier pricing gaps across categories</li>
              <li>Flag suppliers tied to delays and volatility</li>
              <li>Prioritize leakage by annual cost impact</li>
            </ul>
            <div className="landing-hero__actions">
              <Link className="landing-primary-btn" to="/demo">Analyze My Procurement Data</Link>
              <a className="landing-text-link" href="#live-demo">See Live Demo</a>
            </div>
          </div>
        </section>

        <section id="live-demo" className="landing-video-section">
          <div className="landing-container landing-section__centered">
            <h2>Watch $100K+ in Cost Savings Get Identified in Seconds</h2>
            <p>See the upload flow and the supplier, category, and leakage findings it returns.</p>
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
            <h2>Procurement Findings Shown After Upload</h2>
            <div className="landing-metric-grid">
              {proofPoints.map((proofPoint) => (
                <article className="landing-metric-card" key={proofPoint}>
                  <p>{proofPoint}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-example-section">
          <div className="landing-container landing-example-card">
            <div>
              <p className="landing-eyebrow">Sample analysis output</p>
              <h2>Example: What This Finds in Real Data</h2>
              <p className="landing-example-intro">
                A mid-sized manufacturer uploaded supplier spend data and uncovered:
              </p>
            </div>
            <ul className="landing-example-list">
              {exampleFindings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
            <p className="landing-example-timing">Identified in under 3 minutes.</p>
          </div>
        </section>

        <section className="landing-final-cta">
          <div className="landing-container landing-final-cta__inner">
            <div className="landing-final-cta__copy">
              <h2>Upload supplier spend data and identify leakage in minutes</h2>
              <p>No integration required. No setup headaches. Upload and see results instantly.</p>
            </div>
            <Link className="landing-primary-btn" to="/demo">Analyze My Procurement Data</Link>
          </div>
          <p className="landing-footer-credibility">
            Built from real-world procurement and supplier management experience.
          </p>
        </section>
      </main>
    </div>
  );
}

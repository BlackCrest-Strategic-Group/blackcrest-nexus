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
        title="BlackCrest Nexus | The Procurement Intelligence Operating System"
        description="Procurement intelligence that turns operational risk into action."
        canonicalPath="/"
      />

      <header className="landing-header" aria-label="Site header">
        <div className="landing-container landing-header__inner">
          <Link to="/" className="landing-brand" aria-label="BlackCrest Nexus home">
            BlackCrest Nexus
          </Link>
          <Link to="/login" className="landing-login">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero__content">
            <p className="landing-eyebrow">Procurement intelligence for modern teams</p>
            <h1>BlackCrest Nexus</h1>
            <p className="landing-hero__subheadline">
              The Procurement Intelligence Operating System
            </p>
            <p className="landing-hero__urgency">Procurement intelligence that turns operational risk into action.</p>
            <ul className="landing-hero__bullets" aria-label="Platform outcomes">
              <li>Compare supplier pricing gaps across categories</li>
              <li>Flag suppliers tied to delays and volatility</li>
              <li>Prioritize leakage by annual cost impact</li>
            </ul>
            <div className="landing-hero__actions">
              <Link className="landing-primary-btn" to="/demo">Enter Live Demo</Link>
              <Link className="secondary-btn" to="/contact">Request Demo</Link>
            </div>
          </div>
        </section>

        <section id="live-demo" className="video-section landing-video-section">
          <div className="landing-container landing-section__centered">
            <h2>See BlackCrest Nexus in Action</h2>
            <p>Watch how procurement teams uncover cost savings and supplier risk in seconds.</p>
            <div className="video-container" aria-label="Procurement analytics demo video">
              <iframe
                src="https://drive.google.com/file/d/1CZ0porOk2JIfmbsNujocAmy58iJ_kTVY/preview"
                title="Procurement analytics demo video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <Link className="primary-btn" to="/demo">Enter Live Demo</Link>
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

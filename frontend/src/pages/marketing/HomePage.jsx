import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';

const proofPoints = [
  '$127K annual cost leakage identified',
  '18% supplier delay risk flagged',
  '34% spend in volatile categories'
];

export default function HomePage() {
  return (
    <div className="landing-page premium-theme">
      <SeoHead
        title="BlackCrest Nexus | The Procurement Intelligence Operating System"
        description="Procurement intelligence that turns operational risk into action."
        canonicalPath="/"
      />

      <header className="landing-header" aria-label="Site header">
        <div className="landing-container landing-header__inner">
          <Link to="/" className="landing-brand" aria-label="BlackCrest Nexus home">BlackCrest Nexus</Link>
          <Link to="/login" className="landing-login secondary-btn">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero watermark-section">
          <div className="watermark-center" aria-hidden="true" />
          <div className="landing-container landing-hero__content fade-in">
            <p className="landing-eyebrow">Procurement intelligence for modern teams</p>
            <h1>BlackCrest Nexus</h1>
            <p className="landing-hero__subheadline">The Procurement Intelligence Operating System</p>
            <p className="landing-hero__urgency">Procurement intelligence that turns operational risk into action.</p>
            <div className="landing-hero__actions">
              <Link className="primary-btn" to="/live-demo">Enter Live Demo</Link>
              <Link className="secondary-btn" to="/contact">Request Demo</Link>
            </div>
          </div>
        </section>

        <section id="live-demo" className="video-section landing-video-section">
          <div className="landing-container landing-section__centered">
            <h2>See BlackCrest Nexus in Action</h2>
            <p>Watch how procurement teams uncover cost savings and supplier risk in seconds.</p>
            <div className="video-container premium-video" aria-label="Procurement analytics demo video">
              <iframe
                src="https://drive.google.com/file/d/1CZ0porOk2JIfmbsNujocAmy58iJ_kTVY/preview"
                title="Procurement analytics demo video"
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <Link className="primary-btn" to="/live-demo">Enter Live Demo</Link>
          </div>
        </section>

        <section className="landing-section landing-section--contrast">
          <div className="landing-container">
            <h2>Procurement Findings Shown After Upload</h2>
            <div className="landing-metric-grid">
              {proofPoints.map((proofPoint) => (
                <article className="card" key={proofPoint}><p>{proofPoint}</p></article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

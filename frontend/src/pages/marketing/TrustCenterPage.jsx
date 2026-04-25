import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

const docs = [
  { label: 'Security Overview', path: '/security', note: 'Includes NIST-aligned controls and operational security posture.' },
  { label: 'Data Boundary Statement', path: '/data-boundary', note: 'Clarifies customer-controlled ingestion and clean-room posture.' },
  { label: 'Audit & Governance', path: '/ai-governance-principles', note: 'AI governance and responsible-use principles.' }
];

export default function TrustCenterPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Trust Center | BlackCrest OS"
        description="Trust center for procurement security, governance, and compliance posture."
        canonicalPath="/trust-center"
        schemas={[defaultOrgSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Trust Center', path: '/trust-center' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Security Trust Center</h1>
          <p>Buyer-facing trust artifacts using existing controls and documentation.</p>
        </section>

        <section className="section-grid capability-grid">
          {docs.map((item) => (
            <article className="marketing-card" key={item.label}>
              <h2>{item.label}</h2>
              <p>{item.note}</p>
              <p><a href={item.path}>Open resource</a></p>
            </article>
          ))}
        </section>
      </main>
    </MarketingLayout>
  );
}

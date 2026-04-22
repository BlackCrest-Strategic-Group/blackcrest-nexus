import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

const controls = [
  'MFA-ready authentication architecture',
  'Audit logging for sensitive workflow actions',
  'Role-based access controls aligned to team responsibilities',
  'Token-based API protection and environment-managed secrets',
  'Operational monitoring for anomaly detection and service reliability'
];

export default function SecurityPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Security Overview | BlackCrest OS"
        description="Security and trust overview for BlackCrest OS including authentication controls, audit logging, and enterprise access governance."
        canonicalPath="/security"
        schemas={[defaultOrgSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Security', path: '/security' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Security Overview</h1>
          <p>BlackCrest OS is designed for enterprise procurement teams that require secure, auditable, and controlled access to operational intelligence.</p>
        </section>

        <section className="section-grid capability-grid">
          <article className="marketing-card">
            <h2>Core security posture</h2>
            <ul className="feature-list">
              {controls.map((control) => <li key={control}>{control}</li>)}
            </ul>
          </article>
          <article className="marketing-card">
            <h2>Deployment model</h2>
            <p>Container-friendly services with environment-variable configuration support controlled deployment across staging and production environments.</p>
            <p>Authentication and usage telemetry are designed to support enterprise governance and compliance workflows.</p>
          </article>
          <article className="marketing-card">
            <h2>Trust operations</h2>
            <p>Security reviews, dependency maintenance, and platform monitoring are integrated into operational release workflows to reduce preventable risk.</p>
            <p>For security requests or questionnaires, contact security@blackcrest.ai.</p>
          </article>
        </section>
      </main>
    </MarketingLayout>
  );
}

import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

export default function TermsPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Terms of Service | BlackCrest OS"
        description="Review BlackCrest OS terms of service for access, acceptable use, billing, and enterprise platform responsibilities."
        canonicalPath="/terms"
        schemas={[defaultOrgSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Terms of Service</h1>
          <p>Effective date: April 22, 2026.</p>
        </section>
        <section className="marketing-card article-body">
          <h2>1. Platform Scope</h2>
          <p>BlackCrest OS provides procurement intelligence workflows, supplier monitoring, and decision support software for authorized business users.</p>
          <h2>2. Account & Security Responsibilities</h2>
          <p>Customers are responsible for safeguarding account credentials, managing role permissions, and enabling MFA where required by internal policy.</p>
          <h2>3. Subscription & Billing</h2>
          <p>Access to paid features is governed by your active subscription plan, contracted user limits, and any enterprise licensing terms.</p>
          <h2>4. Acceptable Use</h2>
          <p>Customers may not misuse the platform for unlawful activity, unauthorized data access, or attempts to degrade platform availability and security.</p>
          <h2>5. Service Evolution</h2>
          <p>We may improve features, models, integrations, and interfaces to enhance platform performance while maintaining commercially reasonable continuity.</p>
          <h2>6. Contact</h2>
          <p>For legal or contract inquiries, contact legal@blackcrest.ai.</p>
        </section>
      </main>
    </MarketingLayout>
  );
}

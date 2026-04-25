import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

const plans = [
  {
    name: 'Starter',
    target: 'Small procurement teams',
    seats: 'Up to 5 seats',
    highlights: ['Core opportunity intelligence', 'Role-based dashboards', 'Seat-gated access']
  },
  {
    name: 'Growth',
    target: 'Scaling sourcing orgs',
    seats: 'Up to 20 seats',
    highlights: ['Everything in Starter', 'Watchlist + governance workflows', 'Expanded report center']
  },
  {
    name: 'Enterprise',
    target: 'Multi-team procurement operations',
    seats: '20+ seats',
    highlights: ['Everything in Growth', 'Enterprise deployment support', 'Advanced governance visibility']
  }
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Pricing | BlackCrest OS"
        description="Starter, Growth, and Enterprise packaging for BlackCrest procurement intelligence workflows."
        canonicalPath="/pricing"
        schemas={[defaultOrgSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Productized Pricing</h1>
          <p>Commercial packaging now maps directly to seat-gating and subscription controls in-platform.</p>
        </section>
        <section className="section-grid capability-grid">
          {plans.map((plan) => (
            <article className="marketing-card" key={plan.name}>
              <h2>{plan.name}</h2>
              <p><strong>Best for:</strong> {plan.target}</p>
              <p><strong>Seats:</strong> {plan.seats}</p>
              <ul className="feature-list">
                {plan.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </MarketingLayout>
  );
}

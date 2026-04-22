import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { defaultOrgSchema, softwareSchema, websiteSchema, SITE_URL } from '../../utils/seo';

const modules = [
  'Opportunity Intelligence',
  'Supplier Intelligence',
  'Sourcing Intelligence',
  'Proposal Intelligence',
  'Category Intelligence'
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is BlackCrest OS designed for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BlackCrest OS is designed for procurement teams, sourcing managers, manufacturers, defense contractors, GovCon teams, and supply chain leaders.'
      }
    },
    {
      '@type': 'Question',
      name: 'What outcomes does BlackCrest OS support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Teams use BlackCrest OS for faster opportunity review, better supplier visibility, stronger procurement decisions, and proposal readiness insight.'
      }
    }
  ]
};

export default function HomePage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="BlackCrest OS | AI Procurement Intelligence Platform"
        description="BlackCrest OS is an AI procurement intelligence platform for sourcing, supplier analysis, opportunity evaluation, and procurement decision support."
        canonicalPath="/"
        schemas={[defaultOrgSchema, websiteSchema, faqSchema, softwareSchema({ pageUrl: SITE_URL, description: 'AI Procurement Intelligence Platform for decision-ready sourcing and supplier insight.' })]}
      />
      <main>
        <section className="hero-section container">
          <p className="eyebrow">BlackCrest OS</p>
          <h1>AI Procurement Intelligence Platform</h1>
          <p>BlackCrest OS helps procurement and sourcing teams analyze opportunities, evaluate suppliers, assess procurement risk, support proposal decisions, and generate decision-ready insights.</p>
          <div className="row">
            <Link className="btn" to="/contact">Request a Demo</Link>
            <Link className="btn ghost" to="/features">Explore Features</Link>
          </div>
        </section>
        <section className="container section-grid">
          {modules.map((module) => (
            <article className="marketing-card" key={module}>
              <h2>{module}</h2>
              <p>Operational visibility and procurement signal detection designed for high-accountability teams.</p>
            </article>
          ))}
        </section>
        <section className="container marketing-card founder">
          <h2>Built from real procurement and program operations experience</h2>
          <p>BlackCrest OS was shaped by teams who have worked across sourcing, supplier management, and government contracting workflows. The platform is designed for practical execution: clear data, explainable recommendations, and process discipline that procurement leaders can trust.</p>
          <h3>Frequently asked questions</h3>
          <p><strong>Who is BlackCrest OS for?</strong> Procurement teams, sourcing managers, manufacturers, defense contractors, GovCon teams, and supply chain leaders.</p>
          <p><strong>What outcomes does it support?</strong> Faster opportunity review, better supplier visibility, stronger procurement decisions, and procurement signal detection.</p>
        </section>
      </main>
    </MarketingLayout>
  );
}

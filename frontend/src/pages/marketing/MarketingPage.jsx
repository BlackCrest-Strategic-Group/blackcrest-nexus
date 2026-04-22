import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { breadcrumbSchema, defaultOrgSchema, softwareSchema, websiteSchema, SITE_URL } from '../../utils/seo';

export default function MarketingPage({ title, description, path, h1, intro, sections = [] }) {
  const schemas = [
    defaultOrgSchema,
    websiteSchema,
    softwareSchema({ pageUrl: `${SITE_URL}${path}`, description }),
    ...(path === '/' ? [] : [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: h1, path }])])
  ];

  return (
    <MarketingLayout>
      <SeoHead title={title} description={description} canonicalPath={path} schemas={schemas} />
      <main>
        <section className="hero-section container">
          <h1>{h1}</h1>
          <p>{intro}</p>
          <div className="row">
            <Link to="/contact" className="btn">Request a Demo</Link>
            <Link to="/features" className="btn ghost">Explore Features</Link>
          </div>
        </section>

        <section className="container section-grid">
          {sections.map((section) => (
            <article className="marketing-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      </main>
    </MarketingLayout>
  );
}

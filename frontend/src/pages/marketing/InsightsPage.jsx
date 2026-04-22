import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { insightsArticles } from '../../content/insights';
import { breadcrumbSchema, defaultOrgSchema, websiteSchema } from '../../utils/seo';

export default function InsightsPage() {
  return (
    <MarketingLayout>
      <SeoHead
        title="Procurement Intelligence Insights | BlackCrest OS"
        description="Articles and thought leadership for procurement teams, sourcing managers, and GovCon operators."
        canonicalPath="/insights"
        schemas={[defaultOrgSchema, websiteSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }])]}
      />
      <main className="container">
        <section className="hero-section no-bg">
          <h1>Procurement Intelligence Insights</h1>
          <p>Practical guidance for procurement, sourcing, supplier risk, and proposal decision support.</p>
        </section>
        <section className="section-grid">
          {insightsArticles.map((article) => (
            <article className="marketing-card" key={article.slug}>
              <h2><Link to={`/insights/${article.slug}`}>{article.heading}</Link></h2>
              <p>{article.excerpt}</p>
              <p className="muted">{article.readTime}</p>
            </article>
          ))}
        </section>
      </main>
    </MarketingLayout>
  );
}

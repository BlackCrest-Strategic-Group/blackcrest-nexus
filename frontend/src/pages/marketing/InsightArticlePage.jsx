import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import SeoHead from '../../components/SeoHead';
import { getInsightBySlug, insightsArticles } from '../../content/insights';
import { articleSchema, breadcrumbSchema, defaultOrgSchema } from '../../utils/seo';

export default function InsightArticlePage({ slug }) {
  const article = getInsightBySlug(slug);
  if (!article) return <Navigate to="/insights" replace />;

  const related = insightsArticles.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <MarketingLayout>
      <SeoHead
        title={article.title}
        description={article.metaDescription}
        canonicalPath={`/insights/${article.slug}`}
        schemas={[
          defaultOrgSchema,
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/insights' },
            { name: article.heading, path: `/insights/${article.slug}` }
          ]),
          articleSchema({
            headline: article.heading,
            description: article.metaDescription,
            path: `/insights/${article.slug}`,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            authorName: 'BlackCrest Editorial Team'
          })
        ]}
      />
      <main className="container">
        <article className="marketing-card article-body">
          <h1>{article.heading}</h1>
          <p className="muted">By BlackCrest Editorial Team • {article.readTime}</p>
          {article.body.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          <section className="cta-band">
            <h2>Ready to modernize procurement decisions?</h2>
            <p>See how BlackCrest OS supports opportunity review, supplier intelligence, and sourcing execution.</p>
            <Link className="btn" to="/contact">Request a Demo</Link>
          </section>
          <section>
            <h2>Related articles</h2>
            <ul>
              {related.map((item) => <li key={item.slug}><Link to={`/insights/${item.slug}`}>{item.heading}</Link></li>)}
            </ul>
          </section>
        </article>
      </main>
    </MarketingLayout>
  );
}

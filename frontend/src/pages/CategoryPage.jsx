import React from 'react';
import SeoHead from '../components/SeoHead';

export default function CategoryPage() {
  return (
    <section>
      <SeoHead title="Analytics | BlackCrest OS" description="Spend, sourcing, supplier, and forecasting analytics." canonicalPath="/analytics" />
      <div className="page-header"><h1>Analytics</h1><p>Spend, sourcing, and supplier analytics with executive reporting and forecasting.</p></div>
      <div className="grid two">
        <article className="card"><h3>Spend analytics</h3><p>Category trend visibility, variance patterns, and sourcing efficiency metrics.</p></article>
        <article className="card"><h3>Forecasting</h3><p>Projected sourcing outcomes with confidence ranges and risk-adjusted scenarios.</p></article>
      </div>
      <article className="card"><h3>Executive reporting</h3><p>Download-ready reporting and AI-generated summaries for leadership review cycles.</p></article>
    </section>
  );
}

import React from 'react';
import SeoHead from '../components/SeoHead';

export default function IntelligencePage() {
  return (
    <section>
      <SeoHead title="Intelligence | BlackCrest OS" description="Bloomberg-style procurement signal engine for market, sourcing, and supplier intelligence." canonicalPath="/intelligence" />
      <div className="page-header"><h1>Intelligence</h1><p>Procurement Signal Engine — Bloomberg-style command layer for sourcing operations.</p></div>
      <div className="grid three">
        <article className="card"><h3>Market intelligence</h3><p>Volatility signals, category movement, and procurement trend acceleration indicators.</p></article>
        <article className="card"><h3>Disruption monitoring</h3><p>Supplier and lane-level disruptions with severity scoring and response options.</p></article>
        <article className="card"><h3>Opportunity-to-supplier matching</h3><p>AI-generated sourcing paths with operational feasibility assessment.</p></article>
      </div>
      <article className="card"><h3>Recommendations</h3><p>Execution-grade procurement recommendations with risk impact and timeline implications.</p></article>
    </section>
  );
}

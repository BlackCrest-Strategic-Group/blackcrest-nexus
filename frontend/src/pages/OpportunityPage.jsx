import React from 'react';
import SeoHead from '../components/SeoHead';

export default function OpportunityPage() {
  return (
    <section>
      <SeoHead title="Opportunities | BlackCrest OS" description="SAM.gov opportunity ingestion, scoring, and bid/no-bid intelligence." canonicalPath="/opportunities" />
      <div className="page-header"><h1>Opportunities</h1><p>SAM.gov aligned ingestion, scoring, watchlists, and AI bid/no-bid recommendations.</p></div>
      <div className="grid three">
        <article className="card"><h3>Ingestion</h3><p>Automated intake with NAICS, agency, timeline, and amendment tracking.</p></article>
        <article className="card"><h3>Opportunity scoring</h3><p>Weighted fit scoring across capability, margin, readiness, and strategic alignment.</p></article>
        <article className="card"><h3>Watchlists</h3><p>Saved searches and event monitoring for priority pursuits.</p></article>
      </div>
      <article className="card"><h3>Opportunity timeline</h3><p>Discovery → qualification → teaming → pricing strategy → submission readiness.</p></article>
    </section>
  );
}

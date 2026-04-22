import React from 'react';
import SeoHead from '../components/SeoHead';

export default function SupplierPage() {
  return (
    <section>
      <SeoHead title="Suppliers | BlackCrest OS" description="Supplier profiles, scoring, risk intelligence, and segmentation." canonicalPath="/suppliers" />
      <div className="page-header"><h1>Suppliers</h1><p>Supplier profiles, capability matching, risk intelligence, and performance indicators.</p></div>
      <div className="grid two">
        <article className="card"><h3>Supplier scoring</h3><p>Operational reliability, financial resilience, and compliance-adjacent signal scoring.</p></article>
        <article className="card"><h3>Geographic concentration</h3><p>Region-based exposure visualization for disruption-aware sourcing decisions.</p></article>
      </div>
      <article className="card"><h3>Segmentation and notes</h3><p>Strategic, tactical, and contingency segments with analyst notes and recommended actions.</p></article>
    </section>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const PAGE_CONTENT = {
  'procurement-intelligence': {
    title: 'Procurement Intelligence Software | BlackCrest OS',
    h1: 'Procurement Intelligence for Enterprise Operations',
    intro: 'BlackCrest OS is a procurement intelligence operating system designed for teams that need disciplined execution, strategic visibility, and trusted decision support.',
  },
  'supplier-intelligence': {
    title: 'Supplier Intelligence Platform | BlackCrest OS',
    h1: 'Supplier Intelligence for Risk-Aware Sourcing',
    intro: 'Supplier intelligence helps teams evaluate capability, resilience, and operational fit before disruption impacts delivery commitments.',
  },
  'strategic-sourcing-software': {
    title: 'Strategic Sourcing Software | BlackCrest OS',
    h1: 'Strategic Sourcing Software for Multi-Stage Decisions',
    intro: 'Strategic sourcing requires strong market context, repeatable workflows, and measurable outcomes that finance and operations can trust.',
  },
  'govcon-opportunity-analysis': {
    title: 'GovCon Opportunity Analysis | BlackCrest OS',
    h1: 'GovCon Opportunity Intelligence and SAM.gov Analysis',
    intro: 'Government contracting teams need faster qualification, bid/no-bid discipline, and clearer supplier alignment to win the right opportunities.',
  },
  'procurement-operating-system': {
    title: 'Procurement Operating System | BlackCrest OS',
    h1: 'A Procurement Operating System Built for Execution',
    intro: 'A procurement operating system unifies opportunities, suppliers, sourcing strategy, and analytics into one navigable command layer.',
  },
  'supplier-risk-monitoring': {
    title: 'Supplier Risk Monitoring Software | BlackCrest OS',
    h1: 'Supplier Risk Monitoring for Continuity-Critical Programs',
    intro: 'Supplier risk monitoring must be continuous, compliance-aware, and connected to sourcing execution—not siloed dashboards.',
  }
};

export default function SeoContentPage({ slug }) {
  const config = PAGE_CONTENT[slug] || PAGE_CONTENT['procurement-intelligence'];

  return (
    <main className="landing-page">
      <SeoHead title={config.title} description={config.intro} canonicalPath={`/${slug}`} />
      <article className="card seo-article">
        <h1>{config.h1}</h1>
        <p>{config.intro}</p>
        <h2>Why enterprises invest in procurement intelligence</h2>
        <p>Enterprise procurement leaders operate under simultaneous pressure: protect continuity, lower risk exposure, improve spend quality, and move faster than market volatility. BlackCrest OS addresses this through unified operational intelligence. Teams can ingest opportunity data, evaluate supplier readiness, score sourcing options, and route recommendations through governance-aware workflows. This structure helps organizations move from reactive firefighting to planned execution with measurable confidence.</p>
        <p>Modern procurement intelligence software must support strategic and tactical decisions. Strategic decisions include category strategy, supplier segmentation, and long-term sourcing posture. Tactical decisions include opportunity qualification, bidder alignment, milestone readiness, and risk mitigation tasks. BlackCrest OS combines both in one platform so teams avoid context switching and fragmented data interpretation.</p>

        <h2>Operational model for BlackCrest OS</h2>
        <h3>1. Opportunity discovery and qualification</h3>
        <p>Opportunity intelligence begins with ingestion and normalization. BlackCrest OS supports public-sector opportunity workflows, including SAM.gov aligned analysis, and allows teams to compare fit across NAICS, deadlines, teaming scenarios, and pursuit readiness. AI-generated summaries provide initial context, while enterprise users preserve human oversight through clear scoring criteria and auditable notes.</p>
        <h3>2. Supplier intelligence and resilience signals</h3>
        <p>Supplier intelligence in BlackCrest OS includes profile enrichment, performance indicators, concentration awareness, and disruption monitoring. Instead of treating suppliers as static records, the platform supports living intelligence: capability matches, risk flags, geographic context, and operational feasibility indicators that can be tied to active projects.</p>
        <h3>3. Strategic sourcing execution</h3>
        <p>With opportunity and supplier context in place, strategic sourcing teams can model execution paths. BlackCrest OS presents recommendation pathways that include risk impact, timeline implications, and expected operational outcomes. This supports cross-functional alignment between procurement, operations, program management, legal, and finance.</p>

        <h2>AI procurement software with compliance-aware language</h2>
        <p>BlackCrest OS uses security-first architecture principles and supports token-based integration architecture for enterprise environments. The platform is built for non-classified procurement workflows and does not claim government certification or authority it does not hold. This trust-centered positioning is essential for enterprise procurement teams that need clear, accurate language and practical governance support.</p>
        <p>Read-only connector posture can be used for selected ERP integration patterns, allowing organizations to pull reference data for analysis while reducing system-of-record risk. In each deployment, organizations can define role-based controls and process boundaries that align with internal governance models.</p>

        <h2>Frequently asked questions</h2>
        <h3>What is procurement intelligence?</h3>
        <p>Procurement intelligence is the structured use of internal and external data to prioritize sourcing decisions, evaluate supplier risk, and improve execution outcomes.</p>
        <h3>How does supplier intelligence improve sourcing?</h3>
        <p>Supplier intelligence improves sourcing by adding evidence-based context around capability, reliability, resilience, and fit before commitments are made.</p>
        <h3>Can this support GovCon teams?</h3>
        <p>Yes. BlackCrest OS supports GovCon opportunity analysis workflows and provides structured views for opportunity-to-supplier decisioning.</p>

        <div className="row">
          <Link className="btn" to="/register">Request demo</Link>
          <Link className="btn ghost" to="/login">Launch platform</Link>
        </div>
      </article>
    </main>
  );
}

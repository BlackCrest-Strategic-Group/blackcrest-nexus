import SeoHead from '../components/SeoHead';

const PRINCIPLES = [
  'Human oversight is required for critical procurement actions.',
  'AI recommendations are advisory only and never autonomous approvals.',
  'No autonomous purchasing authority is enabled in this platform.',
  'Explainability-first architecture powers every major recommendation.',
  'Audit logging is enabled for approvals, overrides, escalations, and exports.',
  'Role-based access controls enforce least-privilege operations.',
  'ERP integrations are read-only to protect operational systems.',
  'Privacy-first design protects procurement-sensitive data.',
  'Sensitive procurement data is excluded from model training pipelines.',
  'User accountability is preserved with signed and traceable actions.'
];

export default function GovernancePolicyPage() {
  return (
    <main className="landing-page">
      <SeoHead title="AI Governance Principles | BlackCrest" description="Public AI governance principles for human-centered procurement intelligence." canonicalPath="/ai-governance-principles" />
      <section className="hero">
        <h1>AI Governance Principles</h1>
        <p>Human-Centered Procurement Intelligence with explainable, auditable, and accountable operations.</p>
      </section>
      <section className="grid two">
        {PRINCIPLES.map((principle) => (
          <article key={principle} className="card">
            <h3>Principle</h3>
            <p>{principle}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

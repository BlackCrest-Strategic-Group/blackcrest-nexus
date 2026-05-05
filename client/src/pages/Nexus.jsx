import Chat from '../components/Chat';

const modules = [
  { title: 'Sourcing', detail: 'Supplier options, lead-time visibility, and risk-aware recommendations.' },
  { title: 'Category Management', detail: 'Organize spend by category and tune strategy by segment.' },
  { title: 'Purchasing', detail: 'Streamline purchasing workflows with practical execution steps.' },
  { title: 'ERP Connection', detail: 'Designed for integration with ERP inputs and downstream processes.' },
  { title: 'Flexible by Design', detail: 'Structured codebase that your dev team can quickly adapt.' }
];

export default function Nexus({ token }) {
  return (
    <section>
      <h2>BlackCrest Nexus — Procurement Intelligence</h2>
      <p className="sub">Ask TJ for sourcing and procurement analysis.</p>
      <div className="module-grid">
        {modules.map((m) => (
          <article key={m.title} className="card">
            <h3>{m.title}</h3>
            <p>{m.detail}</p>
          </article>
        ))}
      </div>
      <Chat mode="business" token={token} />
    </section>
  );
}

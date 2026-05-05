import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="landing">
      <p className="eyebrow">BlackCrest Strategic Group</p>
      <h1>Procurement Intelligence Platform</h1>
      <p className="sub">Sourcing, category management, purchasing, and ERP-connected execution in one developer-friendly foundation.</p>
      <Link className="cta" to="/nexus">Open Procurement Workspace</Link>
    </section>
  );
}

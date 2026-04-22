import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const trust = ['GovCon Ready', 'Supplier Intelligence', 'Strategic Sourcing', 'Opportunity Analysis', 'AI Workflow Automation', 'Compliance-Aware Architecture'];
const features = ['Opportunity Intelligence', 'Supplier Intelligence', 'Procurement Analytics', 'AI Sourcing Assistant', 'Contract Intelligence', 'Risk Monitoring', 'Spend Visibility', 'Market Signal Analysis'];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <SeoHead title="BlackCrest OS | Procurement Intelligence Operating System" description="AI-Powered Procurement, Supplier, and Opportunity Intelligence." canonicalPath="/" />
      <section className="card hero">
        <h1>Procurement Intelligence for the Modern Enterprise</h1>
        <p>BlackCrest OS transforms sourcing, supplier intelligence, and opportunity analysis into a unified AI-powered operating system.</p>
        <div className="row"><Link className="btn" to="/register">Request Demo</Link><Link className="btn ghost" to="/login">Launch Platform</Link></div>
      </section>
      <section className="card"><h2>Enterprise trust indicators</h2><div className="grid three">{trust.map((t) => <div key={t} className="chip">{t}</div>)}</div></section>
      <section className="card"><h2>Feature grid</h2><div className="grid four">{features.map((f) => <article key={f} className="card nested"><h3>{f}</h3><p>Enterprise-grade visibility and operational decision support.</p></article>)}</div></section>
      <section className="card"><h2>Workflow visualization</h2><p>Opportunity Discovery → Supplier Evaluation → Risk Analysis → Sourcing Strategy → Execution Intelligence</p></section>
      <section className="card"><h2>Executive dashboard preview</h2><div className="chart-bars">{[90,72,63,54,80,66].map((n,i)=><span key={i} style={{height:`${n}%`}}/>)}</div></section>
      <section className="card"><h2>Procurement intelligence content</h2><p>BlackCrest OS combines procurement intelligence, sourcing intelligence, supplier analytics, GovCon opportunity analysis, and strategic sourcing automation in one enterprise workspace.</p><div className="row"><Link to="/procurement-intelligence">Procurement Intelligence</Link><Link to="/supplier-intelligence">Supplier Intelligence</Link><Link to="/strategic-sourcing-software">Strategic Sourcing</Link></div></section>
      <footer className="card footer-links"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Security</a><a href="#">Contact</a><a href="#">LinkedIn</a><a href="#">Platform Status</a></footer>
    </main>
  );
}

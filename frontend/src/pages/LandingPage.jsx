import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="card"><strong>Demonstration Environment – Uses synthetic and public data only</strong></section>
      <section className="hero card">
        <h1>Intelligence Before Procurement Starts</h1>
        <p>AI-powered procurement intelligence for category managers, sourcing teams, and procurement leaders.</p>
        <div className="row"><Link className="btn" to="/register">Sign Up</Link><Link className="btn ghost" to="/login">Log In</Link><button className="btn ghost">Request Demo</button></div>
      </section>
      <section className="grid three">
        {['Category Intelligence', 'Supplier Intelligence', 'Opportunity Intelligence'].map((p) => <article key={p} className="card"><h3>{p}</h3><p>Connected insights across upstream, midstream, and downstream procurement workflows.</p></article>)}
      </section>
      <section className="card"><h2>Who It’s For</h2><p>Category Managers • Sourcing Managers • Procurement Leaders • Subcontracts Teams</p></section>
      <section className="grid three">{['See Signals', 'Evaluate Options', 'Take Action'].map((h) => <article key={h} className="card"><h3>{h}</h3></article>)}</section>
      <section className="card"><h2>Benefits</h2><p>Reduce blind spots • Find better suppliers faster • Improve decisions • Reduce risk</p></section>
      <section className="card"><strong>Designed for Non-Classified Use Only</strong></section>
      <footer className="row"><Link to="/privacy">Privacy Policy</Link><a href="#">Terms</a></footer>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const capabilities = [
  'Real-time hybrid opportunity search across commercial and federal markets',
  'AI-supported bid/no-bid scoring and defensible recommendation workflows',
  'Cross-market compliance and requirement review support',
  'Supplier and pricing intelligence for faster sourcing decisions'
];

export default function LandingPage() {
  return (
    <main className="landing-page" data-testid="landing-page">
      <section className="landing-hero card" data-testid="landing-hero">
        <p className="landing-kicker">BlackCrest Procurement Intelligence Engine</p>
        <h1>Intelligence Before Procurement Starts</h1>
        <p>
          Make faster commercial and federal procurement decisions with AI. Find, evaluate, and prioritize opportunities in minutes,
          with clear, defensible workflows for sourcing, category, and purchasing teams.
        </p>
        <div className="row">
          <Link className="btn" to="/login" data-testid="landing-signin">Sign In</Link>
          <Link className="btn ghost" to="/register" data-testid="landing-register">Create Account</Link>
        </div>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Core Platform Capabilities</h2>
          <ul className="landing-list">
            {capabilities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="card">
          <h2>Who It Supports</h2>
          <p>Category managers, sourcing managers, procurement leaders, proposal teams, and contracting operations.</p>
          <p className="muted">Built for hybrid procurement teams and multi-source market intelligence workflows.</p>
        </article>
      </section>

      <section className="card landing-trust">
        <h2>Trust, Scope, and Protection Commitments</h2>
        <p><strong>Demonstration Environment:</strong> Uses synthetic and publicly available data plus user-provided inputs.</p>
        <p><strong>Clean-room posture:</strong> No proprietary or confidential employer data is accessed, stored, or processed.</p>
        <p><strong>Usage boundary:</strong> Designed for external/public-data procurement workflows and non-classified use only.</p>
        <p><strong>Privacy posture:</strong> Access is limited to authorized users and secure session controls.</p>
      </section>

      <section className="card landing-cta">
        <h2>Ready to enter the platform?</h2>
        <p>Sign in to access dashboard workflows, supplier intelligence, opportunity analysis, and decision-support tooling.</p>
        <div className="row">
          <Link className="btn" to="/login">Go to Secure Login</Link>
          <Link className="btn ghost" to="/privacy">Privacy Policy</Link>
        </div>
      </section>
    </main>
  );
}

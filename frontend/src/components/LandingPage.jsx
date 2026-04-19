import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  "Opportunity Discovery",
  "Win Probability Scoring",
  "Truth Serum Recommendations",
  "Margin & Risk Signals",
  "Compliance Analysis",
  "Personalized Intelligence Feed"
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Truth Serum AI</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">Procurement intelligence that finds revenue before your competitors do.</h1>
          <p className="max-w-3xl text-slate-300 text-lg">Truth Serum AI continuously scans federal opportunities, scores win probability, margin, and strategic fit, then tells your team exactly what to pursue, partner, or ignore.</p>
          <div className="flex gap-3 flex-wrap">
            <button className="btn-primary" onClick={() => navigate('/login?mode=register')}>Start Free</button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>Watch Demo</button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-5">Core intelligence stack</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature} className="rounded-xl border border-slate-800 bg-slate-900 p-5">{feature}</div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-900 bg-slate-900 p-8">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="space-y-3 text-slate-200">
            <li>1. Build your profile</li>
            <li>2. Engine scans & scores</li>
            <li>3. Act on prioritized opportunities</li>
          </ol>
        </section>

        <section className="flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="px-3 py-2 rounded-full border border-slate-700">Designed for Non-Classified Use Only</span>
          <span className="px-3 py-2 rounded-full border border-slate-700">Secure login</span>
          <span className="px-3 py-2 rounded-full border border-slate-700">Built for procurement professionals</span>
        </section>

        <section className="rounded-2xl bg-cyan-400 text-slate-950 p-8">
          <h2 className="text-3xl font-bold">Build your intelligence profile.</h2>
          <p className="mt-2">Register now and launch your personalized opportunity feed.</p>
          <button className="mt-5 rounded-lg bg-slate-950 text-white px-5 py-3 font-semibold" onClick={() => navigate('/login?mode=register')}>Register</button>
        </section>
      </div>
    </div>
  );
}

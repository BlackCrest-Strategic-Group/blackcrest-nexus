import React from "react";
import { useNavigate } from "react-router-dom";

const previewCards = [
  { title: "Bid / No-Bid", value: "BID", locked: true },
  { title: "Win Probability", value: "74%", locked: true },
  { title: "Risk Score", value: "42/100", locked: true },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-14">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">BlackCrest Procurement Intelligence OS</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">AI-Powered Procurement Intelligence Engine</h1>
          <p className="max-w-3xl text-slate-300 text-lg">
            Know what to pursue, how to win, and what it&apos;s worth before your competitors do.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button className="btn-primary" onClick={() => navigate("/login?mode=register")}>Get Access</button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Preview</h2>
            <span className="text-xs rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-300">Preview Mode • Locked</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {previewCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2 blur-[2px] select-none">{card.value}</p>
                <p className="text-xs text-amber-300 mt-2">Unlock Full Intelligence</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-5">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {["Decision Engine", "Supplier Intelligence", "Cost + Margin Analysis", "Risk Detection"].map((feature) => (
              <div key={feature} className="rounded-xl border border-slate-800 bg-slate-900 p-5">{feature}</div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-cyan-400 text-slate-950 p-8">
          <h2 className="text-3xl font-bold">Unlock Full Intelligence</h2>
          <p className="mt-2">Run live opportunity scoring, supplier recommendations, financial modeling, and truth-engine insights.</p>
          <button className="mt-5 rounded-lg bg-slate-950 text-white px-5 py-3 font-semibold" onClick={() => navigate("/login?mode=register")}>Unlock Full Intelligence</button>
        </section>
      </div>
    </div>
  );
}

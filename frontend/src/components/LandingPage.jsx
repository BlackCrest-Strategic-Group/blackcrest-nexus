import React from "react";
import { useNavigate } from "react-router-dom";

const PROBLEMS = [
  "Manual procurement processes that delay action",
  "Slow bid evaluation cycles that miss opportunities",
  "Supplier risk hidden in fragmented data",
  "Compliance complexity across federal and commercial buying"
];

const SOLUTIONS = [
  "Opportunity intelligence across federal + commercial signals",
  "Supplier intelligence with fit and risk visibility",
  "Compliance visibility for faster, safer decisions",
  "Category forecasting for proactive planning",
  "Workflow automation for repeatable execution"
];

const CAPABILITIES = [
  "Opportunity Analysis",
  "Bid/No-Bid + Buy/Hold Scoring",
  "Supplier Fit & Risk Scoring",
  "Compliance Intelligence",
  "Category Forecasting",
  "Procurement Workflow Support"
];

const OUTCOMES = [
  "5x faster evaluation",
  "70% less manual work",
  "Better strategic decisions",
  "Reduced procurement risk"
];

function Section({ title, items }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 md:p-8">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-white">BlackCrest Procurement Intelligence Engine</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Enterprise Procurement Platform</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">BlackCrest Procurement Intelligence Engine</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            The Procurement Intelligence Engine for Faster, Smarter Decisions
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
            AI-powered decision support for sourcing, category management, purchasing, and GovCon teams.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => navigate("/login?mode=register&plan=pro")}>Book Demo</button>
            <button className="btn-secondary" onClick={() => navigate("/app")}>Open Platform</button>
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Section title="Problem" items={PROBLEMS} />
          <Section title="Solution" items={SOLUTIONS} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Section title="Capabilities" items={CAPABILITIES} />
          <Section title="Outcomes" items={OUTCOMES} />
        </div>

        <section className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center md:p-8">
          <h3 className="text-2xl font-semibold text-white">Ready to modernize procurement decisions?</h3>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-200">
            Consolidate opportunity intelligence, supplier analysis, compliance visibility, and execution support in one platform.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={() => navigate("/login?mode=register&plan=pro")}>Book Demo</button>
            <button className="btn-secondary" onClick={() => navigate("/app")}>Open Platform</button>
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const VALUE_PILLARS = [
  {
    title: "Source smarter",
    body: "Unify federal feeds, supplier signals, internal demand, and commercial market data into one AI-ranked sourcing pipeline.",
    icon: "🧭"
  },
  {
    title: "Categorize with confidence",
    body: "See category exposure, pricing volatility, and contract risk in plain English before your team commits to strategy.",
    icon: "🧠"
  },
  {
    title: "Purchase with precision",
    body: "Turn analysis into action with guided workflows, stakeholder-ready summaries, and measurable next steps.",
    icon: "⚡"
  }
];

const CAPABILITIES = [
  "Hybrid opportunity discovery (Federal + Commercial)",
  "AI bid / no-bid and buy / hold recommendations",
  "Regulatory + policy compliance intelligence",
  "Supplier discovery, fit scoring, and performance insights",
  "Category trend and cost-pressure forecasting",
  "Procurement workflow automation with role-based dashboards"
];

const PERSONAS = [
  {
    role: "Sourcing Managers",
    impact: "Find qualified suppliers and opportunities faster, with less manual triage."
  },
  {
    role: "Category Managers",
    impact: "See risk, margin pressure, and demand shifts before they become expensive surprises."
  },
  {
    role: "Purchasing Managers",
    impact: "Move from reactive buying to proactive decisions backed by real-time intelligence."
  }
];

const STATS = [
  { label: "Faster Opportunity Triage", value: "5x" },
  { label: "Less Manual Review", value: "70%" },
  { label: "Cross-Market Visibility", value: "360°" },
  { label: "Decision Support", value: "24/7" }
];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState(0);

  const spotlight = useMemo(() => PERSONAS[activePersona], [activePersona]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
          >
            <img src="/assets/logo.png" alt="BlackCrest Strategic Group" className="h-10 w-auto rounded-md" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">BlackCrest Strategic Group</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-400">AI Procurement Intelligence Engine</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button className="btn-secondary text-xs" onClick={() => navigate("/login")}>Sign In</button>
            <button className="btn-primary text-xs" onClick={() => navigate("/login?mode=register&plan=pro")}>Book a Demo</button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),transparent_32%),radial-gradient(circle_at_right,rgba(217,119,6,0.2),transparent_42%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)]">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div>
              <Badge>Now built for Hybrid Procurement</Badge>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
                The intelligence layer for every sourcing, category, and purchasing decision.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                We evolved from a GovCon-first experience into a full hybrid model for federal and commercial buying teams. Use AI to prioritize opportunities, reduce procurement risk, and drive better decisions across the entire lifecycle.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge>Federal + Commercial Signals</Badge>
                <Badge>Supplier Intelligence</Badge>
                <Badge>Category Forecasting</Badge>
                <Badge>Decision-Ready Summaries</Badge>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={() => navigate("/login?mode=register&plan=pro")}>Start Free Trial</button>
                <button className="btn-secondary" onClick={() => navigate("/dashboard")}>Open Platform</button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Live value snapshot</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
                <p className="text-sm font-semibold text-cyan-200">AI Procurement Intelligence Engine</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Built to reduce time-to-decision and give your teams a shared operating picture across strategic sourcing, category planning, and purchasing execution.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-6">
            <SectionTitle
              eyebrow="Why teams switch"
              title="From GovCon app to hybrid procurement command center"
              subtitle="This platform now supports both public-sector and private-sector workflows so your team can execute one consistent procurement strategy across markets."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {VALUE_PILLARS.map((pillar) => (
                <article key={pillar.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-2xl">{pillar.icon}</div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionTitle
                eyebrow="Core capabilities"
                title="Built for real procurement operators"
                subtitle="Everything you need to accelerate decisions and reduce procurement friction for your business users."
              />
              <ul className="mt-8 space-y-3">
                {CAPABILITIES.map((capability) => (
                  <li key={capability} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Built by role</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PERSONAS.map((persona, idx) => (
                  <button
                    key={persona.role}
                    onClick={() => setActivePersona(idx)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activePersona === idx ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {persona.role}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-900">{spotlight.role}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{spotlight.impact}</p>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-slate-100">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-300">Outcome</p>
                <p className="mt-2 text-sm leading-7">
                  Procurement teams get one engine for sourcing, category intelligence, and purchasing operations instead of disconnected tools and spreadsheets.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">Ready to move faster?</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">Give your procurement team the advantage.</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Launch the AI Procurement Intelligence Engine and make it easier for sourcing, category, and purchasing managers to make better decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={() => navigate("/login?mode=register&plan=pro")}>Get Started</button>
              <button className="btn-secondary" onClick={() => navigate("/login")}>Schedule a Walkthrough</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

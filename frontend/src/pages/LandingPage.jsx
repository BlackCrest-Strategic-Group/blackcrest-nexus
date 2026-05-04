import React from 'react';
import SeoHead from '../components/SeoHead';

const kpis = [
  { label: 'Suppliers Onboarded', value: 24 },
  { label: 'Active Buyer Requests', value: 8 },
  { label: 'Matches Made', value: 12 }
];

const buyerDemand = [
  'Looking for packaging supplier – 10,000 units',
  'Need aerospace fasteners – urgent',
  'Food distributor seeking regional supplier',
  'Medical buyer sourcing sterile tubing - Q3 fulfillment',
  'Retail chain needs sustainable shipping materials'
];

const suppliers = [
  'Precision Packaging Co. – USA',
  'AeroFast Components – TX',
  'FreshSource Distribution – FL',
  'SteriLine Manufacturing – CA',
  'GreenRoute Logistics Supply – IL'
];

const matches = [
  {
    buyer: 'Aerospace Parts Co.',
    need: 'Fasteners',
    supplier: 'AeroFast Components',
    confidence: '78%'
  },
  {
    buyer: 'NorthStar Foods',
    need: 'Regional distribution support',
    supplier: 'FreshSource Distribution',
    confidence: '84%'
  },
  {
    buyer: 'PackPro Direct',
    need: 'High-volume packaging units',
    supplier: 'Precision Packaging Co.',
    confidence: '81%'
  }
];

const panelClass =
  'rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-4 shadow-[0_0_22px_rgba(45,212,191,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200/35 hover:shadow-[0_0_30px_rgba(59,130,246,0.22)]';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <SeoHead
        title="BlackCrest Nexus | Live Supplier-Demand Matching"
        description="A live command-center preview that connects suppliers to real buyer demand instantly."
        canonicalPath="/"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className={`${panelClass} text-center`}>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-300">Live command center</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">BlackCrest Nexus</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
            Connect suppliers to real demand instantly
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <article key={kpi.label} className={panelClass}>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{kpi.label}</p>
              <p className="mt-3 text-4xl font-extrabold text-cyan-300 sm:text-5xl">{kpi.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className={panelClass}>
            <h2 className="mb-4 text-xl font-semibold text-white">Live Buyer Demand</h2>
            <div className="space-y-3">
              {buyerDemand.map((demand) => (
                <div
                  key={demand}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-slate-800"
                >
                  {demand}
                </div>
              ))}
            </div>
          </article>

          <article className={panelClass}>
            <h2 className="mb-4 text-xl font-semibold text-white">Available Suppliers</h2>
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-300/40 hover:bg-slate-800"
                >
                  {supplier}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={panelClass}>
          <h2 className="mb-4 text-xl font-semibold">Matched Opportunities</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {matches.map((match) => (
              <article
                key={`${match.buyer}-${match.supplier}`}
                className="rounded-xl border border-emerald-300/30 bg-gradient-to-br from-slate-900 to-emerald-950/40 p-4"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-300">Match</p>
                <p className="mt-2 text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">Buyer:</span> {match.buyer}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">Need:</span> {match.need}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">→ Matched Supplier:</span> {match.supplier}
                </p>
                <p className="mt-3 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Confidence: {match.confidence}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${panelClass} flex flex-wrap items-center justify-center gap-3 py-6`}>
          <button className="rounded-xl border border-cyan-200/40 bg-cyan-400/15 px-6 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/30">
            Join as a Supplier
          </button>
          <button className="rounded-xl border border-indigo-200/40 bg-indigo-400/15 px-6 py-3 text-sm font-bold text-indigo-100 transition hover:bg-indigo-400/30">
            Submit Buyer Request
          </button>
        </section>
      </div>
    </main>
  );
}

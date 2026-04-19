import React from "react";

const DECISION_STYLES = {
  BID: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  NO_BID: "bg-red-500/20 text-red-300 border-red-400/30",
  "CONDITIONAL BID": "bg-amber-500/20 text-amber-300 border-amber-400/30"
};

function Meter({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-100">{value}%</p>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function ScoreCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-100">{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function TruthSerumResults({ result }) {
  if (!result?.decision) return null;

  const decisionClass = DECISION_STYLES[result.decision] || DECISION_STYLES["CONDITIONAL BID"];

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-6 shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Truth Serum Decision Engine</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Procurement Decision</h3>
        </div>
        <span className={`rounded-full border px-5 py-2 text-sm font-bold ${decisionClass}`}>
          {result.decision.replace("_", " ")}
        </span>
      </div>

      <Meter label="Win Probability" value={result.winProbability} />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Pill label="Margin Band" value={result.marginBand} />
        <Pill label="Effort Level" value={result.effortLevel} />
        <Pill label="Execution Reality" value={result.executionFeasibility} />
        <Pill label="Compliance Risk" value={result.complianceRisk} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Hidden Bid Risk</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-200">
            {(result.topRisks || []).map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2"><span className="text-red-300">•</span>{risk}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Confidence Drivers</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-200">
            {(result.keyDrivers || []).map((driver, idx) => (
              <li key={idx} className="flex items-start gap-2"><span className="text-cyan-300">•</span>{driver}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Truth Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-100">{result.truthSummary}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Recommended Move</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-100">{result.recommendedAction}</p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Decision Drivers • Execution Reality • Margin Pressure</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ScoreCard label="Capability Fit" value={result.scoreBreakdown?.capabilityFit ?? 0} />
          <ScoreCard label="Past Performance Fit" value={result.scoreBreakdown?.pastPerformanceFit ?? 0} />
          <ScoreCard label="Margin Potential" value={result.scoreBreakdown?.marginPotential ?? 0} />
          <ScoreCard label="Timeline Realism" value={result.scoreBreakdown?.timelineRealism ?? 0} />
          <ScoreCard label="Compliance Burden" value={result.scoreBreakdown?.complianceBurden ?? 0} />
          <ScoreCard label="Supplier Readiness" value={result.scoreBreakdown?.supplierReadiness ?? 0} />
        </div>
      </div>
    </div>
  );
}

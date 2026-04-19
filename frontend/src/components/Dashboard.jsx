import React, { useState } from "react";
import { procurementApi } from "../utils/api.js";

export default function Dashboard() {
  const [form, setForm] = useState({
    title: "",
    naicsCode: "541330",
    contractValue: "2500000",
    text: "",
    competitorCount: 4,
    teamCapacity: 70,
    internalCostRatio: 0.72,
    riskTolerance: "balanced",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await procurementApi.analyzeOpportunity({
        ...form,
        contractValue: Number(form.contractValue),
        competitorCount: Number(form.competitorCount),
        teamCapacity: Number(form.teamCapacity),
        internalCostRatio: Number(form.internalCostRatio),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr,1fr] gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Procurement Decision Engine</h1>
          <p className="text-sm text-slate-400 mt-1">Upload or paste opportunity text to generate bid strategy, win probability, supplier recommendations, and financial outlook.</p>

          <form className="space-y-3 mt-5" onSubmit={runAnalysis}>
            <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Opportunity title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <div className="grid md:grid-cols-2 gap-3">
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="NAICS" value={form.naicsCode} onChange={(e) => setForm((p) => ({ ...p, naicsCode: e.target.value }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" type="number" placeholder="Contract value" value={form.contractValue} onChange={(e) => setForm((p) => ({ ...p, contractValue: e.target.value }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" type="number" placeholder="Competitors" value={form.competitorCount} onChange={(e) => setForm((p) => ({ ...p, competitorCount: e.target.value }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" type="number" placeholder="Team capacity (0-100)" value={form.teamCapacity} onChange={(e) => setForm((p) => ({ ...p, teamCapacity: e.target.value }))} />
            </div>
            <textarea className="input min-h-52 bg-slate-950 border-slate-700 text-white" placeholder="Paste opportunity / RFP text" value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} required />
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Analyzing..." : "Run Decision Analysis"}</button>
            {error ? <p className="text-rose-300 text-sm">{error}</p> : null}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Decision Output</h2>
          {!result ? <p className="text-sm text-slate-400 mt-3">No analysis yet.</p> : (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Recommendation" value={result.decision.recommendation} />
                <Metric label="Win Probability" value={`${result.decision.winProbabilityPct}%`} />
                <Metric label="Risk Score" value={`${result.decision.riskScore}/100`} />
                <Metric label="Expected Margin" value={`${result.decision.expectedMarginPct}%`} />
                <Metric label="Estimated Cost" value={`$${Number(result.decision.estimatedCost).toLocaleString()}`} />
                <Metric label="Capital Requirement" value={`$${Number(result.decision.capitalRequirement).toLocaleString()}`} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Recommended Suppliers</h3>
                <ul className="space-y-2 text-sm">
                  {result.suppliers.map((s) => <li key={s.supplierId} className="rounded-lg bg-slate-950 border border-slate-800 p-2">{s.supplierName} — Score {s.score}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Strategy</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">
                  {result.decision.strategy.map((tip) => <li key={tip}>{tip}</li>)}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

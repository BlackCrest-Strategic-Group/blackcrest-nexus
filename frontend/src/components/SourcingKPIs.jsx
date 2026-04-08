import React, { useState, useEffect } from "react";
import { suppliersApi, findSuppliersApi } from "../utils/api.js";

const KPI_LABELS = {
  delivery: "On-Time Delivery",
  quality: "Quality",
  cost: "Cost Performance",
  responsiveness: "Responsiveness",
  compliance: "Compliance"
};

const KPI_ICONS = {
  delivery: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  quality: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  cost: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  responsiveness: "M13 10V3L4 14h7v7l9-11h-7z",
  compliance: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
};

function ScoreBar({ score, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function KpiCard({ category, avgScore, minScore, maxScore, count }) {
  const label = KPI_LABELS[category] || category;
  const icon = KPI_ICONS[category] || KPI_ICONS.quality;
  const score = Math.round(avgScore || 0);
  const color = score >= 80 ? "text-emerald-600 bg-emerald-50" : score >= 60 ? "text-blue-600 bg-blue-50"
    : score >= 40 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{score}<span className="text-sm font-normal text-slate-400">/100</span></p>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
      <ScoreBar score={score} />
      <div className="flex justify-between text-xs text-slate-400">
        <span>Min: {Math.round(minScore || 0)}</span>
        <span>{count} supplier{count !== 1 ? "s" : ""}</span>
        <span>Max: {Math.round(maxScore || 0)}</span>
      </div>
    </div>
  );
}

/* ── Find Suppliers Panel ── */
function FindSuppliersPanel() {
  const [form, setForm] = useState({ summary: "", naicsCode: "", location: "", govReady: true });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!form.summary.trim() && !form.naicsCode.trim()) {
      setError("Please enter a requirement summary or NAICS code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await findSuppliersApi.search(form);
      setResults(res.data.suppliers || []);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="section-title">AI Supplier Recommendations</h3>
        <p className="section-subtitle">Find the best-fit suppliers for a specific opportunity</p>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Requirement Summary</label>
          <textarea
            className="input h-20 resize-none"
            placeholder="Describe the requirement, e.g. 'Cloud migration and DevSecOps services for federal civilian agency'…"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </div>
        <div>
          <label className="label">NAICS Code</label>
          <input
            className="input"
            placeholder="e.g. 541511"
            value={form.naicsCode}
            onChange={(e) => setForm({ ...form, naicsCode: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Location (optional)</label>
          <input
            className="input"
            placeholder="e.g. Arlington, VA"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-navy-600 focus:ring-navy-500"
              checked={form.govReady}
              onChange={(e) => setForm({ ...form, govReady: e.target.checked })}
            />
            Gov-ready suppliers only
          </label>
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Suppliers
              </>
            )}
          </button>
        </div>
      </form>

      {error && <div className="alert-error text-sm">{error}</div>}

      {results !== null && (
        <div>
          {results.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No matching suppliers found. Try broadening your search.</p>
          ) : (
            <div className="space-y-3 mt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{results.length} supplier{results.length !== 1 ? "s" : ""} recommended</p>
              {results.map((supplier, idx) => (
                <div key={supplier.id || idx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{supplier.name}</p>
                        {supplier.govReady && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Gov-Ready</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{supplier.location}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-slate-800">{supplier.fitScore}<span className="text-xs text-slate-400">/100</span></div>
                      <div className="text-xs text-slate-400">Fit Score</div>
                    </div>
                  </div>
                  <ScoreBar score={supplier.fitScore} />
                  {supplier.explanation && (
                    <p className="text-xs text-slate-600 italic">"{supplier.explanation}"</p>
                  )}
                  {supplier.matchReasons?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {supplier.matchReasons.map((r) => (
                        <span key={r} className="text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                  {supplier.certifications?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications.map((c) => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main SourcingKPIs Component ── */
export default function SourcingKPIs() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("kpis"); // "kpis" | "find"

  useEffect(() => {
    setLoading(true);
    suppliersApi
      .kpiSummary()
      .then((res) => setKpiData(res.data))
      .catch(() => setError("Failed to load KPI data."))
      .finally(() => setLoading(false));
  }, []);

  const kpiOrder = ["delivery", "quality", "cost", "responsiveness", "compliance"];
  const orderedKpis = kpiOrder
    .map((cat) => kpiData?.kpiAverages?.find((k) => k._id === cat))
    .filter(Boolean);

  // Include any KPI categories not in the default order
  const extraKpis = (kpiData?.kpiAverages || []).filter((k) => !kpiOrder.includes(k._id));
  const allKpis = [...orderedKpis, ...extraKpis];

  const overallAvg = allKpis.length > 0
    ? Math.round(allKpis.reduce((s, k) => s + (k.avgScore || 0), 0) / allKpis.length)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Sourcing &amp; Supply Chain KPIs</h2>
          <p className="text-sm text-slate-500">Aggregate supplier performance metrics and AI-powered recommendations</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {[{ id: "kpis", label: "KPI Dashboard" }, { id: "find", label: "Find Suppliers" }].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeView === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      {activeView === "find" ? (
        <FindSuppliersPanel />
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-6 w-1/3 rounded" />
              <div className="skeleton h-2 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      ) : allKpis.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-slate-600 font-semibold">No KPI data yet</p>
          <p className="text-slate-400 text-sm mt-1">Add suppliers and score them in the Suppliers tab to see KPI analytics here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Health Score */}
          {overallAvg !== null && (
            <div className="card bg-gradient-to-r from-navy-900 to-navy-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-300 text-sm font-medium">Overall Supply Chain Health</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-4xl font-bold">{overallAvg}</span>
                    <span className="text-navy-300 text-lg mb-1">/100</span>
                  </div>
                  <p className="text-navy-300 text-xs mt-1">
                    {overallAvg >= 80 ? "✓ Excellent" : overallAvg >= 60 ? "⚠ Good — monitor low performers" : "✗ Needs attention"}
                  </p>
                </div>
                <svg className="w-16 h-16 text-navy-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          )}

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {allKpis.map((kpi) => (
              <KpiCard
                key={kpi._id}
                category={kpi._id}
                avgScore={kpi.avgScore}
                minScore={kpi.minScore}
                maxScore={kpi.maxScore}
                count={kpi.count}
              />
            ))}
          </div>

          {/* At-Risk and Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* At-Risk Suppliers */}
            {kpiData?.atRiskSuppliers?.length > 0 && (
              <div className="card space-y-3">
                <h3 className="section-title text-red-700">⚠ At-Risk Suppliers (Score &lt; 60)</h3>
                <div className="space-y-2">
                  {kpiData.atRiskSuppliers.map((s) => (
                    <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.tier?.replace("_", " ")} · {s.status}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">{s.overallScore ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Performers */}
            {kpiData?.topPerformers?.length > 0 && (
              <div className="card space-y-3">
                <h3 className="section-title text-emerald-700">★ Top Performers (Score ≥ 80)</h3>
                <div className="space-y-2">
                  {kpiData.topPerformers.map((s) => (
                    <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.tier?.replace("_", " ")} · {s.status}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{s.overallScore ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status and Tier breakdowns */}
          {(kpiData?.statusBreakdown?.length > 0 || kpiData?.tierBreakdown?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpiData?.statusBreakdown?.length > 0 && (
                <div className="card space-y-3">
                  <h3 className="section-title">Supplier Status Breakdown</h3>
                  <div className="space-y-2">
                    {kpiData.statusBreakdown.map((s) => (
                      <div key={s._id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-slate-700 font-medium">{s._id || "Unknown"}</span>
                          <span className="text-slate-500">{s.count} supplier{s.count !== 1 ? "s" : ""} · Avg: {Math.round(s.avgScore || 0)}</span>
                        </div>
                        <ScoreBar score={s.avgScore || 0} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {kpiData?.tierBreakdown?.length > 0 && (
                <div className="card space-y-3">
                  <h3 className="section-title">Supplier Tier Breakdown</h3>
                  <div className="space-y-2">
                    {kpiData.tierBreakdown.map((t) => (
                      <div key={t._id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-slate-700 font-medium">{(t._id || "Unknown").replace("_", " ")}</span>
                          <span className="text-slate-500">{t.count} supplier{t.count !== 1 ? "s" : ""} · Avg: {Math.round(t.avgScore || 0)}</span>
                        </div>
                        <ScoreBar score={t.avgScore || 0} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

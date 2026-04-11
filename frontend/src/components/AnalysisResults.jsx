import React, { useState } from "react";
import { findSuppliersApi, suppliersApi } from "../utils/api.js";

const RECOMMENDATION_STYLE = {
  "Strong Bid":      { badge: "badge-green",  bar: "bg-emerald-500", label: "Strong Bid" },
  "Bid with Review": { badge: "badge-blue",   bar: "bg-blue-500",    label: "Bid with Review" },
  "Borderline":      { badge: "badge-yellow", bar: "bg-amber-500",   label: "Borderline" },
  "No-Bid":          { badge: "badge-red",    bar: "bg-red-500",     label: "No-Bid" }
};

function ScoreGauge({ score }) {
  const r = 40;
  const circumference = Math.PI * r;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-16 mb-1">
        <svg viewBox="0 0 112 60" className="w-full h-full">
          <path
            d="M 16 56 A 40 40 0 0 1 96 56"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 16 56 A 40 40 0 0 1 96 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className={
              score >= 75 ? "text-emerald-500"
              : score >= 60 ? "text-blue-500"
              : score >= 40 ? "text-amber-500"
              : "text-red-500"
            }
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <span className="text-2xl font-bold text-slate-800 leading-none">{score}</span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>
    </div>
  );
}

function exportAnalysis(result) {
  const rows = [{
    "Bid Score": result.bidScore,
    "Recommendation": result.recommendation,
    "Estimated Hours": result.estimatedHours,
    "Proposal Cost": result.estimatedProposalCost,
    "File": result.fileName || "Pasted Text",
    "Positive Signals": (result.flags || []).filter((f) => f.startsWith("+")).map((f) => f.slice(2)).join("; "),
    "Risk Signals": (result.flags || []).filter((f) => f.startsWith("-")).map((f) => f.slice(2)).join("; "),
    "Clauses Detected": (result.clausesDetected || []).join("; ")
  }];
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
  )];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "bid-analysis.csv" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AnalysisResults({ result }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersResult, setSuppliersResult] = useState(null);
  const [suppliersError, setSuppliersError] = useState(null);
  const [savedSupplierIds, setSavedSupplierIds] = useState(new Set());
  const [saveError, setSaveError] = useState(null);

  if (!result) return null;

  const {
    fileName,
    bidScore,
    recommendation,
    estimatedHours,
    estimatedProposalCost,
    flags = [],
    summary = [],
    clausesDetected = [],
    extractedTextPreview,
    disclaimer,
    naicsCode,
    location
  } = result;

  const positiveFlags = flags.filter((f) => f.startsWith("+"));
  const negativeFlags = flags.filter((f) => f.startsWith("-"));
  const recStyle = RECOMMENDATION_STYLE[recommendation] || { badge: "badge-slate", bar: "bg-slate-400", label: recommendation };

  async function handleFindSuppliers() {
    setSuppliersError(null);
    setSuppliersResult(null);
    setSuppliersLoading(true);
    try {
      const summaryText = Array.isArray(summary) ? summary.join(" ") : summary || "";
      const { data } = await findSuppliersApi.search({
        summary: summaryText,
        naicsCode: naicsCode || "",
        location: location || "",
        govReady: true
      });
      setSuppliersResult(data.suppliers || []);
    } catch (err) {
      setSuppliersError(err.response?.data?.error || "Failed to find suppliers. Please try again.");
    } finally {
      setSuppliersLoading(false);
    }
  }

  async function handleSaveSupplier(supplier) {
    setSaveError(null);
    try {
      await suppliersApi.create({
        name: supplier.name,
        naicsCodes: supplier.naicsCodes || [],
        // Prefix AI-generated content to distinguish it from user notes
        notes: supplier.explanation ? `AI Insight: ${supplier.explanation}` : "",
        status: "active"
      });
      setSavedSupplierIds((prev) => new Set([...prev, supplier.id]));
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to save supplier. Please try again.");
    }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title">Analysis Complete</h3>
          {fileName && <p className="section-subtitle">{fileName}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFindSuppliers}
            disabled={suppliersLoading}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {suppliersLoading ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Suppliers
              </>
            )}
          </button>
          <button onClick={() => exportAnalysis(result)} className="btn-secondary text-xs py-1.5 px-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* ── Score summary row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center flex flex-col items-center justify-center gap-2">
          <p className="stat-label">Bid Score</p>
          <ScoreGauge score={bidScore} />
        </div>
        <div className="card flex flex-col items-center justify-center gap-2 text-center">
          <p className="stat-label">Decision</p>
          <span className={`badge text-sm py-1.5 px-4 ${recStyle.badge}`}>
            {recStyle.label}
          </span>
        </div>
        <div className="card text-center">
          <p className="stat-label mb-2">Estimated Effort</p>
          <p className="text-xl font-bold text-slate-800">{estimatedHours || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">proposal hours</p>
        </div>
        <div className="card text-center">
          <p className="stat-label mb-2">Proposal Cost</p>
          <p className="text-xl font-bold text-slate-800">{estimatedProposalCost || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">estimated cost</p>
        </div>
      </div>

      {/* ── Score bar ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bid Confidence</p>
          <span className={`badge ${recStyle.badge}`}>{bidScore}/100</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${recStyle.bar}`}
            style={{ width: `${bidScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">No-Bid</span>
          <span className="text-[10px] text-slate-400">Borderline (40)</span>
          <span className="text-[10px] text-slate-400">Bid (60)</span>
          <span className="text-[10px] text-slate-400">Strong (75)</span>
        </div>
      </div>

      {/* ── Signals + Clauses ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title mb-4">Score Breakdown</h3>
          {positiveFlags.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                ✓ Positive Signals ({positiveFlags.length})
              </p>
              <ul className="space-y-2">
                {positiveFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">+</span>
                    <span>{f.slice(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {negativeFlags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                ✗ Risk Signals ({negativeFlags.length})
              </p>
              <ul className="space-y-2">
                {negativeFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">−</span>
                    <span>{f.slice(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {flags.length === 0 && (
            <p className="text-sm text-slate-400">No signals detected in this document.</p>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">FAR / DFARS Clauses Detected</h3>
          {clausesDetected.length > 0 ? (
            <div className="space-y-1.5">
              {clausesDetected.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-navy-50 border border-navy-200 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-navy-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs font-mono font-semibold text-navy-700">{c}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No FAR/DFARS clauses detected.</p>
          )}
        </div>
      </div>

      {/* ── Executive Summary ── */}
      {summary.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3">Executive Summary</h3>
          <div className="space-y-2">
            {summary.map((s, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed">{s}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Document Preview ── */}
      {extractedTextPreview && (
        <div className="card">
          <button
            type="button"
            onClick={() => setPreviewOpen((o) => !o)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="section-title">
              Document Preview
              {fileName && <span className="ml-2 text-slate-400 font-normal text-sm">— {fileName}</span>}
            </h3>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${previewOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {previewOpen && (
            <pre className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap border border-slate-200 animate-fade-in">
              {extractedTextPreview}
            </pre>
          )}
        </div>
      )}

      {disclaimer && (
        <p className="text-center text-xs text-slate-400 py-2">{disclaimer}</p>
      )}

      {/* ── Find Suppliers Results ── */}
      {(suppliersLoading || suppliersError || suppliersResult !== null) && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="section-title">Matched Suppliers</h3>

          {saveError && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{saveError}</p>
              </div>
            </div>
          )}

          {suppliersLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suppliersError && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{suppliersError}</p>
              </div>
            </div>
          )}

          {!suppliersLoading && suppliersResult !== null && suppliersResult.length === 0 && (
            <div className="card text-center py-8">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-slate-500 font-medium">No matching suppliers found</p>
              <p className="text-slate-400 text-sm mt-1">Try broadening the opportunity details or check back later.</p>
            </div>
          )}

          {!suppliersLoading && suppliersResult && suppliersResult.length > 0 && (
            <div className="space-y-3">
              {suppliersResult.map((supplier) => {
                const isSaved = savedSupplierIds.has(supplier.id);
                const scoreColor =
                  supplier.fitScore >= 70 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                  : supplier.fitScore >= 40 ? "text-blue-600 bg-blue-50 border-blue-200"
                  : "text-amber-600 bg-amber-50 border-amber-200";

                return (
                  <div key={supplier.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Fit score badge */}
                      <div className={`shrink-0 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center ${scoreColor}`}>
                        <span className="text-sm font-bold leading-none">{supplier.fitScore}</span>
                        <span className="text-[9px] leading-none mt-0.5">fit</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-800">{supplier.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {supplier.location}
                              {supplier.govReady && (
                                <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Gov-Ready
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSaveSupplier(supplier)}
                            disabled={isSaved}
                            className={`shrink-0 text-xs py-1 px-2.5 rounded-lg border transition-colors ${
                              isSaved
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                                : "btn-secondary"
                            }`}
                          >
                            {isSaved ? "✓ Saved" : "Save Supplier"}
                          </button>
                        </div>

                        {supplier.explanation && (
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{supplier.explanation}</p>
                        )}

                        {supplier.matchReasons && supplier.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {supplier.matchReasons.map((reason, i) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

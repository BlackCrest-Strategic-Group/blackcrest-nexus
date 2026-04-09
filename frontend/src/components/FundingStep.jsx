/**
 * FundingStep.jsx
 * Step 4 of the Opportunity Workflow – Funding Assessment.
 * Calculates the funding gap between the estimated execution cost and the
 * user's available capital.  Positions contract financing as a form of
 * execution support, and surfaces a "Explore Funding Options" CTA.
 */
import React, { useState } from "react";

/* ── Format as US currency ── */
function usd(val) {
  const n = Number(val) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ── Progress bar ── */
function FundingBar({ pct }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${clamped >= 100 ? "bg-emerald-500" : clamped >= 60 ? "bg-amber-500" : "bg-red-500"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default function FundingStep({ executionPlan, analysisResult, onBack }) {
  const totalCost = executionPlan?.total ?? 0;

  /* User inputs their available capital / cash reserves */
  const [availableCapital, setAvailableCapital] = useState(0);

  /* Derived funding metrics */
  const gap        = Math.max(0, totalCost - availableCapital);
  const covered    = totalCost > 0 ? Math.min(100, (availableCapital / totalCost) * 100) : 0;
  const fullyFunded = gap === 0 && totalCost > 0;

  /* Contract value from analysis (optional) */
  const contractValue = analysisResult?.contractValue ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="card">
        <h2 className="section-title">Funding Assessment</h2>
        <p className="section-subtitle">
          Understand your funding position before contract award.
          Contract financing is a form of execution support — it helps you mobilize resources on day one.
        </p>
      </div>

      {/* ── Cost summary (read-only from Step 3) ── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Contract Execution Cost Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Labor",     value: usd(executionPlan?.labor     ?? 0) },
            { label: "Materials", value: usd(executionPlan?.materials ?? 0) },
            { label: "Overhead",  value: usd(executionPlan?.overhead  ?? 0) },
            { label: "Total Cost",value: usd(totalCost), bold: true }
          ].map(({ label, value, bold }) => (
            <div key={label} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-sm ${bold ? "text-navy-800 font-bold text-base" : "text-slate-800 font-semibold"}`}>{value}</p>
            </div>
          ))}
        </div>

        {contractValue && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <span className="font-semibold">Contract Value (from analysis):</span> {usd(contractValue)}
            {contractValue > totalCost && (
              <span className="ml-2 text-emerald-700">
                — potential margin of {usd(contractValue - totalCost)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Funding gap calculator ── */}
      <div className="card space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">Funding Gap Calculator</h3>

        {/* Available capital input */}
        <div>
          <label className="label">Your Available Capital / Cash Reserves</label>
          <p className="text-xs text-slate-500 mb-1.5">
            Enter how much working capital you can deploy at contract start
          </p>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
            <input
              type="number"
              min={0}
              step={1000}
              className="input pl-7"
              placeholder="0"
              value={availableCapital || ""}
              onChange={(e) => setAvailableCapital(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Progress bar */}
        {totalCost > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Coverage</span>
              <span>{Math.round(covered)}%</span>
            </div>
            <FundingBar pct={covered} />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-500">Available: <strong className="text-slate-700">{usd(availableCapital)}</strong></span>
              <span className="text-slate-500">Required: <strong className="text-slate-700">{usd(totalCost)}</strong></span>
            </div>
          </div>
        )}

        {/* Funding gap result */}
        {totalCost > 0 && (
          <div className={`p-4 rounded-xl border ${fullyFunded ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            {fullyFunded ? (
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Fully Funded</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your available capital covers the full execution cost. You are ready to mobilize.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Funding Gap: <span className="text-red-700">{usd(gap)}</span>
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    You need an additional {usd(gap)} to cover execution costs.
                    Contract financing bridges this gap so you can mobilize resources on day one.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Funding Options CTA ── */}
      {!fullyFunded && gap > 0 && (
        <div className="card bg-gradient-to-br from-navy-950 to-navy-800 border-navy-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-bold text-base mb-1">Explore Funding Options</p>
              <p className="text-slate-300 text-sm">
                Contract financing is execution support — not debt.  We help GovCon companies
                access working capital tied directly to contract revenue so you can hire, procure,
                and deliver from day one without cash-flow risk.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {[
                  "Contract Mobilization Finance",
                  "Invoice Factoring & Receivables Financing",
                  "SBA 8(a) & SBIR Bridge Funding",
                  "Government Purchase Card (GPC) Lines"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA button */}
            <div className="shrink-0">
              <a
                href="mailto:funding@blackcrest.com?subject=Funding%20Assessment%20Request"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm py-3 px-6 rounded-lg shadow-lg transition-colors duration-150 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore Funding Options
              </a>
              <p className="text-xs text-slate-500 mt-2 text-center">No commitment required</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Fully funded state CTA ── */}
      {fullyFunded && (
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Ready to Execute</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Your capital covers the full execution cost. Proceed to proposal generation or
                workflow setup using the tools above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Execution Planning
        </button>
        <span className="flex items-center text-xs text-slate-400">Step 4 of 4 — Workflow complete</span>
      </div>
    </div>
  );
}

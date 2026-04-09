/**
 * ExecutionStep.jsx
 * Step 3 of the Opportunity Workflow – Execution Planning.
 * Lets the user enter estimated labor, materials, and overhead costs.
 * Computes total cost automatically and stores the plan in parent state
 * via onComplete(executionPlan) so it is available in the Funding step.
 */
import React, { useState } from "react";

/* ── Small helper: format number as US currency ── */
function usd(val) {
  const n = Number(val) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ── Labelled numeric input ── */
function CostField({ label, hint, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
        <input
          type="number"
          min={0}
          step={100}
          className="input pl-7"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

export default function ExecutionStep({ analysisResult, executionPlan, onComplete, onBack }) {
  /* Pre-fill with existing plan data if navigating back to this step */
  const [labor,     setLabor]     = useState(executionPlan?.labor     ?? 0);
  const [materials, setMaterials] = useState(executionPlan?.materials ?? 0);
  const [overhead,  setOverhead]  = useState(executionPlan?.overhead  ?? 0);

  /* Derived values */
  const total = labor + materials + overhead;

  /* Contract value extracted from analysis, if available */
  const contractValue = analysisResult?.contractValue ?? null;

  function handleNext() {
    onComplete({ labor, materials, overhead, total });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="card">
        <h2 className="section-title">Execution Planning</h2>
        <p className="section-subtitle">
          Estimate the costs required to perform this contract — labor, materials, and overhead.
          These figures feed directly into the Funding Assessment.
        </p>
      </div>

      {/* ── Cost entry form ── */}
      <div className="card space-y-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Cost Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CostField
            label="Labor"
            hint="Direct labor wages and salaries for contract personnel"
            value={labor}
            onChange={setLabor}
          />
          <CostField
            label="Materials"
            hint="Equipment, supplies, subcontractor costs"
            value={materials}
            onChange={setMaterials}
          />
          <CostField
            label="Overhead"
            hint="Indirect costs: facilities, admin, insurance, etc."
            value={overhead}
            onChange={setOverhead}
          />
        </div>

        {/* ── Total summary ── */}
        <div className="mt-4 p-4 bg-navy-50 border border-navy-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1 text-sm text-navy-800">
              <div className="flex justify-between gap-8">
                <span>Labor</span>
                <span className="font-semibold">{usd(labor)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>Materials</span>
                <span className="font-semibold">{usd(materials)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>Overhead</span>
                <span className="font-semibold">{usd(overhead)}</span>
              </div>
              <div className="border-t border-navy-300 pt-2 flex justify-between gap-8 text-navy-900 font-bold text-base">
                <span>Total Estimated Cost</span>
                <span>{usd(total)}</span>
              </div>
            </div>

            {/* Contract value context, if available from analysis */}
            {contractValue && (
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-0.5">Contract Value (from analysis)</p>
                <p className="text-lg font-bold text-emerald-700">{usd(contractValue)}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Margin indicator ── */}
        {contractValue && total > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            {contractValue >= total ? (
              <span className="text-emerald-700 font-semibold">
                ✓ Estimated margin: {usd(contractValue - total)} ({Math.round(((contractValue - total) / contractValue) * 100)}%)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                ⚠ Cost exceeds contract value by {usd(total - contractValue)} — consider revising estimates or exploring funding.
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={total === 0}
          className="btn-primary"
        >
          Proceed to Funding Assessment
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

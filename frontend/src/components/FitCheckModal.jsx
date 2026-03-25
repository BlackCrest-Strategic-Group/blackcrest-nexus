import React from "react";

const DECISION_CONFIG = {
  PURSUE: {
    label: "PURSUE",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    action: "Proceed with proposal preparation — this opportunity aligns well with your capabilities."
  },
  PARTNER: {
    label: "PARTNER",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    action: "Proceed with subcontractor support — partner with a qualified supplier to strengthen your bid."
  },
  PASS: {
    label: "PASS",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    action: "Pass on this opportunity — consider monitoring for future solicitations."
  }
};

export default function FitCheckModal({ result, opportunityTitle, onClose }) {
  if (!result) return null;

  const { decision, confidence, reasons = [], recommendedSuppliers = [] } = result;
  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.PASS;
  const topSuppliers = recommendedSuppliers.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 rounded-t-2xl ${config.bg} border-b ${config.border}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">AI Fit Check</p>
              <p className="text-sm text-slate-700 font-medium truncate">{opportunityTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Decision + Confidence */}
          <div className="mt-3 flex items-center gap-3">
            <span className={`text-3xl font-extrabold tracking-tight ${config.color}`}>
              {config.label}
            </span>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
              {confidence}% confidence
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Recommended Action */}
          <div>
            <h3 className="section-title mb-2">Recommended Action</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{config.action}</p>
          </div>

          {/* Why */}
          {reasons.length > 0 && (
            <div>
              <h3 className="section-title mb-2">Why</h3>
              <ul className="space-y-1.5">
                {reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Suppliers */}
          {topSuppliers.length > 0 && (
            <div>
              <h3 className="section-title mb-2">Top Suppliers</h3>
              <div className="space-y-2">
                {topSuppliers.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Compliance Risk:{" "}
                        <span className={
                          s.complianceRisk === "low" ? "text-emerald-600 font-medium" :
                          s.complianceRisk === "medium" ? "text-amber-600 font-medium" :
                          "text-red-600 font-medium"
                        }>
                          {s.complianceRisk}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-800">{Math.round(s.supplierScore)}</p>
                      <p className="text-xs text-slate-400">score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

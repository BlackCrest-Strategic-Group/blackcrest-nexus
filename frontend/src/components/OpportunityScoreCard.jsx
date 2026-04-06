import React from "react";

/**
 * OpportunityScoreCard
 *
 * Displays the result of the Opportunity Scoring Engine:
 *   - bidScore gauge (0–100)
 *   - Recommendation badge: BID / CONSIDER / NO-BID
 *   - Confidence level
 *   - Weighted reasoning list (top factors)
 *
 * Props:
 *   result {Object} – response from POST /api/opportunity/score
 *     { bidScore, recommendation, confidence, reasoning[] }
 *   title  {string} – optional solicitation title for display context
 */

const RECOMMENDATION_CONFIG = {
  BID: {
    label: "BID",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    barColor: "bg-emerald-500",
    description: "This opportunity aligns well with your profile — recommend pursuing.",
  },
  CONSIDER: {
    label: "CONSIDER",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    barColor: "bg-amber-500",
    description: "Mixed signals detected — review factors carefully before committing.",
  },
  "NO-BID": {
    label: "NO-BID",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    barColor: "bg-red-500",
    description: "Significant misalignment or risk detected — pass on this opportunity.",
  },
};

function ScoreBar({ score, barColor }) {
  return (
    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function ImpactBadge({ impact }) {
  if (impact > 0) {
    return (
      <span className="shrink-0 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
        +{impact}
      </span>
    );
  }
  if (impact < 0) {
    return (
      <span className="shrink-0 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
        {impact}
      </span>
    );
  }
  return (
    <span className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
      0
    </span>
  );
}

export default function OpportunityScoreCard({ result, title }) {
  if (!result) return null;

  const { bidScore = 0, recommendation = "NO-BID", confidence = 0, reasoning = [] } = result;
  const config = RECOMMENDATION_CONFIG[recommendation] || RECOMMENDATION_CONFIG["NO-BID"];

  // Show top 5 reasoning factors sorted by absolute impact
  const topReasons = [...reasoning].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5);

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${config.border}`}>
      {/* Header */}
      <div className={`px-5 pt-5 pb-4 ${config.bg}`}>
        {title && (
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1 truncate">
            {title}
          </p>
        )}
        <div className="flex items-center gap-4">
          {/* Score number */}
          <div className="flex flex-col items-center shrink-0">
            <span className={`text-5xl font-extrabold leading-none ${config.color}`}>
              {bidScore}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
          </div>

          {/* Recommendation + confidence */}
          <div className="flex-1 min-w-0">
            <span
              className={`inline-block text-lg font-bold tracking-tight px-2.5 py-0.5 rounded-lg border ${config.color} ${config.bg} ${config.border}`}
            >
              {config.label}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Confidence:{" "}
              <span className="font-semibold text-slate-700">{confidence}%</span>
              {confidence < 50 && (
                <span className="ml-1 text-amber-600">(limited data)</span>
              )}
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-snug">{config.description}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-4">
          <ScoreBar score={bidScore} barColor={config.barColor} />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {topReasons.length > 0 && (
        <div className="px-5 py-4 bg-white">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Scoring Factors
          </h4>
          <ul className="space-y-2.5">
            {topReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <ImpactBadge impact={r.impact} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{r.factor}</p>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">{r.explanation}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

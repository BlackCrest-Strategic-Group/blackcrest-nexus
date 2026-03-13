import React, { useState, useEffect } from "react";
import { intelligenceApi } from "../utils/api.js";

function ScoreBadge({ score }) {
  const color =
    score >= 70
      ? "bg-green-100 text-green-800 border-green-200"
      : score >= 40
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${color}`}
    >
      Score: {score}/100
    </span>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right break-all">
        {value || "—"}
      </span>
    </div>
  );
}

export default function OpportunityIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchIntelligence = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await intelligenceApi.get();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load opportunity intelligence:", err);
      setError("Could not load opportunity intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await intelligenceApi.refresh();
      setData(res.data);
    } catch (err) {
      console.error("Failed to refresh opportunity intelligence:", err);
      setError("Refresh failed. Check that SAM_API_KEY is configured.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-800">
            Opportunity Intelligence
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="btn-secondary text-sm"
          >
            {refreshing ? "Refreshing…" : "Refresh from SAM.gov"}
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : data ? (
          <>
            {/* Score + Summary */}
            <div className="mb-5">
              <div className="mb-3">
                <ScoreBadge score={data.score} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* Key insights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Key Insights
                </h3>
                <MetricRow label="Top Agency" value={data.top_agency} />
                <MetricRow label="Top NAICS" value={data.top_naics} />
                <MetricRow label="Top Set-Aside" value={data.top_set_aside} />
                <MetricRow
                  label="Records Analyzed"
                  value={data.metrics?.total_records}
                />
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Top Keywords
                </h3>
                {data.top_keywords?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.top_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No keywords yet.</p>
                )}
              </div>
            </div>

            {/* Top agencies table */}
            {data.metrics?.top_agencies?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Top Agencies
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 pr-4 font-medium text-slate-600">
                          Agency
                        </th>
                        <th className="text-right py-2 font-medium text-slate-600">
                          Opportunities
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.metrics.top_agencies.map((a) => (
                        <tr
                          key={a.value}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-1.5 pr-4 text-slate-700 truncate max-w-xs">
                            {a.value}
                          </td>
                          <td className="py-1.5 text-right text-slate-600 font-medium">
                            {a.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

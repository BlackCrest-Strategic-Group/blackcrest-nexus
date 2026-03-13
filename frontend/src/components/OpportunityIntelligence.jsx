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
// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export default function OpportunityIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [naicsInput, setNaicsInput] = useState("");

  const load = useCallback(async () => {
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
      const msg = err.response?.data?.error || "Failed to load intelligence data.";
      // 404 means not yet collected — show empty state rather than error
      if (err.response?.status === 404) {
        setData(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    try {
      const naicsCodes = naicsInput
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await intelligenceApi.refresh({ naicsCodes, daysBack: 30 });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }

  const analysis = data?.analysis || {};

  return (
    <div className="space-y-4">
      {/* Header + Refresh */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Opportunity Intelligence</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Aggregated insights from SAM.gov, USASpending.gov, SBIR.gov, and Grants.gov.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <input
              type="text"
              value={naicsInput}
              onChange={(e) => setNaicsInput(e.target.value)}
              placeholder="NAICS codes (comma-separated, optional)"
              className="input text-sm w-full sm:w-64"
            />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary shrink-0"
            >
              {refreshing ? "Refreshing…" : "Refresh Data"}
            </button>
          </div>
        </div>

        {data?.lastRefreshed && (
          <p className="text-xs text-slate-400 mt-3">
            Last refreshed: {new Date(data.lastRefreshed).toLocaleString()}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card text-center text-slate-400 py-10">
          Loading intelligence data…
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && !error && (
        <div className="card text-center py-10">
          <p className="text-slate-500 font-medium">No data collected yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Click <strong>Refresh Data</strong> to scan all federal opportunity databases.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <>
          {/* Score + Summary */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0">
                <ScoreBadge score={data.score ?? 0} />
                <p className="text-xs text-slate-400 text-center mt-1">Trend Score</p>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {analysis.total?.toLocaleString() ?? 0} total records analysed
                </p>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card">
              <StatList
                title="Top Agencies"
                items={analysis.topAgencies}
                keyField="agency"
                labelField="agency"
                countField="count"
              />
            </div>

            <div className="card">
              <StatList
                title="Top NAICS Codes"
                items={analysis.topNaics}
                keyField="naicsCode"
                labelField="naicsCode"
                countField="count"
              />
            </div>

            <div className="card">
              <StatList
                title="Top Set-Asides"
                items={analysis.topSetAsides}
                keyField="setAside"
                labelField="setAside"
                countField="count"
              />
            </div>

            <div className="card">
              <StatList
                title="Top Keywords"
                items={analysis.topKeywords}
                keyField="keyword"
                labelField="keyword"
                countField="count"
              />
            </div>

            <div className="card sm:col-span-2 lg:col-span-2">
              <SourceBreakdown sourceBreakdown={analysis.sourceBreakdown} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

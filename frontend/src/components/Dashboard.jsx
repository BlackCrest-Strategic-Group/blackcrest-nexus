import React, { useMemo, useState } from "react";
import { opportunitiesApi, fundingApi } from "../utils/api.js";
import { getUser } from "../utils/auth.js";

const defaultForm = {
  sector: "general",
  fundingNeedCategory: "working-capital",
  timelineMonths: 6,
  text: ""
};

function Card({ title, value, hint }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const user = getUser();
  const [form, setForm] = useState(defaultForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [leadState, setLeadState] = useState({ name: user?.name || "", company: "", email: user?.email || "", phone: "", requestedHelp: "" });
  const [leadMessage, setLeadMessage] = useState("");

  const lenderNames = useMemo(() => (result?.topLenderMatches || []).map((l) => l.name), [result]);

  async function handleAnalyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      let response;
      if (file) {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("sector", form.sector);
        payload.append("fundingNeedCategory", form.fundingNeedCategory);
        payload.append("timelineMonths", String(form.timelineMonths));
        response = await opportunitiesApi.analyze(payload);
      } else {
        response = await opportunitiesApi.analyzeText(form);
      }

      const analysis = response.data;
      if (!analysis?.recommendedFundingTypes) {
        const fundingResponse = await fundingApi.match({
          estimatedDealValue: analysis.estimatedValue,
          timelineMonths: analysis.timelineMonths,
          riskLevel: analysis.executionRisk,
          sector: analysis.sector,
          fundingNeedCategory: analysis.fundingNeedCategory
        });
        setResult({ ...analysis, ...fundingResponse.data });
      } else {
        setResult(analysis);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Unable to analyze this opportunity right now.");
    } finally {
      setLoading(false);
    }
  }

  async function submitFundingRequest(event) {
    event.preventDefault();
    setLeadMessage("");
    try {
      await fundingApi.request({
        ...leadState,
        opportunitySummary: result?.opportunitySummary || "",
        matchedLenders: lenderNames,
        metadata: {
          goNoGoScore: result?.goNoGoScore,
          fundingReadinessScore: result?.fundingReadinessScore
        }
      });
      setLeadMessage("Funding request submitted. A team member will follow up with curated intro options.");
      setShowFundingForm(false);
    } catch (err) {
      setLeadMessage(err.response?.data?.error || "Unable to submit funding request.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="card">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Opportunity → Decision → Funding</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">BlackCrest Opportunity & Funding Intelligence Engine</h1>
          <p className="mt-2 text-slate-600">Upload an opportunity package, assess go/no-go viability, and get curated lender matching recommendations.</p>
        </header>

        <section className="card">
          <h2 className="text-xl font-semibold text-slate-900">A. Upload Opportunity</h2>
          <form className="mt-4 grid gap-4" onSubmit={handleAnalyze}>
            <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" />
            <textarea
              className="input min-h-40"
              placeholder="Or paste opportunity text from a contract, RFP, SOW, or deal package"
              value={form.text}
              onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input" placeholder="Sector (e.g., healthcare)" value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} />
              <input className="input" placeholder="Funding need (working-capital, capex)" value={form.fundingNeedCategory} onChange={(e) => setForm((p) => ({ ...p, fundingNeedCategory: e.target.value }))} />
              <input className="input" type="number" min="1" max="36" placeholder="Timeline months" value={form.timelineMonths} onChange={(e) => setForm((p) => ({ ...p, timelineMonths: Number(e.target.value) || 6 }))} />
            </div>
            <button className="btn-primary w-fit" type="submit" disabled={loading}>{loading ? "Analyzing..." : "Run Intelligence"}</button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </section>

        {result ? (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">B. Opportunity Intelligence Results</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card title="Opportunity Summary" value={result.opportunitySummary} />
                <Card title="Estimated Value" value={`$${result.estimatedValue?.min?.toLocaleString()} - $${result.estimatedValue?.max?.toLocaleString()}`} />
                <Card title="Complexity Level" value={result.complexityLevel} />
                <Card title="Risk Flags" value={`Timeline: ${result.timelineRisk} • Execution: ${result.executionRisk}`} />
                <Card title="Margin Potential" value={result.marginPotential} />
                <Card title="Go / No-Go Score" value={`${result.goNoGoScore}/100`} />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">C. Funding Paths & Lender Matches</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card title="Funding Readiness Score" value={`${result.fundingReadinessScore}/100`} />
                <Card title="Recommended Funding Types" value={(result.recommendedFundingTypes || []).join(", ")} />
                <Card title="Lender Matches" value={lenderNames.join(", ")} hint={result.explanation} />
              </div>

              <button className="btn-primary" onClick={() => setShowFundingForm(true)}>Explore Funding Options</button>
            </section>
          </>
        ) : null}

        {showFundingForm ? (
          <div className="fixed inset-0 z-40 bg-slate-950/40 p-4">
            <div className="mx-auto mt-12 max-w-xl card">
              <h3 className="text-lg font-semibold">Funding Request</h3>
              <form className="mt-4 space-y-3" onSubmit={submitFundingRequest}>
                <input className="input" required placeholder="Name" value={leadState.name} onChange={(e) => setLeadState((p) => ({ ...p, name: e.target.value }))} />
                <input className="input" required placeholder="Company" value={leadState.company} onChange={(e) => setLeadState((p) => ({ ...p, company: e.target.value }))} />
                <input className="input" required type="email" placeholder="Email" value={leadState.email} onChange={(e) => setLeadState((p) => ({ ...p, email: e.target.value }))} />
                <input className="input" placeholder="Phone" value={leadState.phone} onChange={(e) => setLeadState((p) => ({ ...p, phone: e.target.value }))} />
                <textarea className="input" placeholder="Requested help" value={leadState.requestedHelp} onChange={(e) => setLeadState((p) => ({ ...p, requestedHelp: e.target.value }))} />
                <div className="flex gap-2">
                  <button className="btn-primary" type="submit">Submit Request</button>
                  <button className="btn-secondary" type="button" onClick={() => setShowFundingForm(false)}>Close</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {leadMessage ? <p className="text-sm text-slate-700">{leadMessage}</p> : null}
      </div>
    </div>
  );
}

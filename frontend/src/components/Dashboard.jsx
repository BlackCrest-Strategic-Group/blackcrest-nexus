import React, { useEffect, useMemo, useState } from "react";
import { intelligenceEngineApi } from "../utils/api.js";

const emptyOnboarding = {
  profile: {
    companyName: "",
    industry: "",
    revenueRange: "",
    teamSize: 10,
    naicsCodes: [],
    capabilitiesText: "",
    capabilityTags: "",
    certifications: [],
    setAsideStatus: [],
    capacityIndicators: { maxContractSize: 0, staffingCapacity: 0 },
    targetAgencies: [],
    preferredContractTypes: []
  },
  preferences: {
    riskTolerance: "balanced",
    growthGoal: "pipeline",
    marginPreference: "balanced",
    willingnessToPartner: true,
    workToAvoid: "",
    agenciesOfInterest: []
  }
};

function ScoreBadge({ label, value }) {
  return <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-200">{label}: {value}</span>;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [onboarding, setOnboarding] = useState(emptyOnboarding);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [complianceText, setComplianceText] = useState("");
  const [compliance, setCompliance] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [profileRes, oppRes] = await Promise.all([
        intelligenceEngineApi.getProfile(),
        intelligenceEngineApi.listOpportunities()
      ]);
      setData({ ...oppRes.data, profile: profileRes.data.profile, preferences: profileRes.data.preferences });
      setShowOnboarding(!profileRes.data.profile || !profileRes.data.preferences);
      setError("");
    } catch (err) {
      const msg = err.response?.data?.error || "Complete onboarding to activate your intelligence engine.";
      setError(msg);
      setShowOnboarding(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function saveOnboarding(e) {
    e.preventDefault();
    const payload = {
      profile: {
        ...onboarding.profile,
        capabilityTags: onboarding.profile.capabilityTags,
        naicsCodes: String(onboarding.profile.naicsCodes || "").split(",").map((v) => v.trim()).filter(Boolean),
        certifications: String(onboarding.profile.certifications || "").split(",").map((v) => v.trim()).filter(Boolean),
        setAsideStatus: String(onboarding.profile.setAsideStatus || "").split(",").map((v) => v.trim()).filter(Boolean),
        targetAgencies: String(onboarding.profile.targetAgencies || "").split(",").map((v) => v.trim()).filter(Boolean),
        preferredContractTypes: String(onboarding.profile.preferredContractTypes || "").split(",").map((v) => v.trim()).filter(Boolean)
      },
      preferences: {
        ...onboarding.preferences,
        workToAvoid: onboarding.preferences.workToAvoid,
        agenciesOfInterest: String(onboarding.preferences.agenciesOfInterest || "").split(",").map((v) => v.trim()).filter(Boolean)
      }
    };
    await intelligenceEngineApi.saveOnboarding(payload);
    setShowOnboarding(false);
    await intelligenceEngineApi.ingest({ naics: payload.profile.naicsCodes, agencies: payload.preferences.agenciesOfInterest });
    loadAll();
  }

  async function runCompliance(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", complianceText);
    const res = await intelligenceEngineApi.complianceAnalyze(formData);
    setCompliance(res.data);
  }

  const header = useMemo(() => data?.personalizedHeader || { highFit: 0, outsideCapacity: 0, expansionMatches: 0 }, [data]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-8">Loading your intelligence feed…</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid md:grid-cols-[250px,1fr,320px] gap-6 p-6">
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-fit">
          <h2 className="font-semibold">Truth Serum AI</h2>
          <p className="text-xs text-slate-400 mt-1">Sidebar navigation</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>Opportunity Feed</li><li>Alerts</li><li>Profile</li><li>Compliance</li>
          </ul>
          <button className="btn-secondary mt-6 w-full" onClick={() => setShowOnboarding(true)}>Edit Onboarding</button>
        </aside>

        <main className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h1 className="text-2xl font-bold">{header.highFit} high-fit opportunities this week</h1>
            <p className="text-slate-400 mt-1">{header.outsideCapacity} exceed your current capacity • {header.expansionMatches} strong expansion match</p>
            {error ? <p className="text-amber-300 mt-2">{error}</p> : null}
          </div>

          {(data?.opportunities || []).slice(0, 25).map((opp) => (
            <article key={opp._id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-sm text-slate-400">{opp.agency} • ${Number(opp.estimatedValue || 0).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${opp.scoring.recommendation === 'PURSUE' ? 'bg-emerald-700' : opp.scoring.recommendation === 'PARTNER' ? 'bg-amber-700' : 'bg-slate-700'}`}>{opp.scoring.recommendation}</span>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <ScoreBadge label="WIN %" value={opp.scoring.winProbability} />
                <ScoreBadge label="Margin" value={opp.scoring.marginScore} />
                <ScoreBadge label="Strategic Fit" value={opp.scoring.strategicFit} />
              </div>
              <p className="mt-3 text-sm text-slate-300">{opp.scoring.reasoning}</p>
            </article>
          ))}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">Compliance Analysis (Text / PDF engine)</h2>
            <form className="mt-3 space-y-3" onSubmit={runCompliance}>
              <textarea className="input min-h-28 bg-slate-950 border-slate-700 text-white" value={complianceText} onChange={(e) => setComplianceText(e.target.value)} placeholder="Paste FAR / DFARS content" />
              <button className="btn-primary" type="submit">Extract FAR/DFARS Checklist</button>
            </form>
            {compliance ? <div className="mt-3 text-sm"><p>Clauses: {(compliance.clauses || []).join(", ") || "None"}</p></div> : null}
          </section>
        </main>

        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-fit">
          <h2 className="font-semibold">🔥 High Value Opportunities</h2>
          <div className="mt-3 space-y-3 text-sm">
            {(data?.alerts || []).map((alert) => (
              <div key={alert._id} className="border border-slate-800 rounded-lg p-3">
                <p className="font-medium">{alert.title}</p>
                <p className="text-slate-400">{alert.recommendation} • WIN {alert.winProbability}%</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showOnboarding ? (
        <div className="fixed inset-0 bg-slate-950/70 p-4 overflow-auto">
          <form onSubmit={saveOnboarding} className="mx-auto max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Guided Onboarding</h2>
            <p className="text-slate-400 text-sm">Business Identity → Capabilities → Capacity → Strategy & Preferences</p>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Company name" required value={onboarding.profile.companyName} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, companyName: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Industry" value={onboarding.profile.industry} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, industry: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Revenue range" value={onboarding.profile.revenueRange} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, revenueRange: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" type="number" placeholder="Team size" value={onboarding.profile.teamSize} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, teamSize: Number(e.target.value) || 0 } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="NAICS codes (comma-separated)" value={onboarding.profile.naicsCodes} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, naicsCodes: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Certifications" value={onboarding.profile.certifications} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, certifications: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Set-aside status" value={onboarding.profile.setAsideStatus} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, setAsideStatus: e.target.value } }))} />
              <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Max contract size" type="number" value={onboarding.profile.capacityIndicators.maxContractSize} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, capacityIndicators: { ...p.profile.capacityIndicators, maxContractSize: Number(e.target.value) || 0 } } }))} />
            </div>
            <textarea className="input bg-slate-950 border-slate-700 text-white" placeholder="Capabilities text" value={onboarding.profile.capabilitiesText} onChange={(e) => setOnboarding((p) => ({ ...p, profile: { ...p.profile, capabilitiesText: e.target.value } }))} />
            <div className="grid md:grid-cols-2 gap-3">
              <select className="input bg-slate-950 border-slate-700 text-white" value={onboarding.preferences.riskTolerance} onChange={(e) => setOnboarding((p) => ({ ...p, preferences: { ...p.preferences, riskTolerance: e.target.value } }))}><option value="safe">safe</option><option value="balanced">balanced</option><option value="aggressive">aggressive</option></select>
              <select className="input bg-slate-950 border-slate-700 text-white" value={onboarding.preferences.marginPreference} onChange={(e) => setOnboarding((p) => ({ ...p, preferences: { ...p.preferences, marginPreference: e.target.value } }))}><option value="low">low</option><option value="balanced">balanced</option><option value="high">high</option></select>
              <select className="input bg-slate-950 border-slate-700 text-white" value={onboarding.preferences.growthGoal} onChange={(e) => setOnboarding((p) => ({ ...p, preferences: { ...p.preferences, growthGoal: e.target.value } }))}><option value="revenue">revenue</option><option value="expansion">expansion</option><option value="pipeline">pipeline</option><option value="margin">margin</option></select>
              <select className="input bg-slate-950 border-slate-700 text-white" value={String(onboarding.preferences.willingnessToPartner)} onChange={(e) => setOnboarding((p) => ({ ...p, preferences: { ...p.preferences, willingnessToPartner: e.target.value === 'true' } }))}><option value="true">Partner-friendly</option><option value="false">No partner</option></select>
            </div>
            <input className="input bg-slate-950 border-slate-700 text-white" placeholder="Work to avoid" value={onboarding.preferences.workToAvoid} onChange={(e) => setOnboarding((p) => ({ ...p, preferences: { ...p.preferences, workToAvoid: e.target.value } }))} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save profile</button>
              <button type="button" className="btn-secondary" onClick={() => setShowOnboarding(false)}>Close</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

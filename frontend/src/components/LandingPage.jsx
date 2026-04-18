import React from "react";
import { useNavigate } from "react-router-dom";

const bullets = [
  "Upload contracts, RFPs, SOWs, and deal packages",
  "Get AI opportunity intelligence and viability scoring",
  "See funding readiness and curated lender matches",
  "Submit an intro request from the same workflow"
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">BlackCrest Opportunity & Funding Intelligence Engine</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">Opportunity → Decision → Funding</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-300">
          Analyze new opportunities in minutes, estimate execution viability, and map practical funding pathways with curated lender matches.
        </p>

        <ul className="mt-8 space-y-3">
          {bullets.map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-200">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-secondary" onClick={() => navigate("/app")}>Open App</button>
        </div>
      </div>
    </div>
  );
}

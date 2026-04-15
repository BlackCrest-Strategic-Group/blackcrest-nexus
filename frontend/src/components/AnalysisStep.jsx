/**
 * AnalysisStep.jsx
 * Step 2 of the Opportunity Workflow.
 * Displays the AI analysis result returned from Step 1 via the existing
 * AnalysisResults component.  Exposes an onNext callback so the parent
 * workflow can advance to Step 3 (Execution Planning).
 */
import React from "react";
import AnalysisResults from "./AnalysisResults.jsx";

export default function AnalysisStep({ analysisResult, onNext, onBack }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">BlackCrest Opportunity Analysis</h2>
            <p className="section-subtitle">
              Review the multi-market assessment before moving to execution planning
            </p>
          </div>
          {/* Bid score badge from result */}
          {analysisResult?.recommendation && (
            <div className="flex items-center gap-2">
              {analysisResult?.analysisMode && (
                <span className="badge text-xs py-1 px-3 uppercase">{analysisResult.analysisMode}</span>
              )}
              <span className="badge badge-navy text-sm py-1.5 px-4">
                {analysisResult.recommendation}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Existing AnalysisResults component – unchanged backend integration ── */}
      <AnalysisResults result={analysisResult} />

      {/* ── Navigation ── */}
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Proceed to Execution Planning
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

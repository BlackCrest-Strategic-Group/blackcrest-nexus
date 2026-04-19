/**
 * UploadStep.jsx
 * Step 1 of the Opportunity Workflow.
 * Lets users upload a solicitation document (PDF / TXT) or paste raw text,
 * then triggers AI analysis via the existing opportunitiesApi.analyze / analyzeText
 * backend endpoints. On success it calls onComplete(analysisResult) so the
 * parent workflow can advance to Step 2.
 */
import React, { useRef, useState } from "react";
import { truthSerumApi } from "../utils/api.js";

export default function UploadStep({ onComplete }) {
  // "file" | "text" toggle
  const [mode, setMode] = useState("file");
  const [pastedText, setPastedText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisMode, setAnalysisMode] = useState("federal");
  const fileRef = useRef(null);

  /* ── helpers ─────────────────────────────────────────────── */
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
  }

  async function runAnalysis(payload) {
    setError("");
    setLoading(true);
    try {
      let res;
      if (payload instanceof FormData) {
        payload.append("analysisMode", analysisMode);
        res = await truthSerumApi.analyze(payload);
      } else {
        res = await truthSerumApi.analyzeText({ text: payload, analysisMode });
      }
      onComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitFile(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please choose a file."); return; }
    const form = new FormData();
    form.append("file", file);
    await runAnalysis(form);
  }

  async function handleSubmitText(e) {
    e.preventDefault();
    if (!pastedText.trim()) { setError("Please paste some text."); return; }
    await runAnalysis(pastedText);
  }

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Upload Opportunity</h2>
            <p className="section-subtitle">
              Upload a solicitation package or paste text to run Truth Serum procurement intelligence
            </p>
          </div>
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            {[{ id: "file", label: "Upload File" }, { id: "text", label: "Paste Text" }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(""); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  mode === id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="label">Analysis Mode</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "federal", label: "Federal" },
              { id: "commercial", label: "Commercial" },
              { id: "hybrid", label: "Hybrid" }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAnalysisMode(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  analysisMode === id
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Select the operating context for the Truth Serum decision model.
          </p>
        </div>
        {/* Error banner */}
        {error && (
          <div className="alert-error mb-4">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* File upload mode */}
        {mode === "file" ? (
          <form onSubmit={handleSubmitFile} className="space-y-4">
            <div>
              <label className="label">Choose Document (PDF or TXT)</label>
              <div
                className={`upload-zone ${dragOver ? "upload-zone-active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
              >
                <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-semibold text-slate-700">Drop your document here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse — PDF and TXT supported</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={() => {}}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analyze Document
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400">AI-powered scoring takes 10–30 seconds</p>
            </div>
          </form>
        ) : (
          /* Text paste mode */
          <form onSubmit={handleSubmitText} className="space-y-4">
            <div>
              <label className="label">Paste Solicitation Text</label>
              <textarea
                className="input h-52 resize-y font-mono text-xs leading-relaxed"
                placeholder="Paste solicitation text, statement of work, or relevant clauses here…"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : "Analyze Text"}
            </button>
          </form>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

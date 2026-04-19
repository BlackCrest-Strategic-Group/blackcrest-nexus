import React, { useEffect, useMemo, useState } from "react";
import "./procurement.css";

const initialResult = null;

function scoreTone(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function ScoreCard({ title, score }) {
  const tone = scoreTone(score);
  return (
    <div className={`risk-card ${tone}`}>
      <p>{title}</p>
      <strong>{score}</strong>
    </div>
  );
}

export default function ProcurementIntelligencePage() {
  const [rfpText, setRfpText] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(initialResult);
  const [history, setHistory] = useState([]);

  const intelligenceScore = useMemo(() => result?.scores?.intelligence_score ?? 0, [result]);

  async function loadHistory() {
    try {
      const response = await fetch("/api/analyze-rfp/history");
      const data = await response.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function onAnalyze(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("rfp", file);
      }
      if (rfpText.trim()) {
        formData.append("text", rfpText.trim());
      }

      const response = await fetch("/api/analyze-rfp", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
      await loadHistory();
    } catch (analysisError) {
      setError(analysisError.message || "Unable to run intelligence analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="pi-page">
      <section className="pi-hero">
        <h1>Procurement Intelligence & Risk Detection Platform</h1>
        <p>
          Detect procurement failure patterns before they destroy margin, schedule, and delivery confidence.
        </p>
      </section>

      <div className="pi-grid">
        <section className="panel">
          <h2>Upload RFP</h2>
          <form onSubmit={onAnalyze} className="stack">
            <label className="upload-box">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <span>{file ? `PDF selected: ${file.name}` : "Drop PDF here or click to upload"}</span>
            </label>

            <textarea
              rows={9}
              value={rfpText}
              onChange={(event) => setRfpText(event.target.value)}
              placeholder="Paste full RFP text if you are not uploading a PDF..."
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing procurement intelligence..." : "Analyze"}
            </button>
            {error ? <p className="error-msg">{error}</p> : null}
          </form>
        </section>

        <section className="panel">
          <h2>Risk Intelligence Dashboard</h2>
          {!result ? (
            <p className="muted">Run an analysis to generate urgency, scope volatility, and post-award risk intelligence.</p>
          ) : (
            <>
              <div className="intelligence-score">
                <span>Intelligence Score</span>
                <strong>{intelligenceScore}</strong>
              </div>

              <div className="risk-grid">
                <ScoreCard title="Urgency Risk" score={result.scores.urgency} />
                <ScoreCard title="Scope Volatility" score={result.scores.scope_volatility} />
                <ScoreCard title="Post-Award Risk" score={result.scores.post_award_risk} />
              </div>

              <p className="summary">{result.summary}</p>

              <h3>Executive Insights</h3>
              <ul>
                {(result.insights || []).map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>

              <h3>Recommendation</h3>
              <p className="recommendation">{result.recommendation}</p>
            </>
          )}
        </section>
      </div>

      <section className="panel history">
        <h2>Recent Intelligence Runs</h2>
        {!history.length ? (
          <p className="muted">No analysis history yet.</p>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <article key={entry._id} className="history-item">
                <header>
                  <strong>{entry.filename || "Text Input"}</strong>
                  <span>{new Date(entry.analyzedAt).toLocaleString()}</span>
                </header>
                <p>{entry.recommendation}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

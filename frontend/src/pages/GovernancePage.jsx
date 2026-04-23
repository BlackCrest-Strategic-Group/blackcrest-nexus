import { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const confidenceClass = {
  'High Confidence': 'success',
  'Moderate Confidence': 'warning',
  'Low Confidence': 'danger',
  'Insufficient Data': 'danger'
};

export default function GovernancePage() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await api.get('/api/governance/dashboard');
      if (mounted) setPayload(data);
    })();
    return () => { mounted = false; };
  }, []);

  if (!payload) return <section><div className="page-header"><h1>Loading governance oversight…</h1></div></section>;

  const { dashboard, workflow, approvalQueue } = payload;

  return (
    <section>
      <SeoHead title="AI Governance & Oversight | BlackCrest OS" description="Human-in-the-loop governance dashboard for procurement intelligence." canonicalPath="/governance" />
      <div className="page-header">
        <h1>AI Governance & Oversight</h1>
        <p>AI recommendations are advisory only. Human approval controls remain authoritative.</p>
      </div>

      <div className="grid four">
        <article className="card"><p className="metric-label">Pending Approvals</p><h3>{dashboard.pendingApprovals}</h3></article>
        <article className="card"><p className="metric-label">Escalated Workflows</p><h3>{dashboard.escalatedWorkflows}</h3></article>
        <article className="card"><p className="metric-label">Override Frequency</p><h3>{dashboard.overrideFrequency}</h3></article>
        <article className="card"><p className="metric-label">Compliance Alerts</p><h3>{dashboard.complianceAlerts}</h3></article>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>Why This Recommendation?</h3>
          <p><strong>{workflow.recommendation}</strong></p>
          <ul>{workflow.explainability.why.map((point) => <li key={point}>{point}</li>)}</ul>
          <p className="muted">FAR/DFARS: {workflow.explainability.complianceIndicators.farDfars}</p>
          <p className={`status-pill ${confidenceClass[workflow.confidence.band] || 'warning'}`}>{workflow.confidence.band}</p>
        </article>

        <article className="card">
          <h3>Human-in-the-Loop Actions</h3>
          <p>Current state: <strong>{workflow.currentState}</strong></p>
          <p>Escalation route: <strong>{workflow.escalation.route}</strong> — {workflow.escalation.reason}</p>
          <div className="row">{workflow.actions.map((action) => <button key={action} className="btn ghost">{action}</button>)}</div>
          <p className="muted">Low confidence recommendations are automatically queued for manual review.</p>
        </article>
      </div>

      <article className="card">
        <h3>Approval Queue</h3>
        <div className="grid two">{approvalQueue.map((item) => (
          <div key={item.id} className="card nested">
            <p className="metric-label">{item.type}</p>
            <p>{item.id} · {item.owner}</p>
            <p>Status: <strong>{item.status}</strong></p>
            <p>Confidence: <strong>{item.confidence}</strong></p>
          </div>
        ))}</div>
      </article>

      <article className="card">
        <h3>Executive Summary</h3>
        <ul>{dashboard.executiveSummary.map((line) => <li key={line}>{line}</li>)}</ul>
      </article>
    </section>
  );
}

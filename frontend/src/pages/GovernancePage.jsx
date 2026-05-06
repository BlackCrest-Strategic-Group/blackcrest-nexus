import { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const confidenceClass = {
  'High Confidence': 'success',
  'Moderate Confidence': 'warning',
  'Low Confidence': 'danger',
  'Insufficient Data': 'danger'
};

const governanceSections = [
  'Audit Logs',
  'Compliance Monitoring',
  'User Permissions',
  'Security Alerts',
  'ERP Access Tracking',
  'AI Governance'
];

const governanceControls = [
  'MFA enforcement',
  'session timeout',
  'role restrictions',
  'export controls',
  'module permissions'
];

const complianceWidgets = [
  { title: 'NIST readiness', value: '87%', status: 'On track' },
  { title: 'vendor compliance', value: '94%', status: 'Verified vendors' },
  { title: 'procurement policy alerts', value: '3 open', status: 'Review required' },
  { title: 'supplier documentation status', value: '91%', status: 'Current records' }
];

const securityCenter = [
  { title: 'suspicious logins', value: '2', detail: 'Flagged in last 24 hours' },
  { title: 'failed access attempts', value: '17', detail: 'Monitored across modules' },
  { title: 'API token monitoring', value: '5 rotating', detail: 'No compromised tokens' },
  { title: 'admin actions', value: '12', detail: 'Tracked with full audit trail' }
];

export default function GovernancePage() {
  const [payload, setPayload] = useState(null);
  const { user } = useAuth();

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
  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin';

  return (
    <section>
      <SeoHead title="Sentinel Governance | BlackCrest Nexus" description="Enterprise governance dashboard for Sentinel oversight, compliance, and security controls." canonicalPath="/governance" />
      <div className="page-header">
        <h1>Sentinel Governance Module</h1>
        <p>Enterprise governance command center for AI-assisted procurement decisions and operational risk monitoring.</p>
      </div>

      <div className="grid four">
        {governanceSections.map((section) => (
          <article key={section} className="card">
            <p className="metric-label">Section</p>
            <h3>{section}</h3>
          </article>
        ))}
      </div>

      <article className="card">
        <h3>Audit Logs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>user</th>
                <th style={{ textAlign: 'left' }}>action</th>
                <th style={{ textAlign: 'left' }}>timestamp</th>
                <th style={{ textAlign: 'left' }}>module</th>
                <th style={{ textAlign: 'left' }}>status</th>
              </tr>
            </thead>
            <tbody>
              {approvalQueue.slice(0, 5).map((item, index) => (
                <tr key={item.id}>
                  <td>owner-{index + 1}</td>
                  <td>{item.type}</td>
                  <td>{new Date().toISOString()}</td>
                  <td>{item.id}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="grid two">
        <article className="card">
          <h3>Compliance Monitoring</h3>
          <div className="grid two">
            {complianceWidgets.map((widget) => (
              <div key={widget.title} className="card nested">
                <p className="metric-label">{widget.title}</p>
                <h4>{widget.value}</h4>
                <p className="muted">{widget.status}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Security Center</h3>
          <div className="grid two">
            {securityCenter.map((item) => (
              <div key={item.title} className="card nested">
                <p className="metric-label">{item.title}</p>
                <h4>{item.value}</h4>
                <p className="muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>User Permissions</h3>
          <p>Role-based permission boundaries are enforced across procurement, ERP access, and AI workflow approvals.</p>
          <p className="status-pill success">Current role: {user?.role || 'Unknown'}</p>
        </article>

        <article className="card">
          <h3>AI Governance</h3>
          <p><strong>{workflow.recommendation}</strong></p>
          <ul>{workflow.explainability.why.map((point) => <li key={point}>{point}</li>)}</ul>
          <p className="muted">FAR/DFARS: {workflow.explainability.complianceIndicators.farDfars}</p>
          <p className={`status-pill ${confidenceClass[workflow.confidence.band] || 'warning'}`}>{workflow.confidence.band}</p>
        </article>
      </div>

      <article className="card">
        <h3>Governance Controls</h3>
        {isAdmin ? (
          <>
            <p>Admin controls are active for policy enforcement and access governance.</p>
            <div className="grid two">
              {governanceControls.map((control) => (
                <div key={control} className="card nested"><strong>{control}</strong></div>
              ))}
            </div>
          </>
        ) : (
          <p className="status-pill danger">Restricted: Only Admin role can access governance controls.</p>
        )}
      </article>

      <div className="grid four">
        <article className="card"><p className="metric-label">Pending Approvals</p><h3>{dashboard.pendingApprovals}</h3></article>
        <article className="card"><p className="metric-label">Escalated Workflows</p><h3>{dashboard.escalatedWorkflows}</h3></article>
        <article className="card"><p className="metric-label">Override Frequency</p><h3>{dashboard.overrideFrequency}</h3></article>
        <article className="card"><p className="metric-label">Compliance Alerts</p><h3>{dashboard.complianceAlerts}</h3></article>
      </div>
    </section>
  );
}

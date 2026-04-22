import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/dashboard');
        if (mounted) setDashboard(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <section><div className="page-header"><h1>Loading dashboard…</h1></div></section>;
  }

  const roleDashboard = dashboard?.roleDashboard || {};

  return (
    <section>
      <SeoHead title="Dashboard | BlackCrest OS" description="Role-based procurement operations dashboard." canonicalPath="/dashboard" />
      <div className="page-header">
        <h1>{roleDashboard.dashboardTitle || 'Procurement Dashboard'}</h1>
        <p>{dashboard?.role?.label} · {dashboard?.personalization?.company || 'Enterprise Workspace'}</p>
      </div>

      <div className="grid four">
        {(roleDashboard.kpis || []).map(({ label, value }) => (
          <article key={label} className="card">
            <p className="metric-label">{label}</p>
            <h3>{value}</h3>
          </article>
        ))}
      </div>

      <div className="grid two">
        <article className="card">
          <h3>AI Role Briefing</h3>
          <p>{roleDashboard.briefing}</p>
        </article>
        <article className="card">
          <h3>Sentinel Monitoring</h3>
          <ul>
            <li>Monitoring: {dashboard?.sentinel?.monitoringStatus}</li>
            <li>Anomaly Detection: {dashboard?.sentinel?.anomalyDetection}</li>
            <li>Escalations: {(dashboard?.sentinel?.escalationWorkflows || []).join(', ')}</li>
          </ul>
        </article>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>Role Intelligence</h3>
          <ul>{(roleDashboard.intelligence || []).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="card">
          <h3>Role Alerts</h3>
          <ul>{(roleDashboard.alerts || []).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}

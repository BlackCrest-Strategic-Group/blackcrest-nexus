import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function riskLabel(score) {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

export default function GlobalIntelligencePage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/global-intelligence/overview');
        if (mounted) setOverview(data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || err.message || 'Global intelligence is unavailable.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const alerts = useMemo(() => (overview?.executiveAlerts || []).slice().sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)), [overview]);
  const countries = overview?.countryRisks || [];
  const signals = overview?.globalSignals || [];

  if (loading) return <section><div className="page-header"><h1>Loading global intelligence…</h1></div></section>;

  return (
    <section>
      <SeoHead title="Global Procurement Intelligence | BlackCrest AI" description="Global procurement intelligence for geopolitical risk, supplier exposure, sanctions posture, logistics disruption, tariff volatility, and executive supply chain action." canonicalPath="/global-intelligence" />
      <div className="page-header">
        <h1>Global Procurement Intelligence Command Center</h1>
        <p>External risk fusion across country exposure, geopolitical volatility, tariffs, sanctions posture, logistics disruption, weather events, and supplier continuity.</p>
      </div>

      {error ? <article className="card" style={{ marginBottom: 16 }}><strong>Notice:</strong> {error}</article> : null}

      <article className="card" style={{ marginBottom: 16 }}>
        <strong>Executive Briefing</strong>
        <p style={{ margin: '8px 0 0 0' }}>{overview?.executiveSummary || 'Global intelligence overview is being prepared.'}</p>
        <p className="muted" style={{ margin: '8px 0 0 0' }}>Mode: {overview?.platformMode || 'global-intelligence'} · Generated: {overview?.generatedAt ? new Date(overview.generatedAt).toLocaleString() : 'N/A'}</p>
      </article>

      <div className="grid four">
        <article className="card"><p className="metric-label">Executive Alerts</p><h3>{alerts.length}</h3></article>
        <article className="card"><p className="metric-label">Countries Monitored</p><h3>{countries.length}</h3></article>
        <article className="card"><p className="metric-label">Active Signals</p><h3>{signals.length}</h3></article>
        <article className="card"><p className="metric-label">Highest Country Risk</p><h3>{countries[0]?.compositeRisk || 0}/100</h3></article>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <article className="card">
          <h3>Executive Risk Alerts</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {alerts.map((alert) => (
              <div key={alert.title} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.25)', paddingBottom: 10 }}>
                <p style={{ margin: 0 }}><strong>{alert.severity}</strong> · {alert.title}</p>
                <p className="muted" style={{ margin: '6px 0' }}>Drivers: {(alert.drivers || []).join(', ')}</p>
                <p style={{ margin: 0 }}>Action: {alert.recommendedAction}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Global Disruption Signals</h3>
          <ul>
            {signals.map((signal) => (
              <li key={signal.id}><strong>{signal.severity}</strong> · {signal.region} · {signal.title}<br /><span className="muted">{signal.impact}</span></li>
            ))}
          </ul>
        </article>
      </div>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Country Risk Heatmap</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Country</th>
                <th>Composite</th>
                <th>Risk</th>
                <th>Geopolitical</th>
                <th>Tariff</th>
                <th>Logistics</th>
                <th>Sanctions</th>
                <th>Weather</th>
                <th>Executive Summary</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.country}>
                  <td><strong>{country.country}</strong></td>
                  <td>{country.compositeRisk}</td>
                  <td>{riskLabel(country.compositeRisk)}</td>
                  <td>{country.geopoliticalRisk}</td>
                  <td>{country.tariffRisk}</td>
                  <td>{country.logisticsRisk}</td>
                  <td>{country.sanctionsExposure}</td>
                  <td>{country.weatherExposure}</td>
                  <td>{country.executiveSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card" style={{ marginTop: 16 }}>
        <h3>Enterprise Intelligence Coverage</h3>
        <div className="grid three">
          <p><strong>Sanctions / Watchlist:</strong><br />Architecture-ready for OFAC, BIS, EU, UK, and UN screening connectors.</p>
          <p><strong>Tariff / Geopolitical:</strong><br />Country and category scoring model prepared for trade-rule and geopolitical data feeds.</p>
          <p><strong>Freight / Weather:</strong><br />Signal layer prepared for port, carrier, storm, and logistics disruption intelligence.</p>
        </div>
      </article>
    </section>
  );
}

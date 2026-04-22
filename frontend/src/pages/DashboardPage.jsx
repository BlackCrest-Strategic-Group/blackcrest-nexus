import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const FALLBACK_DASHBOARD = {
  personalization: {
    name: 'Executive Demo User',
    procurementFocus: 'Global Strategic Sourcing'
  },
  executiveCommandCenter: {
    procurementHealthScore: 83,
    commodityPriceMovement: '+2.1% week-over-week',
    opportunityScoring: '14 high-conviction pursuits',
    contractExpirationTracking: '9 contracts expire in 120 days',
    proposalWinProbability: '67% weighted average',
    marginForecasting: '+3.4 pts expected margin improvement',
    inventorySourcingDisruptions: '2 high-impact disruptions',
    geopoliticalImpacts: 'Tariff escalation watchlist: 4 commodities',
    supplierDiversificationWarnings: '3 concentration risks',
    executiveRecommendations: [
      'Diversify electronics sourcing away from single-region concentration.',
      'Accelerate teaming strategy for DHS cloud modernization opportunity.',
      'Stockpile long-lead components to protect Q3 margin targets.'
    ],
    financialImpactProjection: '$4.2M margin preservation modeled in 2 quarters'
  },
  agentStatuses: [
    { name: 'Capture Agent', status: 'active', summary: 'Detected 6 new pursuits with >70 win score.' },
    { name: 'Risk Agent', status: 'warning', summary: 'Supplier concentration elevated in semiconductors.' },
    { name: 'Executive Briefing Agent', status: 'active', summary: 'Daily C-suite briefing delivered at 06:00 UTC.' }
  ],
  widgets: {
    highPriorityActions: [
      { title: 'Initiate renegotiation with Atlas Materials before tariff update.' },
      { title: 'Escalate alternate supplier qualification for avionics casting.' }
    ],
    opportunitiesWorthPursuing: [{ title: 'USAF Sustainment Analytics BPA', output: { bidRecommendation: 'Pursue' } }]
  }
};

function MetricCard({ title, value }) {
  return (
    <article className="card intelligence-card metric-card">
      <p className="metric-label">{title}</p>
      <h3>{value}</h3>
    </article>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/dashboard');
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Live command data unavailable. Running in executive demo mode.');
          setData(FALLBACK_DASHBOARD);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const personalization = useMemo(() => data?.personalization || {}, [data]);
  const center = useMemo(() => data?.executiveCommandCenter || FALLBACK_DASHBOARD.executiveCommandCenter, [data]);
  const actions = useMemo(() => data?.widgets?.highPriorityActions || [], [data]);
  const agents = useMemo(() => data?.agentStatuses || [], [data]);

  if (loading) return <p>Loading BlackCrest OpportunityOS command center…</p>;

  const keyMetrics = [
    ['Procurement Health Score', `${center.procurementHealthScore}/100`],
    ['Commodity Price Movement', center.commodityPriceMovement],
    ['Opportunity Scoring', center.opportunityScoring],
    ['Contract Expiration Tracking', center.contractExpirationTracking],
    ['Proposal Win Probability', center.proposalWinProbability],
    ['Margin Forecasting', center.marginForecasting],
    ['Inventory + Sourcing Disruptions', center.inventorySourcingDisruptions],
    ['Geopolitical Procurement Impacts', center.geopoliticalImpacts],
    ['Supplier Diversification Warnings', center.supplierDiversificationWarnings],
    ['Financial Impact Projection', center.financialImpactProjection]
  ];

  return (
    <div className="command-theme" data-testid="dashboard-command-center">
      <section className="card cinematic-panel">
        <p className="landing-kicker">BlackCrest OpportunityOS · Powered by Truth Serum AI</p>
        <h1>Executive Procurement Command Center</h1>
        <p>Welcome {personalization.name || 'Executive User'}. Focus: {personalization.procurementFocus || 'Enterprise Procurement'}.</p>
        {error ? <p className="muted">{error}</p> : null}
      </section>

      <section className="grid three">
        {keyMetrics.map(([title, value]) => <MetricCard key={title} title={title} value={value} />)}
      </section>

      <section className="grid two">
        <article className="card intelligence-card">
          <h2>Truth Serum AI Executive Recommendations</h2>
          <ul>
            {(center.executiveRecommendations || []).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="card intelligence-card">
          <h2>AI Procurement Agent Activity</h2>
          <ul>
            {agents.map((agent) => (
              <li key={agent.name}>
                <strong>{agent.name}</strong> · <span className={`agent-status ${agent.status}`}>{agent.status}</span>
                <br />
                <small className="muted">{agent.summary}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card intelligence-card">
        <h2>Priority Operational Queue</h2>
        <ul>
          {actions.length ? actions.map((item) => <li key={item.title}>{item.title}</li>) : <li className="muted">No immediate actions.</li>}
        </ul>
      </section>
    </div>
  );
}

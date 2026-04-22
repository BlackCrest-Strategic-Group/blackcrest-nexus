import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const FALLBACK_DASHBOARD = {
  personalization: {
    name: 'Demo User',
    procurementFocus: 'Federal IT Services'
  },
  widgets: {
    highPriorityActions: [
      { title: 'Follow up on expiring contract vehicle access' },
      { title: 'Submit teaming request for upcoming DHS cloud renewal' }
    ],
    suppliersToReview: [
      { name: 'Atlas Systems' },
      { name: 'BlueForge Logistics' }
    ],
    categoryRisks: [
      { categoryName: 'Cybersecurity Services', output: { risks: ['Pricing pressure from incumbent small-biz pool'] } }
    ],
    opportunitiesWorthPursuing: [
      { title: 'USDA Data Modernization BPA', output: { bidRecommendation: 'Bid' } }
    ]
  }
};

function ProfitLevers({ widgets }) {
  const opportunities = Array.isArray(widgets?.opportunitiesWorthPursuing) ? widgets.opportunitiesWorthPursuing : [];
  const priorityActions = Array.isArray(widgets?.highPriorityActions) ? widgets.highPriorityActions : [];

  const estimatedPipeline = opportunities.length * 250000;
  const executionUrgency = Math.min(100, priorityActions.length * 20);

  return (
    <section className="card">
      <h3>Profitability Levers</h3>
      <p className="muted">Quick commercial guidance for demo conversations.</p>
      <ul>
        <li><strong>Estimated Qualified Pipeline:</strong> ${estimatedPipeline.toLocaleString()}</li>
        <li><strong>Execution Urgency Score:</strong> {executionUrgency}/100</li>
        <li><strong>Margin Protection Move:</strong> Prioritize suppliers with low delivery risk for top bids.</li>
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/dashboard');
        if (isMounted) {
          setData(res.data);
          setUsingFallback(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Dashboard data is unavailable. Showing demo-safe fallback content.');
          setData(FALLBACK_DASHBOARD);
          setUsingFallback(true);
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

  const widgets = useMemo(() => (data && typeof data.widgets === 'object' && data.widgets !== null ? data.widgets : {}), [data]);
  const personalization = useMemo(() => (
    data && typeof data.personalization === 'object' && data.personalization !== null
      ? data.personalization
      : {}
  ), [data]);

  if (loading) return <p>Loading dashboard...</p>;

  const highPriorityActions = Array.isArray(widgets.highPriorityActions) ? widgets.highPriorityActions : [];
  const suppliersToReview = Array.isArray(widgets.suppliersToReview) ? widgets.suppliersToReview : [];
  const categoryRisks = Array.isArray(widgets.categoryRisks) ? widgets.categoryRisks : [];
  const opportunitiesWorthPursuing = Array.isArray(widgets.opportunitiesWorthPursuing) ? widgets.opportunitiesWorthPursuing : [];

  const cards = [
    ['High Priority Actions', highPriorityActions.map((x) => x?.title).filter(Boolean)],
    ['Suppliers To Review', suppliersToReview.map((x) => x?.name).filter(Boolean)],
    ['Category Risks', categoryRisks.map((x) => `${x?.categoryName || 'Category'}: ${x?.output?.risks?.[0] || 'No risk noted'}`)],
    ['Opportunities Worth Pursuing', opportunitiesWorthPursuing.map((x) => `${x?.title || 'Opportunity'} - ${x?.output?.bidRecommendation || 'Review needed'}`)]
  ];

  return (
    <div>
      <h1>Decision Center</h1>
      <p>Welcome {personalization.name || 'User'}. Focus: {personalization.procurementFocus || 'General Procurement'}</p>
      {error ? <p className="muted">{error}</p> : null}
      {usingFallback ? <p className="muted">Fallback mode is active for demo continuity.</p> : null}
      <div className="grid two">
        {cards.map(([title, list]) => (
          <section key={title} className="card">
            <h3>{title}</h3>
            <ul>{list.length ? list.map((i) => <li key={i}>{i}</li>) : <li className="muted">No items yet.</li>}</ul>
          </section>
        ))}
      </div>
      <ProfitLevers widgets={widgets} />
    </div>
  );
}

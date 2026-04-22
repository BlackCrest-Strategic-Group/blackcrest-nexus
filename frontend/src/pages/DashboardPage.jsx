import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);
  if (!data) return <p>Loading dashboard...</p>;

  const widgets = data && typeof data.widgets === 'object' && data.widgets !== null ? data.widgets : {};
  const personalization = data && typeof data.personalization === 'object' && data.personalization !== null
    ? data.personalization
    : {};

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

  return <div><h1>Decision Center</h1><p>Welcome {personalization.name || 'User'}. Focus: {personalization.procurementFocus || 'General Procurement'}</p><div className="grid two">{cards.map(([title, list]) => <section key={title} className="card"><h3>{title}</h3><ul>{list.map((i) => <li key={i}>{i}</li>)}</ul></section>)}</div></div>;
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/dashboard').then((res) => setData(res.data)); }, []);
  if (!data) return <p>Loading dashboard...</p>;
  const cards = [
    ['High Priority Actions', data.widgets.highPriorityActions?.map((x) => x.title)],
    ['Suppliers To Review', data.widgets.suppliersToReview?.map((x) => x.name)],
    ['Category Risks', data.widgets.categoryRisks?.map((x) => `${x.categoryName}: ${x.output?.risks?.[0] || 'No risk noted'}`)],
    ['Opportunities Worth Pursuing', data.widgets.opportunitiesWorthPursuing?.map((x) => `${x.title} - ${x.output?.bidRecommendation}`)]
  ];
  return <div><h1>Decision Center</h1><p>Welcome {data.personalization.name}. Focus: {data.personalization.procurementFocus || 'General Procurement'}</p><div className="grid two">{cards.map(([title, list]) => <section key={title} className="card"><h3>{title}</h3><ul>{(list || []).map((i) => <li key={i}>{i}</li>)}</ul></section>)}</div></div>;
}

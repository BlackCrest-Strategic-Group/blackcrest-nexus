import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState(null);
  useEffect(() => { api.get('/history').then((res) => setHistory(res.data)); }, []);
  if (!history) return <p>Loading history...</p>;
  return <div><h1>History</h1><div className="grid three"><section className="card"><h3>Category Snapshots</h3><ul>{history.categories.map((x)=><li key={x._id}>{x.categoryName}</li>)}</ul></section><section className="card"><h3>Supplier Analyses</h3><ul>{history.supplierAnalyses.map((x)=><li key={x._id}>{x.supplierId?.name || 'Supplier'} - {x.output?.fitScore}</li>)}</ul></section><section className="card"><h3>Opportunity Analyses</h3><ul>{history.opportunities.map((x)=><li key={x._id}>{x.title} - {x.output?.bidRecommendation}</li>)}</ul></section></div></div>;
}

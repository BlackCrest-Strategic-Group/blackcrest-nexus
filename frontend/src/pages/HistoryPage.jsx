import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState(null);
  useEffect(() => {
    api.get('/history').then((res) => setHistory(res.data));
  }, []);
  if (!history) return <p>Loading history...</p>;

  const safeCategories = Array.isArray(history.categories) ? history.categories : [];
  const safeSupplierAnalyses = Array.isArray(history.supplierAnalyses) ? history.supplierAnalyses : [];
  const safeOpportunities = Array.isArray(history.opportunities) ? history.opportunities : [];

  return <div><h1>History</h1><div className="grid three"><section className="card"><h3>Category Snapshots</h3><ul>{safeCategories.map((x)=><li key={x?._id || x?.categoryName}>{x?.categoryName || 'Category snapshot'}</li>)}</ul></section><section className="card"><h3>Supplier Analyses</h3><ul>{safeSupplierAnalyses.map((x)=><li key={x?._id || x?.supplierId?.name}>{x?.supplierId?.name || 'Supplier'} - {x?.output?.fitScore ?? 'N/A'}</li>)}</ul></section><section className="card"><h3>Opportunity Analyses</h3><ul>{safeOpportunities.map((x)=><li key={x?._id || x?.title}>{x?.title || 'Opportunity'} - {x?.output?.bidRecommendation || 'Pending review'}</li>)}</ul></section></div></div>;
}

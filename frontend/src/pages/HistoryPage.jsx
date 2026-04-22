import React, { useEffect, useState } from 'react';
import api from '../services/api';

const FALLBACK_HISTORY = {
  categories: [{ _id: 'demo-c1', categoryName: 'AI/ML Professional Services' }],
  supplierAnalyses: [{ _id: 'demo-s1', supplierId: { name: 'Precision Delivery Group' }, output: { fitScore: 82 } }],
  opportunities: [{ _id: 'demo-o1', title: 'DOJ Data Governance Support', output: { bidRecommendation: 'Bid' } }]
};

export default function HistoryPage() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/history');
        setHistory(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'History is unavailable. Showing demo fallback.');
        setHistory(FALLBACK_HISTORY);
      }
    };
    load();
  }, []);

  if (!history) return <p>Loading history...</p>;

  const safeCategories = Array.isArray(history.categories) ? history.categories : [];
  const safeSupplierAnalyses = Array.isArray(history.supplierAnalyses) ? history.supplierAnalyses : [];
  const safeOpportunities = Array.isArray(history.opportunities) ? history.opportunities : [];

  return (
    <div>
      <h1>History</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="grid three">
        <section className="card">
          <h3>Category Snapshots</h3>
          <ul>{safeCategories.map((x) => <li key={x?._id || x?.categoryName}>{x?.categoryName || 'Category snapshot'}</li>)}</ul>
        </section>
        <section className="card">
          <h3>Supplier Analyses</h3>
          <ul>{safeSupplierAnalyses.map((x) => <li key={x?._id || x?.supplierId?.name}>{x?.supplierId?.name || 'Supplier'} - {x?.output?.fitScore ?? 'N/A'}</li>)}</ul>
        </section>
        <section className="card">
          <h3>Opportunity Analyses</h3>
          <ul>{safeOpportunities.map((x) => <li key={x?._id || x?.title}>{x?.title || 'Opportunity'} - {x?.output?.bidRecommendation || 'Pending review'}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}

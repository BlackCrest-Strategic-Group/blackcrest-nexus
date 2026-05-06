import React, { useEffect, useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const categoryDefinitions = [
  { name: 'Electronics', riskBase: 74, volatility: 'High', diversification: 'Moderate', regionalExposure: 'APAC heavy' },
  { name: 'Metals', riskBase: 68, volatility: 'High', diversification: 'Low', regionalExposure: 'LATAM + EMEA' },
  { name: 'Logistics', riskBase: 63, volatility: 'Medium', diversification: 'Moderate', regionalExposure: 'Global corridors' },
  { name: 'Packaging', riskBase: 57, volatility: 'Medium', diversification: 'High', regionalExposure: 'Domestic primary' },
  { name: 'IT Services', riskBase: 61, volatility: 'Low', diversification: 'High', regionalExposure: 'North America' },
  { name: 'MRO', riskBase: 54, volatility: 'Medium', diversification: 'Moderate', regionalExposure: 'Regional hubs' },
  { name: 'Raw Materials', riskBase: 78, volatility: 'High', diversification: 'Low', regionalExposure: 'Multi-continent' }
];

const enterpriseStrategies = [
  'Consolidation opportunities across fragmented suppliers',
  'Supplier diversification for high-risk categories',
  'Risk mitigation through dual-sourcing and contract controls',
  'Sourcing recommendations backed by spend and volatility intelligence'
];

const workflowActions = ['Create sourcing event', 'Add suppliers', 'Assign RFQs', 'Generate reports'];

export default function CategoryPage() {
  const [summary, setSummary] = useState({ poStatus: {}, savings: {} });
  const [contracts, setContracts] = useState([]);
  const [savings, setSavings] = useState([]);

  useEffect(() => {
    async function load() {
      const [summaryRes, contractRes, savingsRes] = await Promise.all([
        api.get('/api/procurement-intelligence/summary'),
        api.get('/api/procurement-intelligence/contracts'),
        api.get('/api/procurement-intelligence/savings')
      ]);
      setSummary(summaryRes.data || {});
      setContracts(contractRes.data || []);
      setSavings(savingsRes.data || []);
    }

    load();
  }, []);

  const dashboard = useMemo(() => {
    const totalSpend = contracts.reduce((acc, contract) => acc + Number(contract.annualValue || 0), 0);
    const supplierSet = new Set(contracts.map((c) => c.supplierName).filter(Boolean));
    const supplierCount = supplierSet.size;
    const savingsPotential = savings.reduce((acc, row) => acc + Math.max(0, Number(row.baselineCost || 0) - Number(row.negotiatedCost || 0)), 0);

    return categoryDefinitions.map((category, index) => {
      const categoryContracts = contracts.filter((contract) => (contract.category || '').toLowerCase() === category.name.toLowerCase());
      const categorySuppliers = new Set(categoryContracts.map((contract) => contract.supplierName).filter(Boolean));
      const categorySpend = categoryContracts.reduce((acc, contract) => acc + Number(contract.annualValue || 0), 0);
      const contractExposure = totalSpend ? Math.round((categorySpend / totalSpend) * 100) : Math.max(8, 22 - index * 2);
      const riskExposure = Math.min(95, Math.round(category.riskBase + contractExposure / 4));
      const sourcingActivity = Math.max(1, categoryContracts.length + Math.round(contractExposure / 8));

      return {
        ...category,
        totalSpend: categorySpend || Math.round((totalSpend || 8000000) * (0.07 + index * 0.02)),
        supplierCount: categorySuppliers.size || Math.max(3, Math.round((supplierCount || 20) / (index + 2))),
        riskExposure,
        savingsOpportunities: Math.round((savingsPotential || 1200000) * (0.06 + index * 0.015)),
        contractExposure,
        sourcingActivity
      };
    });
  }, [contracts, savings]);

  const analytics = useMemo(() => {
    const spendTrend = dashboard.map((item, idx) => ({ label: item.name, score: Math.min(100, 52 + idx * 6 + Math.round(item.contractExposure / 4)) }));
    const supplierConcentration = dashboard.map((item) => ({ label: item.name, score: Math.max(20, Math.round((item.contractExposure * 1.3) / Math.max(item.supplierCount, 1))) }));
    const categoryVolatility = dashboard.map((item) => ({ label: item.name, score: item.volatility === 'High' ? 82 : item.volatility === 'Medium' ? 61 : 38 }));
    const regionalExposure = dashboard.map((item, idx) => ({ label: item.name, score: Math.max(25, 72 - idx * 6) }));

    return { spendTrend, supplierConcentration, categoryVolatility, regionalExposure };
  }, [dashboard]);

  function MetricBar({ score }) {
    return (
      <div style={{ background: 'rgba(124, 140, 180, 0.25)', borderRadius: 999, height: 8, marginTop: 6 }}>
        <div style={{ width: `${score}%`, borderRadius: 999, height: 8, background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6)' }} />
      </div>
    );
  }

  return (
    <section>
      <SeoHead title="Category Management Intelligence | BlackCrest Nexus" description="Enterprise category intelligence dashboard with spend, risk, sourcing, and strategy workflows." canonicalPath="/category" />
      <div className="page-header procurement-hero">
        <h1>Category Intelligence Dashboard</h1>
        <p>Enterprise-grade category management view covering spend control, risk posture, sourcing velocity, and strategy execution.</p>
      </div>

      <div className="grid four">
        <article className="card"><h3>Total Managed Spend</h3><p className="metric-label">${Math.round(dashboard.reduce((acc, item) => acc + item.totalSpend, 0)).toLocaleString()}</p></article>
        <article className="card"><h3>Total Suppliers</h3><p className="metric-label">{dashboard.reduce((acc, item) => acc + item.supplierCount, 0)}</p></article>
        <article className="card"><h3>Average Risk Exposure</h3><p className="metric-label">{Math.round(dashboard.reduce((acc, item) => acc + item.riskExposure, 0) / dashboard.length)}%</p></article>
        <article className="card"><h3>Open Sourcing Actions</h3><p className="metric-label">{dashboard.reduce((acc, item) => acc + item.sourcingActivity, 0)}</p></article>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 12 }}>
        {dashboard.map((category) => (
          <article className="card" key={category.name} style={{ border: '1px solid rgba(120, 139, 180, 0.28)', boxShadow: '0 10px 30px rgba(2, 6, 23, 0.35)' }}>
            <h3>{category.name}</h3>
            <p><strong>Total spend:</strong> ${Math.round(category.totalSpend).toLocaleString()}</p>
            <p><strong>Supplier count:</strong> {category.supplierCount}</p>
            <p><strong>Risk exposure:</strong> {category.riskExposure}%</p>
            <p><strong>Savings opportunities:</strong> ${Math.round(category.savingsOpportunities).toLocaleString()}</p>
            <p><strong>Contract exposure:</strong> {category.contractExposure}%</p>
            <p><strong>Sourcing activity:</strong> {category.sourcingActivity} actions</p>
          </article>
        ))}
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <article className="card">
          <h3>Category Strategy Panel</h3>
          <ul>
            {enterpriseStrategies.map((strategy) => <li key={strategy}>{strategy}</li>)}
          </ul>
          <p style={{ marginTop: 10 }}><strong>Regional sourcing context:</strong> {dashboard.map((item) => `${item.name} (${item.regionalExposure})`).join(', ')}.</p>
        </article>

        <article className="card">
          <h3>Category Manager Workflow Actions</h3>
          <div className="grid two" style={{ gap: 10 }}>
            {workflowActions.map((action) => (
              <button key={action} className="btn" type="button" style={{ width: '100%', textAlign: 'left' }}>{action}</button>
            ))}
          </div>
          <p style={{ marginTop: 10 }}>Summary data source: {summary.dataSource || 'internal intelligence mesh'}.</p>
        </article>
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <article className="card">
          <h3>Spend Trends</h3>
          {analytics.spendTrend.map((item) => <div key={item.label}><p>{item.label}: {item.score}</p><MetricBar score={item.score} /></div>)}
          <h3 style={{ marginTop: 14 }}>Supplier Concentration</h3>
          {analytics.supplierConcentration.map((item) => <div key={item.label}><p>{item.label}: {item.score}</p><MetricBar score={item.score} /></div>)}
        </article>

        <article className="card">
          <h3>Category Volatility</h3>
          {analytics.categoryVolatility.map((item) => <div key={item.label}><p>{item.label}: {item.score}</p><MetricBar score={item.score} /></div>)}
          <h3 style={{ marginTop: 14 }}>Regional Sourcing Exposure</h3>
          {analytics.regionalExposure.map((item) => <div key={item.label}><p>{item.label}: {item.score}</p><MetricBar score={item.score} /></div>)}
        </article>
      </div>
    </section>
  );
}

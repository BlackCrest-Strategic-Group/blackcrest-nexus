import React, { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import api from '../utils/api';

const initialCategory = { categoryName: '', manager: '', annualBudget: '', targetSavingsPct: '', strategy: '' };
const initialContract = { contractNumber: '', supplierName: '', category: '', annualValue: '', startDate: '', endDate: '', status: 'active', notes: '' };
const initialSavings = { title: '', category: '', supplierName: '', baselineCost: '', negotiatedCost: '', status: 'pipeline', owner: '', notes: '' };

export default function CategoryPage() {
  const [summary, setSummary] = useState({ poStatus: {}, savings: {} });
  const [categories, setCategories] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [savings, setSavings] = useState([]);

  const [categoryForm, setCategoryForm] = useState(initialCategory);
  const [contractForm, setContractForm] = useState(initialContract);
  const [savingsForm, setSavingsForm] = useState(initialSavings);

  async function load() {
    const [summaryRes, catRes, contractRes, savingsRes] = await Promise.all([
      api.get('/api/procurement-intelligence/summary'),
      api.get('/api/procurement-intelligence/categories'),
      api.get('/api/procurement-intelligence/contracts'),
      api.get('/api/procurement-intelligence/savings')
    ]);
    setSummary(summaryRes.data || {});
    setCategories(catRes.data || []);
    setContracts(contractRes.data || []);
    setSavings(savingsRes.data || []);
  }

  useEffect(() => { load(); }, []);

  async function saveCategory(e) {
    e.preventDefault();
    await api.post('/api/procurement-intelligence/categories', { ...categoryForm, annualBudget: Number(categoryForm.annualBudget || 0), targetSavingsPct: Number(categoryForm.targetSavingsPct || 0) });
    setCategoryForm(initialCategory);
    await load();
  }

  async function saveContract(e) {
    e.preventDefault();
    await api.post('/api/procurement-intelligence/contracts', { ...contractForm, annualValue: Number(contractForm.annualValue || 0) });
    setContractForm(initialContract);
    await load();
  }

  async function saveSavings(e) {
    e.preventDefault();
    await api.post('/api/procurement-intelligence/savings', { ...savingsForm, baselineCost: Number(savingsForm.baselineCost || 0), negotiatedCost: Number(savingsForm.negotiatedCost || 0) });
    setSavingsForm(initialSavings);
    await load();
  }

  return (
    <section>
      <SeoHead title="Procurement Intelligence Modules | BlackCrest OS" description="PO status, category management, contracts, and savings tracker." canonicalPath="/analytics" />
      <div className="page-header procurement-hero"><h1>Procurement Intelligence System</h1><p>Real PO status, category management, contracts, and savings tracker modules.</p></div>

      <div className="grid four">
        <article className="card"><h3>Open POs</h3><p className="metric-label">{summary.poStatus?.openPos || 0}</p></article>
        <article className="card"><h3>Late POs</h3><p className="metric-label">{summary.poStatus?.latePos || 0}</p></article>
        <article className="card"><h3>Contracts</h3><p className="metric-label">{summary.contractCount || 0}</p></article>
        <article className="card"><h3>Realized Savings</h3><p className="metric-label">${Math.round(summary.savings?.realized || 0).toLocaleString()}</p></article>
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <article className="card">
          <h3>Category Management Form</h3>
          <form onSubmit={saveCategory} className="stack">
            <input className="input" placeholder="Category" value={categoryForm.categoryName} onChange={(e) => setCategoryForm((s) => ({ ...s, categoryName: e.target.value }))} required />
            <input className="input" placeholder="Manager" value={categoryForm.manager} onChange={(e) => setCategoryForm((s) => ({ ...s, manager: e.target.value }))} />
            <input className="input" type="number" placeholder="Annual budget" value={categoryForm.annualBudget} onChange={(e) => setCategoryForm((s) => ({ ...s, annualBudget: e.target.value }))} />
            <input className="input" type="number" placeholder="Target savings %" value={categoryForm.targetSavingsPct} onChange={(e) => setCategoryForm((s) => ({ ...s, targetSavingsPct: e.target.value }))} />
            <textarea className="input" placeholder="Strategy" value={categoryForm.strategy} onChange={(e) => setCategoryForm((s) => ({ ...s, strategy: e.target.value }))} />
            <button className="btn" type="submit">Save Category Plan</button>
          </form>
        </article>

        <article className="card">
          <h3>Contracts Module</h3>
          <form onSubmit={saveContract} className="stack">
            <input className="input" placeholder="Contract #" value={contractForm.contractNumber} onChange={(e) => setContractForm((s) => ({ ...s, contractNumber: e.target.value }))} required />
            <input className="input" placeholder="Supplier" value={contractForm.supplierName} onChange={(e) => setContractForm((s) => ({ ...s, supplierName: e.target.value }))} required />
            <input className="input" placeholder="Category" value={contractForm.category} onChange={(e) => setContractForm((s) => ({ ...s, category: e.target.value }))} />
            <input className="input" type="number" placeholder="Annual value" value={contractForm.annualValue} onChange={(e) => setContractForm((s) => ({ ...s, annualValue: e.target.value }))} />
            <div className="row"><input className="input" type="date" value={contractForm.startDate} onChange={(e) => setContractForm((s) => ({ ...s, startDate: e.target.value }))} /><input className="input" type="date" value={contractForm.endDate} onChange={(e) => setContractForm((s) => ({ ...s, endDate: e.target.value }))} /></div>
            <button className="btn" type="submit">Save Contract</button>
          </form>
        </article>
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <article className="card">
          <h3>Savings Tracker</h3>
          <form onSubmit={saveSavings} className="stack">
            <input className="input" placeholder="Initiative title" value={savingsForm.title} onChange={(e) => setSavingsForm((s) => ({ ...s, title: e.target.value }))} required />
            <input className="input" placeholder="Category" value={savingsForm.category} onChange={(e) => setSavingsForm((s) => ({ ...s, category: e.target.value }))} />
            <input className="input" placeholder="Supplier" value={savingsForm.supplierName} onChange={(e) => setSavingsForm((s) => ({ ...s, supplierName: e.target.value }))} />
            <div className="row"><input className="input" type="number" placeholder="Baseline cost" value={savingsForm.baselineCost} onChange={(e) => setSavingsForm((s) => ({ ...s, baselineCost: e.target.value }))} /><input className="input" type="number" placeholder="Negotiated cost" value={savingsForm.negotiatedCost} onChange={(e) => setSavingsForm((s) => ({ ...s, negotiatedCost: e.target.value }))} /></div>
            <button className="btn" type="submit">Save Savings Record</button>
          </form>
        </article>

        <article className="card">
          <h3>Data Tables</h3>
          <p><strong>Category Plans:</strong> {categories.length}</p>
          <p><strong>Contracts:</strong> {contracts.length}</p>
          <p><strong>Savings Initiatives:</strong> {savings.length}</p>
          <p><strong>Data Source:</strong> {summary.dataSource || 'unknown'}</p>
        </article>
      </div>
    </section>
  );
}

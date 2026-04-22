import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const INTELLIGENCE_TABS = [
  {
    id: 'category-intelligence',
    label: 'Category Intelligence',
    description: 'Analyze category signals, risks, and strategic recommendations.',
    load: async () => {
      const res = await api.get('/category-intelligence/history');
      return { history: Array.isArray(res.data) ? res.data : [] };
    },
    mapResponse: (payload) => payload,
    component: CategoryIntelligenceTab
  },
  {
    id: 'supplier-intelligence',
    label: 'Supplier Intelligence',
    description: 'Manage suppliers and run fit/risk evaluations for each supplier.',
    load: async () => {
      const res = await api.get('/supplier-intelligence');
      return { suppliers: Array.isArray(res.data) ? res.data : [] };
    },
    mapResponse: (payload) => payload,
    component: SupplierIntelligenceTab
  },
  {
    id: 'opportunity-intelligence',
    label: 'Opportunity Intelligence',
    description: 'Analyze RFP opportunity text/files for requirements, risks, and bid recommendation.',
    load: async () => ({ ready: true }),
    mapResponse: (payload) => payload,
    component: OpportunityIntelligenceTab
  }
];

const TAB_LOOKUP = Object.fromEntries(INTELLIGENCE_TABS.map((tab) => [tab.id, tab]));

function defaultTabState() {
  return INTELLIGENCE_TABS.reduce((acc, tab) => {
    acc[tab.id] = {
      loading: false,
      error: '',
      hasLoaded: false,
      data: null
    };
    return acc;
  }, {});
}

function safeMessage(error, fallback) {
  return error?.response?.data?.error || error?.message || fallback;
}

export default function IntelligencePage({ initialTab = 'category-intelligence' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabState, setTabState] = useState(() => defaultTabState());

  const [categoryForm, setCategoryForm] = useState({ categoryName: '', product: '', notes: '', geography: '' });
  const [supplierForm, setSupplierForm] = useState({
    name: '', category: '', location: '', capabilities: '', notes: '', risks: '', tags: '', relationshipScore: 60
  });
  const [opportunityForm, setOpportunityForm] = useState({ title: '', text: '', linkedCategorySnapshotId: '', linkedSupplierIds: '' });
  const [opportunityFile, setOpportunityFile] = useState(null);

  const [analysisByTab, setAnalysisByTab] = useState({
    'category-intelligence': null,
    'supplier-intelligence': null,
    'opportunity-intelligence': null
  });

  const activeTabConfig = useMemo(() => TAB_LOOKUP[activeTab], [activeTab]);

  useEffect(() => {
    if (!activeTabConfig) {
      console.warn(`[Intelligence] Unknown tab id "${activeTab}". Falling back to category-intelligence.`);
      setActiveTab('category-intelligence');
    }
  }, [activeTab, activeTabConfig]);

  const loadTabData = useCallback(async (tabId, { force = false } = {}) => {
    const config = TAB_LOOKUP[tabId];
    if (!config?.load || !config?.component) {
      console.warn(`[Intelligence] Missing mapping for tab "${tabId}". Check INTELLIGENCE_TABS config.`);
      return;
    }

    if (!force && tabState[tabId]?.hasLoaded) {
      return;
    }

    setTabState((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId], loading: true, error: '' }
    }));

    try {
      const rawPayload = await config.load();
      const mapped = typeof config.mapResponse === 'function' ? config.mapResponse(rawPayload) : rawPayload;
      setTabState((prev) => ({
        ...prev,
        [tabId]: { loading: false, error: '', hasLoaded: true, data: mapped }
      }));
    } catch (error) {
      setTabState((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          loading: false,
          error: safeMessage(error, `Failed to load ${config.label}.`),
          hasLoaded: true
        }
      }));
    }
  }, [tabState]);

  useEffect(() => {
    if (activeTabConfig) {
      loadTabData(activeTabConfig.id);
    }
  }, [activeTabConfig, loadTabData]);

  const actions = useMemo(() => ({
    analyzeCategory: async () => {
      const res = await api.post('/category-intelligence/analyze', categoryForm);
      setAnalysisByTab((prev) => ({ ...prev, 'category-intelligence': res.data }));
    },
    saveCategory: async () => {
      const output = analysisByTab['category-intelligence']?.output;
      if (!output) return;
      await api.post('/category-intelligence/save', { ...categoryForm, output });
      await loadTabData('category-intelligence', { force: true });
    },
    createSupplier: async () => {
      await api.post('/supplier-intelligence', {
        ...supplierForm,
        capabilities: supplierForm.capabilities.split(',').map((x) => x.trim()).filter(Boolean),
        risks: supplierForm.risks.split(',').map((x) => x.trim()).filter(Boolean),
        tags: supplierForm.tags.split(',').map((x) => x.trim()).filter(Boolean)
      });
      await loadTabData('supplier-intelligence', { force: true });
    },
    analyzeSupplier: async (supplierId) => {
      const res = await api.post(`/supplier-intelligence/${supplierId}/analyze`, {});
      setAnalysisByTab((prev) => ({ ...prev, 'supplier-intelligence': res.data }));
    },
    analyzeOpportunity: async () => {
      const data = new FormData();
      data.append('title', opportunityForm.title);
      data.append('text', opportunityForm.text);
      if (opportunityFile) data.append('file', opportunityFile);
      const res = await api.post('/opportunity-intelligence/analyze', data);
      setAnalysisByTab((prev) => ({ ...prev, 'opportunity-intelligence': res.data }));
    },
    saveOpportunity: async () => {
      const output = analysisByTab['opportunity-intelligence']?.output;
      if (!output) return;
      await api.post('/opportunity-intelligence/save', {
        title: opportunityForm.title,
        linkedCategorySnapshotId: opportunityForm.linkedCategorySnapshotId || null,
        linkedSupplierIds: opportunityForm.linkedSupplierIds
          ? opportunityForm.linkedSupplierIds.split(',').map((x) => x.trim()).filter(Boolean)
          : [],
        output
      });
    }
  }), [analysisByTab, categoryForm, supplierForm, opportunityFile, opportunityForm, loadTabData]);

  return (
    <div>
      <header className="intelligence-header card">
        <h1>Intelligence Workspace</h1>
        <p className="muted">Each intelligence category runs independent fetch, transform, and rendering logic.</p>

        <div className="intelligence-tabs" role="tablist" aria-label="Intelligence categories">
          {INTELLIGENCE_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeTab}
              className={`intelligence-tab-btn ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTabConfig ? (
        <section key={activeTabConfig.id} className="card" role="tabpanel" aria-labelledby={activeTabConfig.id}>
          <h2>{activeTabConfig.label}</h2>
          <p className="muted">{activeTabConfig.description}</p>

          {tabState[activeTabConfig.id]?.loading ? (
            <p>Loading {activeTabConfig.label.toLowerCase()}…</p>
          ) : tabState[activeTabConfig.id]?.error ? (
            <div className="intelligence-error">{tabState[activeTabConfig.id].error}</div>
          ) : (
            <activeTabConfig.component
              tabData={tabState[activeTabConfig.id]?.data}
              tabAnalysis={analysisByTab[activeTabConfig.id]}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              supplierForm={supplierForm}
              setSupplierForm={setSupplierForm}
              opportunityForm={opportunityForm}
              setOpportunityForm={setOpportunityForm}
              opportunityFile={opportunityFile}
              setOpportunityFile={setOpportunityFile}
              actions={actions}
            />
          )}
        </section>
      ) : null}
    </div>
  );
}

function CategoryIntelligenceTab({ tabData, tabAnalysis, categoryForm, setCategoryForm, actions }) {
  const history = Array.isArray(tabData?.history) ? tabData.history : [];
  const output = tabAnalysis?.output;
  return (
    <div>
      <div className="card form">
        {['categoryName', 'product', 'notes', 'geography'].map((field) => (
          <input
            key={field}
            placeholder={field}
            value={categoryForm[field]}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
        <div className="row">
          <button className="btn" onClick={actions.analyzeCategory}>Analyze Category</button>
          {output ? <button className="btn ghost" onClick={actions.saveCategory}>Save Snapshot</button> : null}
        </div>
      </div>

      {!output ? (
        <p className="muted">No category intelligence yet. Run analysis to populate this tab.</p>
      ) : (
        <section className="card">
          <h3>{output.summary || 'Analysis complete'}</h3>
          <p><strong>Signals:</strong> {(output.signals || []).join(' | ') || 'None'}</p>
          <p><strong>Risks:</strong> {(output.risks || []).join(' | ') || 'None'}</p>
          <p><strong>Recommendations:</strong> {(output.recommendations || []).join(' | ') || 'None'}</p>
          <p>Confidence: {output.confidenceScore ?? 'N/A'}</p>
        </section>
      )}

      <section className="card">
        <h3>Category History</h3>
        {!history.length ? (
          <p className="muted">No category snapshots found.</p>
        ) : (
          <ul>
            {history.map((entry) => (
              <li key={entry?._id || `${entry?.categoryName}-${entry?.createdAt}`}>
                {entry?.categoryName || 'Category'} - {entry?.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Unknown time'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SupplierIntelligenceTab({ tabData, tabAnalysis, supplierForm, setSupplierForm, actions }) {
  const suppliers = Array.isArray(tabData?.suppliers) ? tabData.suppliers : [];
  const output = tabAnalysis?.output || {};
  return (
    <div>
      <div className="card form">
        {['name', 'category', 'location', 'capabilities', 'notes', 'risks', 'tags'].map((field) => (
          <input
            key={field}
            placeholder={field}
            value={supplierForm[field]}
            onChange={(e) => setSupplierForm((prev) => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
        <button className="btn" onClick={actions.createSupplier}>Add Supplier</button>
      </div>

      {!suppliers.length ? (
        <p className="muted">No suppliers yet. Add a supplier to start supplier intelligence.</p>
      ) : (
        <div className="grid two">
          {suppliers.map((supplier) => (
            <article className="card" key={supplier?._id || supplier?.name}>
              <h3>{supplier?.name || 'Supplier'}</h3>
              <p>{supplier?.category || 'Unknown'} • {supplier?.location || 'Unknown'}</p>
              <p>Relationship Score: {supplier?.relationshipScore ?? 'N/A'}</p>
              <button className="btn ghost" onClick={() => actions.analyzeSupplier(supplier?._id)} disabled={!supplier?._id}>
                Evaluate Supplier
              </button>
            </article>
          ))}
        </div>
      )}

      {tabAnalysis ? (
        <section className="card">
          <h3>{tabAnalysis?.supplier?.name || 'Supplier'} Evaluation</h3>
          <p>Fit Score: {output.fitScore ?? 'N/A'}</p>
          <p>Strengths: {(output.strengths || []).join(' | ') || 'None'}</p>
          <p>Risks: {(output.risks || []).join(' | ') || 'None'}</p>
          <p>Next Action: {output.nextAction || 'Pending recommendation'}</p>
        </section>
      ) : (
        <p className="muted">Select a supplier and run an evaluation to see supplier-specific intelligence.</p>
      )}
    </div>
  );
}

function OpportunityIntelligenceTab({
  tabAnalysis,
  opportunityForm,
  setOpportunityForm,
  opportunityFile,
  setOpportunityFile,
  actions
}) {
  const output = tabAnalysis?.output;
  return (
    <div>
      <div className="card form">
        <input
          placeholder="Opportunity title"
          value={opportunityForm.title}
          onChange={(e) => setOpportunityForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <textarea
          placeholder="Paste RFP text"
          value={opportunityForm.text}
          onChange={(e) => setOpportunityForm((prev) => ({ ...prev, text: e.target.value }))}
        />
        <input type="file" accept="application/pdf" onChange={(e) => setOpportunityFile(e.target.files?.[0] || null)} />
        {opportunityFile ? <small>Selected file: {opportunityFile.name}</small> : null}
        <input
          placeholder="Link category snapshot id (optional)"
          value={opportunityForm.linkedCategorySnapshotId}
          onChange={(e) => setOpportunityForm((prev) => ({ ...prev, linkedCategorySnapshotId: e.target.value }))}
        />
        <input
          placeholder="Link supplier ids comma-separated (optional)"
          value={opportunityForm.linkedSupplierIds}
          onChange={(e) => setOpportunityForm((prev) => ({ ...prev, linkedSupplierIds: e.target.value }))}
        />
        <div className="row">
          <button className="btn" onClick={actions.analyzeOpportunity}>Analyze Opportunity</button>
          {output ? <button className="btn ghost" onClick={actions.saveOpportunity}>Save Analysis</button> : null}
        </div>
      </div>

      {!output ? (
        <p className="muted">No opportunity analysis yet. Submit an RFP text/file to generate intelligence.</p>
      ) : (
        <section className="card">
          <h3>{output.summary || 'Analysis complete'}</h3>
          <p><b>Requirements:</b> {(output.requirements || []).join(' | ') || 'None'}</p>
          <p><b>Compliance Flags:</b> {(output.complianceFlags || []).join(' | ') || 'None'}</p>
          <p><b>Risk Factors:</b> {(output.risks || []).join(' | ') || 'None'}</p>
          <p><b>Effort:</b> {output.effortEstimate || 'N/A'}</p>
          <p><b>Bid/No-Bid:</b> {output.bidRecommendation || 'Pending review'}</p>
          <p><b>Next Steps:</b> {(output.nextSteps || []).join(' | ') || 'None'}</p>
        </section>
      )}
    </div>
  );
}

export { INTELLIGENCE_TABS };

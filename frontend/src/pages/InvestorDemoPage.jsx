import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const roles = ['CEO', 'Procurement Director', 'Category Manager', 'Sourcing Manager', 'Buyer', 'Purchasing Assistant'];

function roleCards(role, data) {
  const k = data?.kpis || {};
  const shared = {
    CEO: [
      ['Total spend under review', `$${k.totalSpendUnderReview?.toLocaleString() || 0}`],
      ['Estimated margin leakage', `$${k.estimatedMarginLeakage?.toLocaleString() || 0}`],
      ['Supplier risk exposure', `${k.supplierRiskExposure || 0}%`],
      ['Open opportunity value', `$${k.openOpportunityValue?.toLocaleString() || 0}`]
    ],
    'Procurement Director': [
      ['Supplier scorecards', `${data?.suppliers?.length || 0} active`], ['Buyer workload indicators', '3 overloaded queues'], ['Open sourcing actions', '12'], ['Category savings opportunities', '$610K']
    ],
    'Category Manager': [
      ['Category spend concentration', `${data?.categories?.[0]?.categoryName || 'MRO'} lead category`], ['Supplier consolidation opportunities', '4'], ['Price variance alerts', '7'], ['Suggested RFQ/RFP events', '5']
    ],
    'Sourcing Manager': [
      ['RFP analysis queue', '6 active'], ['Bid/no-bid scoring', '74 avg'], ['Compliance checklist', '92% complete'], ['Supplier shortlist', '3 per event']
    ],
    Buyer: [
      ['PO/blanket PO builder', 'Ready'], ['Spreadsheet ingestion', 'Supports CSV/XLS/XLSX'], ['Validation issues', '9 flagged'], ['ERP adapter preview', 'SAP/Oracle/Infor/Dynamics']
    ],
    'Purchasing Assistant': [
      ['Upload queue', '2 pending'], ['Missing column warnings', '3'], ['Duplicate part/vendor detection', '5 pairs'], ['Ready for buyer review', '87 lines']
    ]
  };
  return shared[role] || [];
}

export default function InvestorDemoPage() {
  const [demo, setDemo] = useState(null);
  const [role, setRole] = useState('CEO');

  useEffect(() => {
    api.get('/api/investor-demo/summary').then(({ data }) => setDemo(data));
  }, []);

  const cards = useMemo(() => roleCards(role, demo), [role, demo]);

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Investor Demo Mode</h1>
      <p><strong>Story:</strong> {demo?.narrative}</p>
      <p>{demo?.disclaimer}</p>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {roles.map((entry) => <button key={entry} className={`btn ${entry === role ? '' : 'ghost'}`} onClick={() => setRole(entry)}>{entry}</button>)}
      </div>

      <section className="grid four" style={{ marginTop: '1rem' }}>
        {cards.map(([label, value]) => (
          <article className="card" key={label}><p className="metric-label">{label}</p><h3>{value}</h3></article>
        ))}
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Top 5 margin leak alerts</h3>
        <ul>
          <li>Industrial Router sourced at +25% premium from secondary supplier.</li>
          <li>Negative margin detected on Pressure Sensor line.</li>
          <li>Expedite purchases increased within IT Infrastructure category.</li>
          <li>Duplicate purchases on hex bolts across two suppliers.</li>
          <li>Tail spend fragmentation across low-volume MRO vendors.</li>
        </ul>
        <h3>Top 5 supplier/category actions</h3>
        <ul>
          <li>Launch RFQ for routers with diversified shortlist.</li>
          <li>Consolidate MRO bolts with preferred price bands.</li>
          <li>Introduce alternate electromechanical suppliers.</li>
          <li>Enable blanket PO grouping for recurring buys.</li>
          <li>Route compliance-sensitive RFPs to sourcing manager queue.</li>
        </ul>
        <button className="btn">Board-style executive summary export</button>
      </section>

      <div className="row" style={{ marginTop: '1rem', gap: 8, flexWrap: 'wrap' }}>
        <Link className="btn" to="/report-center">Generate Executive Report</Link>
        <Link className="btn ghost" to="/erp-connector-center">View ERP Connector Center</Link>
        <Link className="btn ghost" to="/data-boundary">Data Boundary & Clean Room</Link>
      </div>
    </main>
  );
}

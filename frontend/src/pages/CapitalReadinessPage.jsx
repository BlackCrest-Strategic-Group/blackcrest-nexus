import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const fundingOptions = [
  {
    name: 'PO Financing',
    bestFor: 'Large customer orders where materials must be purchased before payment is received.',
    signal: 'Open purchase commitments, customer demand, supplier deposits, or contract performance pressure.'
  },
  {
    name: 'Invoice Factoring',
    bestFor: 'Businesses with completed work or shipped goods waiting on customer payment.',
    signal: 'AR aging, slow-paying customers, cash conversion delays, or large receivables.'
  },
  {
    name: 'Inventory Financing',
    bestFor: 'Companies that need to buy or hold inventory before sales or production catches up.',
    signal: 'Inventory exposure, long lead-time suppliers, seasonal demand, or stocking requirements.'
  },
  {
    name: 'Equipment Financing',
    bestFor: 'Operational capacity constraints that require machinery, vehicles, tools, or production equipment.',
    signal: 'Capacity bottlenecks, production delays, outsourcing costs, or new contract requirements.'
  },
  {
    name: 'Working Capital Line',
    bestFor: 'Recurring cash pressure caused by timing gaps between purchasing, production, delivery, and customer payment.',
    signal: 'Supplier risk, open POs, late receipts, margin leakage, or frequent short-term cash gaps.'
  },
  {
    name: 'GovCon Performance Funding',
    bestFor: 'Defense or government contractors that need capital to perform on awarded contracts or large orders.',
    signal: 'Awarded contract, material requirements, supplier lead times, and delayed government payment cycles.'
  }
];

const requiredDocs = [
  'Profit and loss statement',
  'Balance sheet',
  'AR aging report',
  'AP aging report',
  'Bank statements',
  'Customer purchase orders or contracts',
  'Supplier quotes',
  'Inventory report',
  'Tax returns',
  'Debt schedule'
];

function dollars(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function fundingRecommendation({ openPO, receivables, inventory, marginLeakage, awardedContract, equipmentNeed }) {
  const scores = fundingOptions.map((option) => ({ ...option, score: 0, reasons: [] }));
  const add = (name, points, reason) => {
    const option = scores.find((entry) => entry.name === name);
    if (option) {
      option.score += points;
      option.reasons.push(reason);
    }
  };

  if (openPO > 100000) {
    add('PO Financing', 32, 'Large open purchase commitments indicate a material funding need before revenue conversion.');
    add('Working Capital Line', 12, 'Open procurement commitments can pressure near-term cash.');
  }
  if (receivables > 100000) {
    add('Invoice Factoring', 34, 'Receivables create a cash timing gap after shipment or completed work.');
    add('Working Capital Line', 14, 'Receivables pressure recurring operating liquidity.');
  }
  if (inventory > 100000) {
    add('Inventory Financing', 34, 'Inventory exposure indicates capital tied up in stock or long-lead materials.');
    add('Working Capital Line', 10, 'Inventory carrying cost contributes to working capital pressure.');
  }
  if (marginLeakage > 50000) {
    add('Working Capital Line', 24, 'Margin leakage reduces operating cushion and increases cash risk.');
    add('PO Financing', 8, 'Low margins make upfront purchase commitments more dangerous.');
  }
  if (awardedContract > 100000) {
    add('GovCon Performance Funding', 42, 'Awarded contract value suggests capital may be needed to perform before payment.');
    add('PO Financing', 16, 'Contract-linked materials may require upfront supplier funding.');
  }
  if (equipmentNeed > 25000) {
    add('Equipment Financing', 42, 'Equipment need points to a capacity or production constraint.');
  }

  return scores.sort((a, b) => b.score - a.score);
}

export default function CapitalReadinessPage() {
  const [openPO, setOpenPO] = useState(325000);
  const [receivables, setReceivables] = useState(480000);
  const [inventory, setInventory] = useState(210000);
  const [marginLeakage, setMarginLeakage] = useState(74000);
  const [awardedContract, setAwardedContract] = useState(650000);
  const [equipmentNeed, setEquipmentNeed] = useState(85000);

  const totalPressure = openPO + receivables + inventory + marginLeakage + awardedContract * 0.35 + equipmentNeed;
  const pressureScore = Math.min(100, Math.round(totalPressure / 20000));
  const recommendations = useMemo(() => fundingRecommendation({ openPO, receivables, inventory, marginLeakage, awardedContract, equipmentNeed }), [openPO, receivables, inventory, marginLeakage, awardedContract, equipmentNeed]);
  const top = recommendations[0];

  const memo = `Capital Readiness Memo: BlackCrest identified a working-capital pressure score of ${pressureScore}/100. The strongest funding fit is ${top.name}. Primary reason: ${top.reasons[0] || top.bestFor}`;

  const downloadMemo = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      workingCapitalPressureScore: pressureScore,
      inputs: { openPO, receivables, inventory, marginLeakage, awardedContract, equipmentNeed },
      recommendedFunding: recommendations.slice(0, 3).map(({ name, score, reasons }) => ({ name, score, reasons })),
      requiredDocs,
      memo
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blackcrest-capital-readiness-memo.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="landing-page capital-readiness-page">
      <SeoHead title="Capital Readiness Engine | BlackCrest" description="Procurement-driven funding intelligence for working capital, PO financing, invoice factoring, inventory financing, equipment funding, and GovCon performance funding." canonicalPath="/capital-readiness" />

      <section className="card hero">
        <p className="eyebrow">Capital Readiness Engine</p>
        <h1>Find the procurement risk. Understand the cash pressure. Fund the action.</h1>
        <p>BlackCrest connects procurement intelligence to capital readiness so businesses can see when supplier delays, margin leakage, inventory exposure, purchase commitments, or awarded contracts create a funding need.</p>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <button className="btn" onClick={downloadMemo}>Download Capital Memo</button>
          <Link className="btn ghost" to="/strategic-demo">Strategic Demo</Link>
          <Link className="btn ghost" to="/acquisition-room">Acquisition Room</Link>
        </div>
      </section>

      <section className="grid three">
        <article className="card glass-panel"><p className="metric-label">Working-capital pressure</p><h3>{pressureScore}/100</h3></article>
        <article className="card glass-panel"><p className="metric-label">Top funding fit</p><h3>{top.name}</h3></article>
        <article className="card glass-panel"><p className="metric-label">Capital pressure detected</p><h3>{dollars(totalPressure)}</h3></article>
      </section>

      <section className="grid two">
        <article className="card glass-panel">
          <h2>Capital pressure inputs</h2>
          <div className="grid two">
            <label className="card nested">Open purchase commitments<input type="number" value={openPO} onChange={(event) => setOpenPO(Number(event.target.value || 0))} /></label>
            <label className="card nested">Accounts receivable exposure<input type="number" value={receivables} onChange={(event) => setReceivables(Number(event.target.value || 0))} /></label>
            <label className="card nested">Inventory exposure<input type="number" value={inventory} onChange={(event) => setInventory(Number(event.target.value || 0))} /></label>
            <label className="card nested">Estimated margin leakage<input type="number" value={marginLeakage} onChange={(event) => setMarginLeakage(Number(event.target.value || 0))} /></label>
            <label className="card nested">Awarded contract / order value<input type="number" value={awardedContract} onChange={(event) => setAwardedContract(Number(event.target.value || 0))} /></label>
            <label className="card nested">Equipment or capacity need<input type="number" value={equipmentNeed} onChange={(event) => setEquipmentNeed(Number(event.target.value || 0))} /></label>
          </div>
        </article>

        <article className="card glass-panel">
          <h2>Recommended funding paths</h2>
          {recommendations.slice(0, 4).map((option) => (
            <article className="card nested" key={option.name}>
              <h3>{option.name} <span className={`severity-chip ${option.score >= 40 ? 'critical' : option.score >= 25 ? 'high' : 'medium'}`}>{option.score}</span></h3>
              <p>{option.bestFor}</p>
              <ul className="timeline-list">
                {(option.reasons.length ? option.reasons : [option.signal]).slice(0, 2).map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            </article>
          ))}
        </article>
      </section>

      <section className="grid two">
        <article className="card glass-panel">
          <h2>Capital readiness checklist</h2>
          <p>BlackCrest can turn procurement findings into a lender-ready evidence packet.</p>
          <ul className="timeline-list">{requiredDocs.map((doc) => <li key={doc}>{doc}</li>)}</ul>
        </article>
        <article className="card glass-panel">
          <h2>Executive funding memo</h2>
          <p>{memo}</p>
          <p>This does not approve financing. It organizes operational evidence so a business owner, CFO, lender, broker, or implementation partner can understand the funding use case faster.</p>
        </article>
      </section>

      <section className="card glass-panel">
        <h2>Why this increases platform value</h2>
        <p>Procurement intelligence shows the problem. Capital Readiness shows the action path. This gives BlackCrest a second monetization lane through financing partners, implementation firms, advisory services, referral relationships, and enterprise customers that need operational intelligence tied to cash decisions.</p>
      </section>
    </main>
  );
}

import React, { useMemo, useState } from 'react';

const proposalStatuses = ['Draft', 'Submitted', 'Missing Data', 'Under Review', 'Approved', 'Escalated', 'Completed'];

const emptyRow = {
  partNumber: '',
  description: '',
  quantity: 1,
  cost: 0,
  markup: 0.2,
  unitPrice: 0,
  totalPrice: 0,
  mfgLeadTime: 0,
  deliveryLeadTime: 0,
  assumptions: '',
  exceptions: '',
  supplierNotes: '',
  supplierName: ''
};

const defaultThresholds = {
  leadTimeWarning: 45,
  leadTimeCritical: 75,
  markupWarning: 0.35,
  markupCritical: 0.5,
  supplierConcentrationWarning: 0.5,
  supplierConcentrationCritical: 0.7
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function riskColor(score) {
  if (score >= 80) return 'border-red-500/70 bg-red-900/20';
  if (score >= 55) return 'border-amber-500/70 bg-amber-900/20';
  return 'border-emerald-500/70 bg-emerald-900/20';
}

export default function ProposalGeneratorPage() {
  const [lineItems, setLineItems] = useState([]);
  const [proposalMeta, setProposalMeta] = useState({
    proposalName: 'FFP Proposal',
    buyer: '',
    supplier: '',
    status: 'Draft'
  });
  const [activeRiskCard, setActiveRiskCard] = useState(null);
  const [auditTrail, setAuditTrail] = useState([{ at: new Date().toISOString(), action: 'Proposal session initialized', actor: 'System' }]);

  const updateItem = (idx, key, value) => {
    setLineItems((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const appendAudit = (action, actor = 'Current User') => {
    setAuditTrail((prev) => [{ at: new Date().toISOString(), action, actor }, ...prev].slice(0, 30));
  };

  const addLine = () => {
    setLineItems((prev) => [...prev, { ...emptyRow }]);
    appendAudit('Manual line item added');
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).slice(1).map((line) => {
      const [partNumber, description, quantity, cost, markup, mfgLeadTime, deliveryLeadTime, supplierName] = line.split(',');
      const qtyNum = toNumber(quantity);
      const costNum = toNumber(cost);
      const markupNum = toNumber(markup);
      const unitPrice = costNum * (1 + markupNum);
      return {
        ...emptyRow,
        partNumber: (partNumber || '').trim(),
        description: (description || '').trim(),
        quantity: qtyNum,
        cost: costNum,
        markup: markupNum,
        unitPrice,
        totalPrice: qtyNum * unitPrice,
        mfgLeadTime: toNumber(mfgLeadTime),
        deliveryLeadTime: toNumber(deliveryLeadTime),
        supplierName: (supplierName || '').trim()
      };
    });
    setLineItems(rows);
    appendAudit(`Uploaded ingestion processed (${file.name})`);
  };

  const totals = useMemo(() => {
    const normalized = lineItems.map((item) => {
      const unitPrice = toNumber(item.cost) * (1 + toNumber(item.markup));
      const totalPrice = toNumber(item.quantity) * unitPrice;
      const leadTime = toNumber(item.mfgLeadTime) + toNumber(item.deliveryLeadTime);
      return { ...item, unitPrice, totalPrice, leadTime };
    });

    const totalCost = normalized.reduce((sum, item) => sum + toNumber(item.cost) * toNumber(item.quantity), 0);
    const totalPrice = normalized.reduce((sum, item) => sum + item.totalPrice, 0);
    const marginEstimate = totalPrice ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    return {
      normalized,
      totalCost,
      totalPrice,
      marginEstimate,
      longestLeadTime: normalized.reduce((max, item) => Math.max(max, item.leadTime), 0)
    };
  }, [lineItems]);

  const deepScan = useMemo(() => {
    const suppliers = totals.normalized.reduce((acc, item) => {
      const key = item.supplierName || 'Unknown Supplier';
      acc[key] = (acc[key] || 0) + item.totalPrice;
      return acc;
    }, {});
    const topSupplierShare = totals.totalPrice ? Math.max(...Object.values(suppliers), 0) / totals.totalPrice : 0;

    const itemAnalyses = totals.normalized.map((item) => {
      const missingData = ['partNumber', 'description', 'assumptions', 'exceptions'].filter((field) => !String(item[field] || '').trim());
      const leadTime = item.leadTime;
      const leadRisk = leadTime >= defaultThresholds.leadTimeCritical ? 'High' : leadTime >= defaultThresholds.leadTimeWarning ? 'Medium' : 'Low';
      const markupRisk = item.markup >= defaultThresholds.markupCritical ? 'Critical' : item.markup >= defaultThresholds.markupWarning ? 'Watch' : 'Normal';
      const score = Math.min(100,
        (leadRisk === 'High' ? 35 : leadRisk === 'Medium' ? 18 : 6)
        + (markupRisk === 'Critical' ? 30 : markupRisk === 'Watch' ? 12 : 5)
        + (missingData.length * 8)
        + (topSupplierShare >= defaultThresholds.supplierConcentrationCritical ? 20 : topSupplierShare >= defaultThresholds.supplierConcentrationWarning ? 10 : 4)
      );

      return {
        ...item,
        score,
        costReasonableness: item.cost > 0 && item.markup < defaultThresholds.markupCritical ? 'In-range' : 'Needs validation',
        leadTimeRisk: leadRisk,
        alternateSourcing: item.supplierName ? `Potential alternates in ${item.description || 'matching category'}` : 'Supplier missing: run marketplace match',
        dependencyRisk: topSupplierShare > 0.7 ? 'Concentrated' : 'Diversified',
        missingDataIndicators: missingData,
        markupAnomalyFlags: markupRisk,
        complianceConcerns: item.exceptions ? 'Exception requires legal review' : 'No immediate compliance blockers',
        contributingFactors: {
          leadTime,
          markup: item.markup,
          supplierShare: topSupplierShare,
          missingFieldCount: missingData.length
        }
      };
    });

    return {
      itemAnalyses,
      topSupplierShare,
      portfolioScore: itemAnalyses.length ? Math.round(itemAnalyses.reduce((sum, i) => sum + i.score, 0) / itemAnalyses.length) : 0,
      riskCounts: {
        high: itemAnalyses.filter((i) => i.score >= 80).length,
        medium: itemAnalyses.filter((i) => i.score >= 55 && i.score < 80).length,
        low: itemAnalyses.filter((i) => i.score < 55).length
      }
    };
  }, [totals]);

  const exportJson = (name, payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    appendAudit(`${name} exported`, 'Export Service');
  };

  return <div className="p-6 text-slate-100 space-y-6">
    <h1 className="text-3xl font-semibold">ProposalForge + DeepScan</h1>

    <section className="grid lg:grid-cols-4 gap-3 bg-slate-900 border border-slate-700 p-4 rounded-2xl">
      <input className="bg-slate-950 rounded p-2" value={proposalMeta.proposalName} onChange={(e) => setProposalMeta((m) => ({ ...m, proposalName: e.target.value }))} placeholder="Proposal name" />
      <input className="bg-slate-950 rounded p-2" value={proposalMeta.buyer} onChange={(e) => setProposalMeta((m) => ({ ...m, buyer: e.target.value }))} placeholder="Buyer" />
      <input className="bg-slate-950 rounded p-2" value={proposalMeta.supplier} onChange={(e) => setProposalMeta((m) => ({ ...m, supplier: e.target.value }))} placeholder="Primary supplier" />
      <select className="bg-slate-950 rounded p-2" value={proposalMeta.status} onChange={(e) => { setProposalMeta((m) => ({ ...m, status: e.target.value })); appendAudit(`Proposal status changed to ${e.target.value}`, 'Approver'); }}>
        {proposalStatuses.map((status) => <option key={status}>{status}</option>)}
      </select>
    </section>

    <section className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3">
      <h2 className="text-xl font-medium">Supplier submission workflow</h2>
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded bg-slate-700" onClick={addLine}>+ Manual entry</button>
        <label className="px-3 py-2 rounded bg-cyan-700 cursor-pointer">Upload ingestion CSV<input type="file" className="hidden" accept=".csv" onChange={onUpload} /></label>
      </div>
      <div className="overflow-auto border border-slate-700 rounded-xl">
        <table className="min-w-[1600px] w-full text-sm">
          <thead className="bg-slate-800"><tr>{Object.keys(emptyRow).map((k) => <th key={k} className="p-2 text-left">{k}</th>)}</tr></thead>
          <tbody>
            {lineItems.map((row, idx) => <tr key={`${row.partNumber}-${idx}`} className="border-t border-slate-700">
              {Object.keys(emptyRow).map((field) => <td key={field} className="p-1"><input value={row[field]} onChange={(e) => updateItem(idx, field, ['partNumber', 'description', 'assumptions', 'exceptions', 'supplierNotes', 'supplierName'].includes(field) ? e.target.value : toNumber(e.target.value))} className="w-full bg-slate-950 rounded p-1" /></td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <section className="grid lg:grid-cols-2 gap-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-2">
        <h3 className="text-lg font-medium">Proposal summary</h3>
        <p>Pricing waterfall: Cost ${totals.totalCost.toFixed(2)} → Sell ${totals.totalPrice.toFixed(2)}</p>
        <p>Cost breakdown: {totals.normalized.length} items with longest lead time {totals.longestLeadTime} days</p>
        <p>Margin estimate: {totals.marginEstimate.toFixed(1)}%</p>
        <p>Lead-time summary: Manufacturing + delivery blended by line item.</p>
        <p>Executive summary: Proposal is in <strong>{proposalMeta.status}</strong> with portfolio risk score <strong>{deepScan.portfolioScore}</strong>.</p>
      </div>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-2">
        <h3 className="text-lg font-medium">DeepScan portfolio signal</h3>
        <p>High risk items: {deepScan.riskCounts.high}</p>
        <p>Medium risk items: {deepScan.riskCounts.medium}</p>
        <p>Low risk items: {deepScan.riskCounts.low}</p>
        <p>Supplier concentration: {(deepScan.topSupplierShare * 100).toFixed(1)}%</p>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-medium">Drill-down risk cards</h2>
      <div className="grid lg:grid-cols-3 gap-3">
        {deepScan.itemAnalyses.map((item, idx) => <button key={`${item.partNumber}-${idx}`} onClick={() => setActiveRiskCard(item)} className={`text-left border rounded-xl p-3 ${riskColor(item.score)}`}>
          <p className="font-semibold">{item.partNumber || `Line ${idx + 1}`}</p>
          <p className="text-sm">Score: {item.score}</p>
          <p className="text-xs opacity-80">Markup anomaly: {item.markupAnomalyFlags}</p>
        </button>)}
      </div>
      {activeRiskCard && <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-2">
        <h4 className="text-lg font-semibold">Risk detail • {activeRiskCard.partNumber || 'Unnamed Item'}</h4>
        <p>Cost reasonableness: {activeRiskCard.costReasonableness}</p>
        <p>Lead-time risk: {activeRiskCard.leadTimeRisk}</p>
        <p>Alternate sourcing opportunities: {activeRiskCard.alternateSourcing}</p>
        <p>Supplier dependency risk: {activeRiskCard.dependencyRisk}</p>
        <p>Missing data indicators: {activeRiskCard.missingDataIndicators.join(', ') || 'None'}</p>
        <p>Compliance concerns: {activeRiskCard.complianceConcerns}</p>
        <p>Contributing factors: lead-time {activeRiskCard.contributingFactors.leadTime} days, markup {(activeRiskCard.contributingFactors.markup * 100).toFixed(1)}%, supplier concentration {(activeRiskCard.contributingFactors.supplierShare * 100).toFixed(1)}%, missing fields {activeRiskCard.contributingFactors.missingFieldCount}.</p>
      </div>}
    </section>

    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-2">
      <h2 className="text-xl font-medium">Marketplace connections</h2>
      <p>DeepScan suggestions include alternate suppliers, marketplace matches, and category recommendations based on line-item descriptions.</p>
      {deepScan.itemAnalyses.slice(0, 5).map((item, idx) => <p key={idx} className="text-sm">• {item.partNumber || `Item ${idx + 1}`}: {item.alternateSourcing}</p>)}
    </section>

    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
      <h2 className="text-xl font-medium">Exports · Audit · Security</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => exportJson('proposal-export.json', { proposalMeta, lineItems, totals })} className="px-3 py-2 rounded bg-indigo-600">Proposal export</button>
        <button onClick={() => exportJson('executive-summary.json', { proposalMeta, summary: { marginEstimate: totals.marginEstimate, leadTime: totals.longestLeadTime, status: proposalMeta.status, portfolioRisk: deepScan.portfolioScore } })} className="px-3 py-2 rounded bg-cyan-700">Executive summary export</button>
        <button onClick={() => window.print()} className="px-3 py-2 rounded bg-slate-700">PDF export</button>
      </div>
      <p className="text-sm">Permissions + approval tracking are enforced through status transitions and event-level audit logs below.</p>
      <div className="max-h-36 overflow-auto text-xs bg-slate-950 rounded p-2">
        {auditTrail.map((event, idx) => <p key={idx}>{new Date(event.at).toLocaleString()} · {event.actor} · {event.action}</p>)}
      </div>
    </section>
  </div>;
}

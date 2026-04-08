import React, { useState, useEffect, useRef } from "react";
import { proposalsApi } from "../utils/api.js";
import { getUser } from "../utils/auth.js";

const COST_CATEGORIES = ["labor", "materials", "subcontractors", "travel", "overhead", "other"];

const STATUS_BADGE = {
  draft: "bg-slate-100 text-slate-600",
  review: "bg-amber-100 text-amber-700",
  final: "bg-blue-100 text-blue-700",
  submitted: "bg-emerald-100 text-emerald-700"
};

/* ── Costing Sheet ── */
function CostingSheet({ costLineItems, onChange, profitMarginPct, onMarginChange }) {
  const addLine = () =>
    onChange([
      ...costLineItems,
      { description: "", category: "labor", quantity: 1, unitPrice: 0, total: 0 }
    ]);

  const updateLine = (idx, field, value) => {
    const updated = costLineItems.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        next.total = Number(next.quantity || 0) * Number(next.unitPrice || 0);
      }
      return next;
    });
    onChange(updated);
  };

  const removeLine = (idx) => onChange(costLineItems.filter((_, i) => i !== idx));

  const totalCost = costLineItems.reduce((sum, l) => sum + (l.total || 0), 0);
  const margin = Number(profitMarginPct || 0);
  const totalPrice = totalCost * (1 + margin / 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Cost Breakdown</h3>
        <button type="button" onClick={addLine} className="btn-secondary text-xs py-1.5 px-3">
          + Add Line
        </button>
      </div>

      {costLineItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-2 font-semibold text-slate-600 border border-slate-200">Description</th>
                <th className="text-left p-2 font-semibold text-slate-600 border border-slate-200 w-28">Category</th>
                <th className="text-right p-2 font-semibold text-slate-600 border border-slate-200 w-16">Qty</th>
                <th className="text-right p-2 font-semibold text-slate-600 border border-slate-200 w-24">Unit Price</th>
                <th className="text-right p-2 font-semibold text-slate-600 border border-slate-200 w-24">Total</th>
                <th className="p-2 border border-slate-200 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {costLineItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-1 border border-slate-200">
                    <input
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-300 rounded"
                      value={item.description}
                      onChange={(e) => updateLine(idx, "description", e.target.value)}
                      placeholder="e.g. Senior Software Engineer (1 FTE)"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <select
                      className="w-full text-xs bg-transparent border-0 focus:outline-none"
                      value={item.category}
                      onChange={(e) => updateLine(idx, "category", e.target.value)}
                    >
                      {COST_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      className="w-full px-2 py-1 text-xs text-right border-0 bg-transparent focus:outline-none"
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateLine(idx, "quantity", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      className="w-full px-2 py-1 text-xs text-right border-0 bg-transparent focus:outline-none"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLine(idx, "unitPrice", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2 border border-slate-200 text-right font-mono">
                    ${(item.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-slate-200 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-600 font-bold"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Total Cost:</span>
          <span className="font-mono font-semibold">${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Profit Margin:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              className="w-16 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
              value={profitMarginPct}
              onChange={(e) => onMarginChange(Number(e.target.value))}
            />
            <span className="text-slate-500 text-xs">%</span>
          </div>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-300">
          <span className="font-semibold text-slate-800">Total Price to Government:</span>
          <span className="font-mono font-bold text-emerald-700">${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section Editor ── */
function SectionEditor({ sections, onChange }) {
  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono bg-navy-50 text-navy-700 px-2 py-0.5 rounded font-semibold">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
          </div>
          <textarea
            className="w-full text-sm text-slate-700 leading-relaxed border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-y"
            rows={6}
            value={section.content}
            onChange={(e) =>
              onChange(sections.map((s, i) => i === idx ? { ...s, content: e.target.value } : s))
            }
          />
        </div>
      ))}
    </div>
  );
}

/* ── Proposal Print View ── */
function ProposalPrintView({ proposal }) {
  const printRef = useRef(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${proposal.title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #1a1a1a; background: #fff; padding: 0; }
          .page { max-width: 8.5in; margin: 0 auto; padding: 1in 1.25in; min-height: 11in; }
          .letterhead { border-bottom: 3px solid #14243a; padding-bottom: 16pt; margin-bottom: 24pt; display: flex; justify-content: space-between; align-items: flex-end; }
          .company-name { font-size: 18pt; font-weight: bold; color: #14243a; }
          .company-meta { font-size: 9pt; color: #555; text-align: right; }
          h1 { font-size: 16pt; color: #14243a; margin-bottom: 4pt; }
          .meta-table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
          .meta-table td { padding: 4pt 8pt; border: 1pt solid #ddd; }
          .meta-table td:first-child { font-weight: bold; background: #f5f7fa; width: 35%; }
          .section { margin-top: 20pt; page-break-inside: avoid; }
          .section-title { font-size: 13pt; font-weight: bold; color: #14243a; border-bottom: 1pt solid #14243a; padding-bottom: 4pt; margin-bottom: 8pt; }
          .section-content { font-size: 11pt; line-height: 1.6; white-space: pre-wrap; }
          .cost-table { width: 100%; border-collapse: collapse; margin-top: 8pt; font-size: 10pt; }
          .cost-table th { background: #14243a; color: white; padding: 6pt 8pt; text-align: left; }
          .cost-table td { padding: 5pt 8pt; border-bottom: 1pt solid #eee; }
          .cost-table .total-row { font-weight: bold; background: #f5f7fa; }
          .cost-table .price-row { font-weight: bold; background: #e8f5e9; color: #1b5e20; }
          .footer { margin-top: 32pt; padding-top: 8pt; border-top: 1pt solid #ddd; font-size: 9pt; color: #777; text-align: center; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 0.75in 1in; }
          }
        </style>
      </head>
      <body><div class="page">${content}</div></body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  }

  const totalCost = (proposal.costLineItems || []).reduce((s, l) => s + (l.total || 0), 0);
  const margin = proposal.profitMarginPct || 10;
  const totalPrice = totalCost * (1 + margin / 100);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save as PDF
        </button>
      </div>

      <div ref={printRef} style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>
        {/* Letterhead */}
        <div style={{ borderBottom: "3px solid #14243a", paddingBottom: 16, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#14243a" }}>
              {proposal.companyName || "Your Company Name"}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
              {proposal.companyAddress && <div>{proposal.companyAddress}</div>}
              {proposal.companyPhone && <div>Tel: {proposal.companyPhone}</div>}
              {proposal.companyEmail && <div>Email: {proposal.companyEmail}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>
            {proposal.companyUei && <div>UEI: {proposal.companyUei}</div>}
            {proposal.companyCage && <div>CAGE: {proposal.companyCage}</div>}
            <div>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>

        {/* Title Block */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: "bold", color: "#14243a", marginBottom: 4 }}>
            {proposal.title}
          </h1>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <tbody>
              {[
                ["Solicitation", proposal.solicitationNumber],
                ["Agency", proposal.agency],
                ["Due Date", proposal.dueDate],
                ["NAICS Code", proposal.naicsCode],
                ["Set-Aside", proposal.setAside]
              ].filter(([, v]) => v).map(([label, value]) => (
                <tr key={label}>
                  <td style={{ fontWeight: "bold", padding: "3px 8px", border: "1px solid #ddd", background: "#f5f7fa", width: "30%" }}>{label}</td>
                  <td style={{ padding: "3px 8px", border: "1px solid #ddd" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sections */}
        {(proposal.sections || []).map((section, idx) => (
          <div key={idx} style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#14243a", borderBottom: "1px solid #14243a", paddingBottom: 4, marginBottom: 8 }}>
              {idx + 1}. {section.title}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {section.content}
            </div>
          </div>
        ))}

        {/* Cost Table */}
        {(proposal.costLineItems || []).length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#14243a", borderBottom: "1px solid #14243a", paddingBottom: 4, marginBottom: 8 }}>
              {(proposal.sections || []).length + 1}. Price / Cost Summary
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ background: "#14243a", color: "white" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.costLineItems.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "4px 8px" }}>{item.description}</td>
                    <td style={{ padding: "4px 8px", textTransform: "capitalize" }}>{item.category}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{item.quantity}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>${(item.unitPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right", fontFamily: "monospace" }}>${(item.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "bold", background: "#f5f7fa" }}>
                  <td colSpan={4} style={{ padding: "6px 8px", textAlign: "right" }}>Total Cost:</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "monospace" }}>${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ fontWeight: "bold", background: "#e8f5e9", color: "#1b5e20" }}>
                  <td colSpan={4} style={{ padding: "6px 8px", textAlign: "right" }}>Total Price to Government ({margin}% margin):</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "monospace" }}>${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 8, borderTop: "1px solid #ddd", fontSize: 9, color: "#777", textAlign: "center" }}>
          Prepared by {proposal.companyName || "Contractor"} &bull; {new Date().toLocaleDateString()} &bull; GovCon AI Scanner – Non-Classified Use Only
        </div>
      </div>
    </div>
  );
}

/* ── Proposal Detail (Edit + Preview) ── */
function ProposalDetail({ proposal: initialProposal, onBack, onUpdate }) {
  const [proposal, setProposal] = useState(initialProposal);
  const [activeView, setActiveView] = useState("edit"); // "edit" | "preview"
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaveStatus("");
    try {
      const totalCost = (proposal.costLineItems || []).reduce((s, l) => s + (l.total || 0), 0);
      const totalPrice = totalCost * (1 + (proposal.profitMarginPct || 10) / 100);
      const res = await proposalsApi.update(proposal._id, { ...proposal, totalCost, totalPrice });
      setProposal(res.data.proposal);
      onUpdate(res.data.proposal);
      setSaveStatus("✓ Saved");
    } catch {
      setSaveStatus("✗ Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }

  async function handleRegenerate() {
    setGenerating(true);
    setGenError("");
    try {
      const res = await proposalsApi.generate({
        opportunityTitle: proposal.opportunityTitle,
        agency: proposal.agency,
        naicsCode: proposal.naicsCode,
        setAside: proposal.setAside,
        requirementSummary: proposal.requirementSummary,
        companyName: proposal.companyName
      });
      setProposal((p) => ({ ...p, sections: res.data.sections }));
    } catch (err) {
      setGenError(err.response?.data?.error || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          ← All Proposals
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[proposal.status] || "bg-slate-100 text-slate-600"}`}>
            {proposal.status}
          </span>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {[{ id: "edit", label: "Edit" }, { id: "preview", label: "Preview" }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >{label}</button>
            ))}
          </div>
          {saveStatus && (
            <span className={`text-xs font-medium ${saveStatus.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>
              {saveStatus}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {activeView === "preview" ? (
        <div className="card">
          <ProposalPrintView proposal={proposal} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="card space-y-4">
            <h3 className="section-title">Proposal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Proposal Title", key: "title", required: true },
                { label: "Opportunity Title", key: "opportunityTitle" },
                { label: "Solicitation Number", key: "solicitationNumber" },
                { label: "Agency", key: "agency" },
                { label: "Due Date", key: "dueDate" },
                { label: "NAICS Code", key: "naicsCode" },
                { label: "Set-Aside Type", key: "setAside" }
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    className="input"
                    value={proposal[key] || ""}
                    onChange={(e) => setProposal((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="label">Requirement Summary / SOW</label>
                <textarea
                  className="input h-24 resize-y"
                  value={proposal.requirementSummary || ""}
                  onChange={(e) => setProposal((p) => ({ ...p, requirementSummary: e.target.value }))}
                  placeholder="Brief description of requirements…"
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={proposal.status}
                  onChange={(e) => setProposal((p) => ({ ...p, status: e.target.value }))}
                >
                  {["draft", "review", "final", "submitted"].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="card space-y-4">
            <h3 className="section-title">Company Information (Letterhead)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Company Name", key: "companyName" },
                { label: "Address", key: "companyAddress" },
                { label: "Phone", key: "companyPhone" },
                { label: "Email", key: "companyEmail" },
                { label: "UEI", key: "companyUei" },
                { label: "CAGE Code", key: "companyCage" }
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    className="input"
                    value={proposal[key] || ""}
                    onChange={(e) => setProposal((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title">Proposal Sections</h3>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={generating}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {generating ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate with AI
                  </>
                )}
              </button>
            </div>
            {genError && (
              <div className="alert-error text-sm">{genError}</div>
            )}
            {(proposal.sections || []).length > 0 ? (
              <SectionEditor
                sections={proposal.sections}
                onChange={(sections) => setProposal((p) => ({ ...p, sections }))}
              />
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No sections generated yet.</p>
                <button onClick={handleRegenerate} className="btn-primary mt-3 text-sm">
                  Generate with AI
                </button>
              </div>
            )}
          </div>

          {/* Costing */}
          <div className="card">
            <h3 className="section-title mb-4">Costing &amp; Pricing</h3>
            <CostingSheet
              costLineItems={proposal.costLineItems || []}
              onChange={(items) => setProposal((p) => ({ ...p, costLineItems: items }))}
              profitMarginPct={proposal.profitMarginPct ?? 10}
              onMarginChange={(v) => setProposal((p) => ({ ...p, profitMarginPct: v }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── New Proposal Form ── */
function NewProposalForm({ onCreated, onCancel }) {
  const user = getUser();
  const [form, setForm] = useState({
    title: "",
    opportunityTitle: "",
    solicitationNumber: "",
    agency: "",
    dueDate: "",
    naicsCode: "",
    setAside: "",
    requirementSummary: "",
    companyName: user?.company || "",
    companyEmail: user?.email || ""
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Proposal title is required."); return; }
    setError("");

    let sections = [];
    if (form.opportunityTitle || form.requirementSummary) {
      setGenerating(true);
      try {
        const genRes = await proposalsApi.generate({
          opportunityTitle: form.opportunityTitle,
          agency: form.agency,
          naicsCode: form.naicsCode,
          setAside: form.setAside,
          requirementSummary: form.requirementSummary,
          companyName: form.companyName
        });
        sections = genRes.data.sections || [];
      } catch {
        // continue without sections
      } finally {
        setGenerating(false);
      }
    }

    setLoading(true);
    try {
      const res = await proposalsApi.create({ ...form, sections });
      onCreated(res.data.proposal);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create proposal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="card space-y-5 animate-fade-in">
      <div>
        <h2 className="section-title">New Proposal</h2>
        <p className="section-subtitle">Fill in the details and AI will draft your proposal sections automatically.</p>
      </div>

      {error && <div className="alert-error text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Proposal Title <span className="text-red-500">*</span></label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. IT Modernization Proposal for DHS" />
        </div>
        <div>
          <label className="label">Opportunity / Solicitation Title</label>
          <input className="input" value={form.opportunityTitle} onChange={(e) => setForm({ ...form, opportunityTitle: e.target.value })} placeholder="e.g. IT Modernization Services" />
        </div>
        <div>
          <label className="label">Solicitation Number</label>
          <input className="input" value={form.solicitationNumber} onChange={(e) => setForm({ ...form, solicitationNumber: e.target.value })} placeholder="e.g. 70RSAT22Q00000001" />
        </div>
        <div>
          <label className="label">Agency</label>
          <input className="input" value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} placeholder="e.g. Department of Homeland Security" />
        </div>
        <div>
          <label className="label">Response Due Date</label>
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div>
          <label className="label">NAICS Code</label>
          <input className="input" value={form.naicsCode} onChange={(e) => setForm({ ...form, naicsCode: e.target.value })} placeholder="e.g. 541511" />
        </div>
        <div>
          <label className="label">Set-Aside Type</label>
          <input className="input" value={form.setAside} onChange={(e) => setForm({ ...form, setAside: e.target.value })} placeholder="e.g. 8(a), SDVOSB, WOSB, None" />
        </div>
        <div>
          <label className="label">Your Company Name</label>
          <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Federal Solutions LLC" />
        </div>
        <div>
          <label className="label">Company Email</label>
          <input className="input" type="email" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Requirement Summary / Scope</label>
          <textarea
            className="input h-24 resize-y"
            value={form.requirementSummary}
            onChange={(e) => setForm({ ...form, requirementSummary: e.target.value })}
            placeholder="Brief description of requirements and scope of work…"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading || generating} className="btn-primary flex items-center gap-2">
          {(loading || generating) && (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {generating ? "Generating AI Sections…" : loading ? "Creating…" : "Create Proposal"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
      <p className="text-xs text-slate-400">AI will automatically generate Executive Summary, Technical Approach, Management Approach, and other sections based on the information you provide.</p>
    </form>
  );
}

/* ── Main ProposalGenerator Component ── */
export default function ProposalGenerator() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const loadProposals = () => {
    setLoading(true);
    const params = filter !== "all" ? { status: filter } : {};
    proposalsApi
      .list(params)
      .then((res) => setProposals(res.data.proposals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProposals(); }, [filter]);

  async function handleDelete(id) {
    try {
      await proposalsApi.remove(id);
      setProposals((p) => p.filter((pr) => pr._id !== id));
    } catch {}
    setDeleteId(null);
  }

  if (selected) {
    return (
      <ProposalDetail
        proposal={selected}
        onBack={() => { setSelected(null); loadProposals(); }}
        onUpdate={(updated) => {
          setProposals((p) => p.map((pr) => pr._id === updated._id ? updated : pr));
          setSelected(updated);
        }}
      />
    );
  }

  if (showNew) {
    return (
      <NewProposalForm
        onCreated={(proposal) => { setProposals((p) => [proposal, ...p]); setSelected(proposal); setShowNew(false); }}
        onCancel={() => setShowNew(false)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Proposal Generator</h2>
          <p className="text-sm text-slate-500">Create AI-powered GovCon proposals on your company letterhead</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "review", "final", "submitted"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === s
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-navy-300 hover:text-navy-700"
            }`}
          >
            {s === "all" ? "All Proposals" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600 font-semibold">No proposals yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first AI-powered GovCon proposal</p>
          <button onClick={() => setShowNew(true)} className="btn-primary mt-4 mx-auto">
            Create Proposal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((pr) => (
            <div
              key={pr._id}
              className="card-hover group flex items-center justify-between gap-4 cursor-pointer"
              onClick={() => {
                proposalsApi.get(pr._id).then((res) => setSelected(res.data.proposal)).catch(() => {});
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 truncate">{pr.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[pr.status] || "bg-slate-100 text-slate-600"}`}>
                    {pr.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pr.agency || "No agency"} {pr.solicitationNumber ? `· ${pr.solicitationNumber}` : ""}
                  {pr.dueDate ? ` · Due: ${pr.dueDate}` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Created: {new Date(pr.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteId(pr._id); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-all shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-slate-800 mb-2">Delete Proposal?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="btn-primary bg-red-600 hover:bg-red-700 flex-1">Delete</button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

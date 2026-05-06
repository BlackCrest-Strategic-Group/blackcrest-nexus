import React, { useMemo, useState } from "react";
import BlanketPreview from "../components/blanketpo/BlanketPreview.jsx";
import FileUpload from "../components/blanketpo/FileUpload.jsx";
import ValidationResults from "../components/blanketpo/ValidationResults.jsx";
import { blanketPoApi } from "../utils/api.js";

const APPROVAL_STAGES = ["Draft", "Submitted", "Approved", "Rejected", "Released"];

const SUPPLIER_OPTIONS = [
  "Atlas Precision Components",
  "NorthBridge Manufacturing",
  "BlueRidge Industrial Supply",
  "Summit Defense Systems"
];

function downloadBlob({ content, type, filename }) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createLineItem() {
  return {
    id: crypto.randomUUID(),
    partNumber: "",
    description: "",
    quantity: 1,
    unitCost: 0,
    markupPct: 12,
    leadTimeDays: 30,
    supplier: SUPPLIER_OPTIONS[0]
  };
}

export default function BlanketPOBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [erpExporting, setErpExporting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [approvalStage, setApprovalStage] = useState("Draft");
  const [lineItems, setLineItems] = useState([createLineItem()]);
  const [result, setResult] = useState({
    blankets: [],
    validationErrors: [],
    warnings: [],
    summary: { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
  });

  const summaryMetrics = useMemo(() => {
    const totalValue = lineItems.reduce((sum, item) => {
      const sellPrice = Number(item.unitCost || 0) * (1 + Number(item.markupPct || 0) / 100);
      return sum + sellPrice * Number(item.quantity || 0);
    }, 0);

    const estimatedSavings = lineItems.reduce((sum, item) => {
      const baselineMarket = Number(item.unitCost || 0) * 1.07;
      return sum + Math.max(0, (baselineMarket - Number(item.unitCost || 0)) * Number(item.quantity || 0));
    }, 0);

    const supplierSpend = lineItems.reduce((acc, item) => {
      const value = Number(item.quantity || 0) * Number(item.unitCost || 0);
      acc[item.supplier] = (acc[item.supplier] || 0) + value;
      return acc;
    }, {});

    const suppliers = Object.keys(supplierSpend).length;
    const highestSupplierShare = Object.values(supplierSpend).length
      ? (Math.max(...Object.values(supplierSpend)) / Math.max(1, Object.values(supplierSpend).reduce((a, b) => a + b, 0))) * 100
      : 0;

    const riskAlerts = lineItems.filter((item) => Number(item.leadTimeDays) > 60 || Number(item.markupPct) > 25).length;

    return {
      totalValue,
      estimatedSavings,
      riskAlerts,
      supplierConcentration: highestSupplierShare,
      suppliers
    };
  }, [lineItems]);

  async function handleUpload(file) {
    setLoading(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await blanketPoApi.upload(formData);
      setStatusMessage(
        data.engine === "external-blanket-builder"
          ? "Processed by external blanket PO builder service."
          : "Processed by local blanket PO engine."
      );
      setResult({
        blankets: data.blankets || [],
        validationErrors: data.validationErrors || [],
        warnings: data.warnings || [],
        summary: data.summary || { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "Failed to build blanket PO preview.");
      setStatusMessage("");
      setResult({
        blankets: [],
        validationErrors: [],
        warnings: [],
        summary: { suppliers: 0, totalItems: 0, totalReleases: 0, totalValue: 0 }
      });
    } finally {
      setLoading(false);
    }
  }

  function updateLineItem(id, field, value) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function handleAddLineItem() {
    setLineItems((prev) => [...prev, createLineItem()]);
  }

  function handleRemoveLineItem(id) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleExportPdf() {
    window.print();
  }

  async function handleExportCsv() {
    try {
      const response = await blanketPoApi.exportCsv({ blankets: result.blankets });
      downloadBlob({ content: response.data, type: "text/csv", filename: "blanket-po-preview.csv" });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "CSV export failed.");
    }
  }

  async function handleExportErp() {
    const provider = window.prompt("Enter ERP provider (sap, oracle, infor, dynamics):", "sap");
    if (!provider) return;
    setSubmitError("");
    setErpExporting(true);
    try {
      const { data } = await blanketPoApi.exportErp(provider.toLowerCase(), { blankets: result.blankets });
      downloadBlob({
        content: JSON.stringify(data, null, 2),
        type: "application/json",
        filename: `blanket-po-${provider.toLowerCase()}-payload.json`
      });
      setStatusMessage(`ERP-ready payload exported for ${provider.toUpperCase()}.`);
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "ERP export failed.");
    } finally {
      setErpExporting(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <h2 className="section-title">Blanket PO Builder</h2>
        <p className="section-subtitle mt-1">Build enterprise blanket purchase orders with sourcing, pricing, and release controls.</p>

        <div className="mt-5 rounded-lg border border-white/10 p-4 bg-slate-950/30">
          <h3 className="font-semibold text-slate-100">1) Spreadsheet Intake</h3>
          <p className="text-sm text-slate-400 mt-1">Upload supplier line sheets, map columns, and validate procurement data quality before release.</p>
          <div className="mt-4">
            <FileUpload onSubmit={handleUpload} loading={loading} />
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 p-4 bg-slate-950/30">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-100">2) Approval Workflow</h3>
            <select
              className="rounded-md bg-slate-900 border border-slate-700 text-sm px-3 py-2"
              value={approvalStage}
              onChange={(event) => setApprovalStage(event.target.value)}
            >
              {APPROVAL_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-2">Current status: <span className="text-cyan-300 font-medium">{approvalStage}</span></p>
        </div>

        {statusMessage && <div className="alert-success mt-4">{statusMessage}</div>}
        {submitError && <div className="alert-error mt-4">{submitError}</div>}
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="section-title">3) Blanket Line Item Builder</h3>
          <button className="btn-primary" type="button" onClick={handleAddLineItem}>Add Line Item</button>
        </div>
        <table className="w-full mt-4 text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th>Part Number</th><th>Description</th><th>Quantity</th><th>Unit Cost</th><th>Markup %</th><th>Sell Price</th><th>Delivery Lead Time (days)</th><th>Supplier</th><th></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const sellPrice = Number(item.unitCost || 0) * (1 + Number(item.markupPct || 0) / 100);
              return (
                <tr key={item.id} className="border-t border-white/10">
                  {[
                    ["partNumber", "text"], ["description", "text"], ["quantity", "number"], ["unitCost", "number"], ["markupPct", "number"], ["leadTimeDays", "number"]
                  ].map(([field, type]) => (
                    <td key={field} className="py-2 pr-2"><input className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1" type={type} value={item[field]} onChange={(e) => updateLineItem(item.id, field, e.target.value)} /></td>
                  ))}
                  <td className="py-2 pr-2 text-emerald-300 font-medium">${sellPrice.toFixed(2)}</td>
                  <td className="py-2 pr-2">
                    <select className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1" value={item.supplier} onChange={(e) => updateLineItem(item.id, "supplier", e.target.value)}>
                      {SUPPLIER_OPTIONS.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
                    </select>
                  </td>
                  <td className="py-2"><button className="text-rose-300" type="button" onClick={() => handleRemoveLineItem(item.id)}>Remove</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="section-title">4) Contract Summary & Risk Signals</h3>
        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <div className="rounded border border-white/10 p-3"><p className="text-xs text-slate-400">Total Contract Value</p><p className="text-xl font-semibold text-slate-100">${summaryMetrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div>
          <div className="rounded border border-white/10 p-3"><p className="text-xs text-slate-400">Estimated Savings</p><p className="text-xl font-semibold text-emerald-300">${summaryMetrics.estimatedSavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div>
          <div className="rounded border border-white/10 p-3"><p className="text-xs text-slate-400">Risk Alerts</p><p className="text-xl font-semibold text-amber-300">{summaryMetrics.riskAlerts}</p></div>
          <div className="rounded border border-white/10 p-3"><p className="text-xs text-slate-400">Supplier Concentration</p><p className="text-xl font-semibold text-cyan-300">{summaryMetrics.supplierConcentration.toFixed(1)}%</p></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">5) Export Center</h3>
        <p className="text-sm text-slate-400">Export complete blanket agreements for audit, stakeholder review, and ERP ingestion.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={handleExportPdf}>PDF Export</button>
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>CSV Export</button>
          <button type="button" className="btn-primary" onClick={handleExportErp} disabled={erpExporting}>{erpExporting ? "Exporting ERP Payload..." : "ERP-ready Export (Placeholder)"}</button>
        </div>
      </div>

      <ValidationResults validationErrors={result.validationErrors} warnings={result.warnings} />
      <BlanketPreview blankets={result.blankets} summary={result.summary} onExportCsv={handleExportCsv} onExportJson={() => {}} onExportErp={handleExportErp} erpExporting={erpExporting} />
    </div>
  );
}

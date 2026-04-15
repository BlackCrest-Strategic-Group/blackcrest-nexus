import React, { useState } from "react";
import { blanketPoApi } from "../utils/api.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

export default function BlanketPOBuilder() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState({ header: null, lines: [], errors: [] });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!file) {
      setSubmitError("Please select an Excel file before submitting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await blanketPoApi.upload(formData);

      setResult({
        header: data.header,
        lines: data.lines || [],
        errors: data.errors || []
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "Failed to build blanket PO.");
      setResult({ header: null, lines: [], errors: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <h2 className="section-title">Blanket PO Builder</h2>
        <p className="section-subtitle mt-1">Upload an Excel file to validate and generate a structured blanket purchase order.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="blanket-po-file">Excel Upload (.xlsx, .xls)</label>
            <input
              id="blanket-po-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="input"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Build Blanket PO"}
          </button>
        </form>

        {submitError && (
          <div className="alert-error mt-4">{submitError}</div>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="card border-red-200">
          <h3 className="section-title text-red-700">Validation Errors</h3>
          <ul className="mt-3 space-y-2 text-sm text-red-700 list-disc list-inside">
            {result.errors.map((error, index) => (
              <li key={`${error.rowNumber || "global"}-${index}`}>
                {error.rowNumber ? `Row ${error.rowNumber}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.header && (
        <div className="card">
          <h3 className="section-title">PO Header</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm">
            <div><span className="font-semibold">Supplier:</span> {result.header.supplier}</div>
            <div><span className="font-semibold">Start Date:</span> {formatDate(result.header.startDate)}</div>
            <div><span className="font-semibold">End Date:</span> {formatDate(result.header.endDate)}</div>
            <div><span className="font-semibold">Line Count:</span> {result.header.lineCount}</div>
          </div>
        </div>
      )}

      {result.lines.length > 0 && (
        <div className="card">
          <h3 className="section-title">Blanket PO Lines</h3>
          <div className="overflow-x-auto mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Total Qty</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Releases</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={`${line.partNumber}-${line.description}-${line.uom}`}>
                    <td>{line.partNumber}</td>
                    <td>{line.description}</td>
                    <td>{line.uom}</td>
                    <td>{line.totalQty}</td>
                    <td>{formatCurrency(line.unitPrice)}</td>
                    <td>{formatCurrency(line.totalValue)}</td>
                    <td>
                      <div className="space-y-1">
                        {line.releases.map((release, idx) => (
                          <div key={`${release.releaseDate}-${idx}`} className="text-xs text-slate-600">
                            {formatDate(release.releaseDate)} — Qty {release.qty} ({formatCurrency(release.lineValue)})
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

export default function BlanketPreview({ blankets = [], summary, onExportCsv, onExportJson }) {
  if (!blankets.length) return null;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="section-title">Blanket Preview</h3>
            <p className="section-subtitle mt-1">
              Suppliers: {summary.suppliers} • Items: {summary.totalItems} • Releases: {summary.totalReleases} • Value: {formatCurrency(summary.totalValue)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onExportJson} className="btn-secondary text-xs py-1.5 px-3">Export JSON</button>
            <button onClick={onExportCsv} className="btn-secondary text-xs py-1.5 px-3">Export CSV</button>
          </div>
        </div>
      </div>

      {blankets.map((blanket, idx) => (
        <div className="card" key={`${blanket.supplier}-${idx}`}>
          <h4 className="text-base font-semibold text-slate-800">{blanket.supplier}</h4>
          <p className="section-subtitle mt-1">
            Blanket Dates: {formatDate(blanket.blanketStartDate)} - {formatDate(blanket.blanketEndDate)}
          </p>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Unit Price</th>
                  <th>Total Qty</th>
                  <th>Total Value</th>
                  <th>Releases</th>
                </tr>
              </thead>
              <tbody>
                {blanket.items.map((item) => (
                  <tr key={`${item.item}-${item.unitPrice}-${item.uom || "none"}`}>
                    <td>{item.item}</td>
                    <td>{item.description || "-"}</td>
                    <td>{item.uom || "-"}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{item.totalQty}</td>
                    <td>{formatCurrency(item.totalValue)}</td>
                    <td>
                      <div className="space-y-1">
                        {item.releases.map((release, releaseIdx) => (
                          <div className="text-xs text-slate-600" key={`${release.rowNumber}-${releaseIdx}`}>
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
      ))}
    </div>
  );
}

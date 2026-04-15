import React from "react";

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

export default function BlanketPreview({ header, lines = [] }) {
  if (!header && lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {header && (
        <div className="card">
          <h3 className="section-title">PO Header</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm">
            <div><span className="font-semibold">Supplier:</span> {header.supplier}</div>
            <div><span className="font-semibold">Start Date:</span> {formatDate(header.startDate)}</div>
            <div><span className="font-semibold">End Date:</span> {formatDate(header.endDate)}</div>
            <div><span className="font-semibold">Line Count:</span> {header.lineCount}</div>
          </div>
        </div>
      )}

      {lines.length > 0 && (
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
                {lines.map((line) => (
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

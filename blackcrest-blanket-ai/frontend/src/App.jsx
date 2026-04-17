import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const formatNumber = (value) => (typeof value === 'number' ? value.toLocaleString() : value ?? '-');
const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '-';

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];
  rows.forEach((row) => {
    const values = headers.map((key) => {
      const val = Array.isArray(row[key]) ? row[key].join(' | ') : row[key];
      const escaped = String(val ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
};

const downloadBlob = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Upload failed');
      }
      setData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>BlackCrest Blanket AI - Blanket PO Builder</h1>
        <p>Procurement acceleration for buyers, sourcing, and finance teams.</p>
      </header>

      <section className="panel">
        <h2>Upload Demand Spreadsheet</h2>
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Processing...' : 'Upload & Analyze'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      {data && (
        <>
          <section className="panel">
            <h2>Demand Summary</h2>
            <div className="cards">
              <article className="card"><strong>Total Lines</strong><span>{formatNumber(data.demandSummary.totalLinesProcessed)}</span></article>
              <article className="card"><strong>Total Vendors</strong><span>{formatNumber(data.demandSummary.totalVendors)}</span></article>
              <article className="card"><strong>Total Items</strong><span>{formatNumber(data.demandSummary.totalItems)}</span></article>
              <article className="card"><strong>Total Adjusted Qty</strong><span>{formatNumber(data.demandSummary.totalAdjustedQuantity)}</span></article>
              <article className="card"><strong>Total Spend</strong><span>{formatCurrency(data.demandSummary.totalEstimatedSpend)}</span></article>
            </div>
          </section>

          <section className="panel exports">
            <h2>Exports</h2>
            <div className="button-row">
              <button onClick={() => downloadBlob(toCsv(data.processedRows), 'processed-rows.csv', 'text/csv')}>Processed Rows CSV</button>
              <button onClick={() => downloadBlob(toCsv(data.vendorSummary), 'vendor-summary.csv', 'text/csv')}>Vendor Summary CSV</button>
              <button onClick={() => downloadBlob(toCsv(data.financeSummary), 'finance-summary.csv', 'text/csv')}>Finance Summary CSV</button>
              <button onClick={() => downloadBlob(toCsv(data.blanketRecommendations), 'blanket-recommendations.csv', 'text/csv')}>Blanket Recommendations CSV</button>
              <button onClick={() => downloadBlob(JSON.stringify(data, null, 2), 'full-response.json', 'application/json')}>Full Response JSON</button>
            </div>
          </section>

          <DataTable
            title="Vendor Summary"
            rows={data.vendorSummary}
            columns={[
              ['vendor', 'Vendor'],
              ['lineCount', 'Line Count'],
              ['uniqueItems', 'Unique Items'],
              ['totalAdjustedQuantity', 'Total Adjusted Qty'],
              ['totalExtendedCost', 'Total Spend'],
              ['exceptionCount', 'Exception Count']
            ]}
          />

          <DataTable
            title="Blanket Recommendation Summary"
            rows={data.blanketRecommendations}
            columns={[
              ['recommendedBlanketVendor', 'Vendor'],
              ['projectTaskLabel', 'Project/Task'],
              ['lineCount', 'Line Count'],
              ['totalAdjustedQuantity', 'Total Adjusted Qty'],
              ['totalSpend', 'Total Spend']
            ]}
          />

          <DataTable
            title="Finance View"
            rows={data.financeSummary.map((row) => ({ ...row, vendorsInvolved: row.vendorsInvolved.join(' | ') }))}
            columns={[
              ['project', 'Project'],
              ['task', 'Task'],
              ['totalLines', 'Total Lines'],
              ['totalAdjustedQuantity', 'Total Qty'],
              ['totalSpend', 'Total Spend'],
              ['vendorsInvolved', 'Vendors']
            ]}
          />

          <DataTable
            title="Exception Report"
            rows={data.exceptions}
            columns={[
              ['rowNumber', 'Row Number'],
              ['item', 'Item'],
              ['vendor', 'Vendor'],
              ['project', 'Project'],
              ['task', 'Task'],
              ['issueType', 'Issue Type'],
              ['issueDescription', 'Description']
            ]}
          />

          <DataTable
            title="Processed Rows Preview"
            rows={data.processedRows.slice(0, 25).map((r) => ({
              ...r,
              exceptionFlags: r.exceptionFlags.join(' | ')
            }))}
            columns={[
              ['rowNumber', 'Row #'],
              ['item', 'Item'],
              ['vendor', 'Vendor'],
              ['adjustedQuantity', 'Adjusted Qty'],
              ['demand', 'Demand'],
              ['variance', 'Variance'],
              ['pricing', 'Price'],
              ['extendedCost', 'Extended Cost'],
              ['projectTaskLabel', 'Project/Task'],
              ['status', 'Status'],
              ['exceptionFlags', 'Flags']
            ]}
          />
        </>
      )}
    </div>
  );
}

function DataTable({ title, rows, columns }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr>
          </thead>
          <tbody>
            {!rows?.length ? (
              <tr><td colSpan={columns.length}>No data available.</td></tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${title}-${idx}`}>
                  {columns.map(([key]) => (
                    <td key={`${idx}-${key}`}>{String(row[key] ?? '-')}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default App;

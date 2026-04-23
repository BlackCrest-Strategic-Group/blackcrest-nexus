import React, { useState } from 'react';
import api from '../utils/api';

const reportTypes = ['Executive Summary', 'Margin Leak Report', 'Supplier Risk Report', 'RFP Analysis Report', 'Blanket PO Recommendation Report', 'Buyer Task List', 'CSV Export', 'ERP Payload Preview'];

export default function ReportCenterPage() {
  const [type, setType] = useState(reportTypes[0]);
  const [report, setReport] = useState(null);

  const generate = async () => {
    const { data } = await api.post('/api/reports/generate', { reportType: type, context: { executiveSummary: 'Investor demo summary context.' } });
    setReport(data);
  };

  return (
    <section>
      <div className="page-header"><h1>Report Export Center</h1></div>
      <div className="card">
        <select value={type} onChange={(e) => setType(e.target.value)}>{reportTypes.map((r) => <option key={r}>{r}</option>)}</select>
        <button className="btn" onClick={generate} style={{ marginLeft: 8 }}>Generate</button>
      </div>
      {report && <article className="card" style={{ marginTop: '1rem' }}>
        <h3>{report.type}</h3>
        <p>{report.preview}</p>
        <button className="btn ghost" onClick={() => navigator.clipboard.writeText(JSON.stringify(report.json, null, 2))}>Copy to clipboard</button>
        <pre>{JSON.stringify(report.json, null, 2)}</pre>
        {report.csv && <textarea readOnly value={report.csv} rows={6} style={{ width: '100%' }} />}
        <p><strong>{report.printableLabel}</strong></p>
      </article>}
    </section>
  );
}

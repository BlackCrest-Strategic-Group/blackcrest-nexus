import React, { useState } from 'react';
import api from '../utils/api';

const reportTypes = ['Executive Summary', 'Margin Leak Report', 'Supplier Risk Report', 'RFP Analysis Report', 'Blanket PO Recommendation Report', 'Buyer Task List', 'CSV Export', 'ERP Payload Preview'];

export default function ReportCenterPage() {
  const [type, setType] = useState(reportTypes[0]);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('');

  const generate = async () => {
    try {
      const { data } = await api.post('/api/reports/generate', { reportType: type, context: { executiveSummary: 'Investor demo summary context.' } });
      setReport(data);
      setStatus('');
    } catch (_error) {
      setStatus('Report generation is unavailable in this demo moment. Showing a polished placeholder report.');
      setReport({
        type,
        preview: 'Demo report preview is available for click-through. Live exports are enabled in fully provisioned workspaces.',
        json: { demoMode: true, message: 'Saved in demo session only.' },
        printableLabel: 'Print / Save as PDF'
      });
    }
  };

  return (
    <section>
      <div className="page-header"><h1>Report Export Center</h1></div>
      <div className="card">
        <select value={type} onChange={(e) => setType(e.target.value)}>{reportTypes.map((r) => <option key={r}>{r}</option>)}</select>
        <button className="btn" onClick={generate} style={{ marginLeft: 8 }}>Generate</button>
      </div>
      {status && <div className="card" style={{ marginTop: '1rem' }}><strong>Demo placeholder</strong><p>{status}</p></div>}
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

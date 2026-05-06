import { useEffect, useState } from 'react';

async function request(path, token) {
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export default function SentinelSecurityCenter({ token }) {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    request('/api/governance/dashboard', token).then(setData).catch(() => setData(null));
    request('/api/governance/audit-logs?limit=30', token).then((r) => setLogs(r.logs || [])).catch(() => setLogs([]));
  }, [token]);

  const searchLogs = async () => {
    const params = new URLSearchParams({ limit: '30', q, type });
    const result = await request(`/api/governance/audit-logs?${params}`, token);
    setLogs(result.logs || []);
  };

  if (!data) return <section className="card"><h2>Sentinel Security & Governance Layer</h2><p>Loading security command center…</p></section>;

  const kpis = data.securityCommandCenter;
  return <section className="page">
    <h1>Sentinel Security Command Center</h1>
    <p className="sub">SOC 2 + NIST CSF governance, auditability, and enterprise security architecture.</p>
    <p className="disclaimer">Do not upload classified, export-controlled, or proprietary customer data without authorization.</p>
    <div className="kpi-grid">
      {Object.entries(kpis).map(([k, v]) => <article className="kpi" key={k}><p>{k}</p><h3>{String(v)}</h3></article>)}
    </div>
    <div className="module-grid">
      <article className="card"><h3>SOC 2 Dashboard</h3><ul>{data.soc2.map((row) => <li key={row.category}><strong>{row.category}:</strong> {row.status} ({row.score})</li>)}</ul></article>
      <article className="card"><h3>NIST CSF Dashboard</h3><ul>{data.nistCsf.map((row) => <li key={row.function}><strong>{row.function}:</strong> {row.readiness}</li>)}</ul></article>
      <article className="card"><h3>Access Control</h3><ul>{Object.entries(data.accessControl).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}</ul></article>
      <article className="card"><h3>Incident Response Foundation</h3><ul>{Object.entries(data.incidentResponse).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}</ul></article>
    </div>

    <article className="card">
      <h3>Audit Trail Viewer</h3>
      <div className="form-grid inline">
        <input placeholder="Search uploads, downloads, exports, proposals, email, approvals" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option><option value="upload">Upload</option><option value="download">Download</option><option value="export">Export</option><option value="proposal">Proposal</option><option value="email">Email</option><option value="approval">Approval</option>
        </select>
        <button type="button" onClick={searchLogs}>Search</button>
      </div>
      <ul>{logs.slice(0, 12).map((log) => <li key={log._id}><strong>{log.action}</strong> · {log.entityType} · {new Date(log.securityContext.timestamp).toLocaleString()} · IP: {log.securityContext.ip} · Role: {log.securityContext.userRole}</li>)}</ul>
    </article>
  </section>;
}

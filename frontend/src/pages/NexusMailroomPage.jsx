import React, { useMemo, useState } from 'react';
import { getGraphIntegrationStatus, getMailroomDashboardData, getSecureArchitecture, logSentinelEvent, runAiAssistAction, runDeepScanAttachment, supplierStatusOptions } from '../services/mailroomService';

const aiActions = ['Draft Follow-Up', 'Request Missing Data', 'Escalate Supplier Delay', 'Generate Proposal Summary', 'Analyze Attachment'];
const riskClass = { high: 'danger', medium: 'warning', low: 'success' };

export default function NexusMailroomPage() {
  const graph = useMemo(() => getGraphIntegrationStatus(), []);
  const architecture = useMemo(() => getSecureArchitecture(), []);
  const { queues, threads, attachments, executive, workflows, proposalRooms, compliance } = useMemo(() => getMailroomDashboardData(), []);
  const [approvalLog, setApprovalLog] = useState([]);
  const [aiResult, setAiResult] = useState('Select an AI assist action to generate a guided draft.');
  const [scanResult, setScanResult] = useState('Run DeepScan on an attachment to extract missing fields and risk flags.');
  const [threadStatus, setThreadStatus] = useState(Object.fromEntries(threads.map((t) => [t.id, t.proposalStatus])));

  const runAction = async (action, threadId) => {
    const result = await runAiAssistAction(action, threadId);
    setAiResult(result.output);
    logSentinelEvent('secure_message_action', { threadId, action });
  };

  const approveOutbound = (threadId) => {
    const entry = { threadId, approvedBy: 'Current User', approvedAt: new Date().toISOString() };
    setApprovalLog((current) => [entry, ...current].slice(0, 6));
    logSentinelEvent('approval', entry);
  };

  return (<div className="grid" style={{ gap: '1rem' }}>
    <header className="page-header card">
      <h1>Nexus Mailroom</h1>
      <p>Secure procurement collaboration and supplier coordination layer integrated with Outlook/Microsoft Graph. Not an email replacement.</p>
    </header>
    <section className="grid four mailroom-kpis">{queues.map((queue) => <article key={queue.key} className="card"><p className="metric-label">{queue.label}</p><p className="metric">{queue.count}</p></article>)}</section>

    <section className="grid two">
      <article className="card"><h3>Outlook / Graph Secure Foundation</h3><ul className="timeline-list"><li>Mode: {graph.mode}</li><li>OAuth-ready: enabled (non-blocking demo mode)</li><li>Token handling: {graph.tokenHandling}</li><li>Transport enforcement: {graph.transport}</li><li>Least privilege scopes: {graph.leastPrivilegePermissions.join(', ')}</li></ul></article>
      <article className="card"><h3>Security Architecture</h3><ul className="timeline-list"><li>AES-256 at rest: {architecture.encryptionAtRest}</li><li>E2EE placeholder: {architecture.e2eEncryption}</li><li>RBAC enforcement: {architecture.rbac}</li><li>MFA-ready architecture: {architecture.mfaReady ? 'enabled' : 'pending'}</li><li>Tenant isolation: {architecture.tenantIsolation}</li><li>Immutable audit logging: {architecture.immutableAudit}</li></ul></article>
    </section>

    <section className="grid two">
      <article className="card"><h3>Encrypted Proposal Rooms</h3><ul className="timeline-list">{proposalRooms.map((room) => <li key={room.id}><strong>{room.name}</strong> · Members: {room.members} · Expiration: {room.expiry} · External collaboration: {room.externalCollab ? 'enabled' : 'internal-only'}</li>)}</ul><div className="row"><button className="btn ghost" onClick={() => logSentinelEvent('proposal_room_opened', { roomId: proposalRooms[0].id })}>Open Secure Room</button><button className="btn ghost" onClick={() => logSentinelEvent('secure_supplier_upload_portal', { state: 'issued' })}>Issue Upload Portal Link</button></div></article>
      <article className="card"><h3>Procurement Collaboration Workflows</h3><ul className="timeline-list">{workflows.map((w) => <li key={w}>{w}</li>)}</ul></article>
    </section>

    <section className="card"><h3>Email Thread View</h3><div className="mailroom-thread-table"><div className="mailroom-thread-head"><span>Supplier</span><span>Subject</span><span>Timestamp</span><span>Attachment</span><span>Status</span><span>Risk</span><span>Buyer</span><span>Expiration</span><span>Actions</span></div>{threads.map((thread) => <div key={thread.id} className="mailroom-thread-row"><span>{thread.supplierName}</span><span>{thread.subject}</span><span>{new Date(thread.timestamp).toLocaleString()}</span><span>{thread.hasAttachment ? '📎 Yes' : '—'}</span><span><select value={threadStatus[thread.id]} onChange={(event) => setThreadStatus((current) => ({ ...current, [thread.id]: event.target.value }))}>{supplierStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></span><span><span className={`status-pill ${riskClass[thread.risk]}`}>{thread.risk}</span></span><span>{thread.assignedBuyer}</span><span>{thread.expiresIn}</span><span className="row"><button className="btn ghost" onClick={() => runAction('Draft Follow-Up', thread.id)}>Draft</button><button className="btn ghost" onClick={() => approveOutbound(thread.id)}>Approve</button></span></div>)}</div></section>

    <section className="grid two">
      <article className="card"><h3>AI Assist & DeepScan</h3><div className="row">{aiActions.map((action) => <button key={action} className="btn ghost" onClick={() => runAction(action, threads[0].id)}>{action}</button>)}</div><p className="chip" style={{ marginTop: '.8rem' }}>{aiResult}</p><div className="row"><button className="btn ghost" onClick={async () => { const scan = await runDeepScanAttachment(attachments[0].id); setScanResult(`${scan.summary} Missing: ${scan.missingFields.join(', ')}. Risk: ${scan.riskFlags.join(', ')}`); }}>Run DeepScan</button></div><p className="chip" style={{ marginTop: '.7rem' }}>{scanResult}</p></article>
      <article className="card"><h3>Secure Attachment Controls</h3><ul className="timeline-list">{attachments.map((a) => <li key={a.id}>{a.fileName} · {a.type} · {a.sizeKb}kb · Permission: {a.permissions} · Encrypted: {a.encrypted ? 'Yes' : 'No'}</li>)}</ul><div className="row"><button className="btn ghost" onClick={() => logSentinelEvent('secure_download', { attachmentId: attachments[0].id })}>Log Download</button><button className="btn ghost" onClick={() => logSentinelEvent('secure_export', { bundle: 'proposal-package' })}>Log Export</button></div></article>
    </section>

    <section className="grid two">
      <article className="card"><h3>Approval & Immutable Audit</h3><p className="muted">All outbound supplier messages require human approval and immutable audit records.</p><ul className="timeline-list">{approvalLog.length === 0 ? <li>No approvals recorded yet.</li> : approvalLog.map((log) => <li key={`${log.threadId}-${log.approvedAt}`}>{log.threadId} approved by {log.approvedBy} at {new Date(log.approvedAt).toLocaleString()}</li>)}</ul></article>
      <article className="card"><h3>Compliance Readiness Indicators</h3><ul className="timeline-list">{compliance.map((item) => <li key={item}>{item}</li>)}</ul><p className="muted">Includes CMMC and ITAR-sensitive workflow placeholders for future policy enforcement.</p></article>
    </section>

    <section className="card"><h3>Executive Visibility</h3><div className="grid two"><div><p className="metric-label">Avg Supplier Response</p><p className="metric">{executive.avgSupplierResponseHours}h</p></div><div><p className="metric-label">Stalled Proposals</p><p className="metric">{executive.stalledProposals}</p></div><div><p className="metric-label">Supplier Responsiveness</p><p className="metric">{executive.supplierResponsiveness}</p></div><div><p className="metric-label">Proposal Throughput</p><p className="metric">{executive.proposalThroughputMonthly}</p></div></div></section>
  </div>);
}

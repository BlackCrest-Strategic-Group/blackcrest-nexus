import React, { useMemo, useState } from 'react';
import { demoFundingProviders } from '../services/fundingProviders';

const workflowSections = [
  'Capital Providers',
  'Invoice Financing',
  'Purchase Order Financing',
  'Supply Chain Funding',
  'Working Capital Requests'
];

const requestStatuses = ['Submitted', 'Under Review', 'Approved', 'Declined', 'Funded'];

export default function FundingBridgePage() {
  const [requestForm, setRequestForm] = useState({
    customer: '',
    contractValue: '',
    requestedAmount: '',
    supplier: '',
    deliveryTimeline: '',
    supportingDocuments: null
  });

  const providers = useMemo(
    () => demoFundingProviders.map((providerAdapter) => providerAdapter.getMetadata()),
    []
  );

  const dashboardMetrics = {
    pendingRequests: 6,
    approvedFunding: '$2.4M',
    activeCapitalPartners: providers.length,
    estimatedFundingCapacity: '$12.8M'
  };

  const onFieldChange = (field, value) => {
    setRequestForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section>
      <div className="page-header">
        <h1>Funding Bridge</h1>
        <p className="muted">Workflow center for capital partner coordination and funding execution.</p>
      </div>

      <div className="card">
        <h3>Funding &amp; Capital Partner Workflow Center</h3>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          {workflowSections.map((section) => (
            <article className="card nested" key={section}>
              <strong>{section}</strong>
              <p className="muted">Manage and monitor {section.toLowerCase()} tasks from one operating view.</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid two" style={{ marginTop: '1rem' }}>
        <article className="card">
          <h3>Funding Request Workflow</h3>
          <div className="grid two" style={{ gap: '0.75rem' }}>
            <label>Customer<input value={requestForm.customer} onChange={(e) => onFieldChange('customer', e.target.value)} /></label>
            <label>Contract Value<input value={requestForm.contractValue} onChange={(e) => onFieldChange('contractValue', e.target.value)} /></label>
            <label>Requested Amount<input value={requestForm.requestedAmount} onChange={(e) => onFieldChange('requestedAmount', e.target.value)} /></label>
            <label>Supplier<input value={requestForm.supplier} onChange={(e) => onFieldChange('supplier', e.target.value)} /></label>
            <label>Delivery Timeline<input value={requestForm.deliveryTimeline} onChange={(e) => onFieldChange('deliveryTimeline', e.target.value)} /></label>
            <label>Supporting Documents
              <input type="file" onChange={(e) => onFieldChange('supportingDocuments', e.target.files?.[0] || null)} />
            </label>
          </div>
          <button className="btn" style={{ marginTop: '1rem' }}>Submit Funding Request</button>
        </article>

        <article className="card">
          <h3>Funding Dashboard</h3>
          <ul>
            <li>Pending Requests: <strong>{dashboardMetrics.pendingRequests}</strong></li>
            <li>Approved Funding: <strong>{dashboardMetrics.approvedFunding}</strong></li>
            <li>Active Capital Partners: <strong>{dashboardMetrics.activeCapitalPartners}</strong></li>
            <li>Estimated Funding Capacity: <strong>{dashboardMetrics.estimatedFundingCapacity}</strong></li>
          </ul>
          <h4 style={{ marginTop: '1rem' }}>Status Tracking</h4>
          <div className="timeline-list">
            {requestStatuses.map((status) => <div key={status}>• {status}</div>)}
          </div>
        </article>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Lender / Provider Network</h3>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          {providers.map((provider) => (
            <article className="card nested" key={provider.id}>
              <h4>{provider.providerName}</h4>
              <ul>
                <li>Funding Types: {provider.fundingTypes.join(', ')}</li>
                <li>Approval Speed: {provider.approvalSpeed}</li>
                <li>Regions Supported: {provider.regionsSupported.join(', ')}</li>
                <li>Industries Served: {provider.industriesServed.join(', ')}</li>
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

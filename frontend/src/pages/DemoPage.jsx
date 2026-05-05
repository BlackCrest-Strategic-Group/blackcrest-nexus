import React, { useMemo, useState } from 'react';

const rotatingMessages = [
  'Analyzing supplier performance...',
  'Detecting cost anomalies...',
  'Evaluating supplier risk exposure...',
  'Mapping funding opportunities...'
];

const fundingMailTo = 'mailto:michael.allen.scott43@outlook.com?subject=BlackCrest Nexus Funding Inquiry&body=Name:%0D%0ACompany:%0D%0AWhat are you looking to solve:%0D%0AUrgency (Optional):';

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const demoMetrics = useMemo(() => ({ savings: 482430, risk: 'High', bars: [55, 78, 66, 91] }), []);

  const startFlow = () => {
    setLoading(true);
    setStep(1);
    setTimeout(() => {
      setStep(2);
      let idx = 0;
      const interval = setInterval(() => {
        idx += 1;
        setMessageIndex(idx % rotatingMessages.length);
      }, 900);
      setTimeout(() => {
        clearInterval(interval);
        setStep(3);
        setLoading(false);
      }, 4200);
    }, 1200);
  };

  return (
    <main className="auth-page demo-flow-page">
      <section className="auth-card demo-flow-card">
        <h1>BlackCrest Nexus Live Demo</h1>
        <p className="auth-subtitle">Simulated intelligence workflow connecting procurement and funding outcomes.</p>

        <div className="demo-steps"><span className={step >= 1 ? 'active' : ''}>1</span><span className={step >= 2 ? 'active' : ''}>2</span><span className={step >= 3 ? 'active' : ''}>3</span><span className={step >= 4 ? 'active' : ''}>4</span></div>

        <div className="card">
          <h3>Step 1: Upload Simulation</h3>
          <p>Upload Procurement File</p>
          <button className="btn" onClick={startFlow} disabled={loading}>{loading ? 'Uploading...' : 'Start Upload'}</button>
          {loading && <div className="demo-spinner" aria-label="loading" />}
        </div>

        {step >= 2 && (
          <div className="card dashboard-transition">
            <h3>Step 2: Processing Simulation</h3>
            <p className="rotating-status">{rotatingMessages[messageIndex]}</p>
          </div>
        )}

        {step >= 3 && (
          <div className="card dashboard-transition">
            <h3>Step 3: Results Dashboard</h3>
            <p>Cost Savings Identified: <strong>${demoMetrics.savings.toLocaleString()}</strong></p>
            <p>Supplier Risk Score: <span className="status-pill danger">{demoMetrics.risk}</span></p>
            <ul>
              <li>Supplier Delay Risk</li>
              <li>Margin Leakage</li>
              <li>Contract Inefficiency</li>
            </ul>
            <div className="demo-bars">{demoMetrics.bars.map((v, i) => <span key={i} style={{ height: `${v}%` }} />)}</div>
            <button className="btn ghost" onClick={() => setStep(4)}>Continue to Funding Intelligence</button>
          </div>
        )}

        {step >= 4 && (
          <div className="card dashboard-transition funding-wow">
            <h3>Funding &amp; Capital Insights</h3>
            <ul>
              <li>Working Capital Opportunity Detected</li>
              <li>Invoice Acceleration Eligible</li>
              <li>Supplier Financing Option Available</li>
            </ul>
            <p>BlackCrest Nexus connects procurement data to funding pathways, helping operators unlock capital from their own supply chain.</p>
            <a className="btn" href={fundingMailTo}>Request Funding Review</a>
          </div>
        )}
      </section>
    </main>
  );
}

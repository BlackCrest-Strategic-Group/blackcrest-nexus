import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ErpConnectorCenterPage() {
  const [connectors, setConnectors] = useState([]);
  const [copy, setCopy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/erp-connectors').then(({ data }) => {
      setConnectors(data.connectors || []);
      setCopy(data.copy || '');
      setError('');
    }).catch(() => {
      setError('ERP connector demo is loading. Showing a safe preview in this session.');
      setConnectors([]);
      setCopy('ERP connectors are available in the live environment. Demo session displays a read-only preview.');
    });
  }, []);

  return (
    <section>
      <div className="page-header"><h1>ERP Connector Center</h1></div>
      {error && <div className="card"><strong>Demo placeholder</strong><p>{error}</p></div>}
      <p>{copy}</p>
      <div className="grid two">
        {connectors.map((connector) => (
          <article className="card" key={connector.id || connector.provider}>
            <h3>{connector.provider}</h3>
            <ul>
              <li>Mode: {connector.mode === 'csv_now_api_later' ? 'CSV now, API later' : connector.mode}</li>
              <li>Status: {connector.status}</li>
              <li>Read-only: {String(connector.readOnly)}</li>
              <li>IT approval: {connector.itApprovalStatus}</li>
            </ul>
            <pre>{JSON.stringify(connector.sampleMapping, null, 2)}</pre>
          </article>
        ))}
      </div>
    </section>
  );
}

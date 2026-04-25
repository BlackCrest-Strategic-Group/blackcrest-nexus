import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ErpConnectorCenterPage() {
  const [connectors, setConnectors] = useState([]);
  const [copy, setCopy] = useState('');

  useEffect(() => {
    api.get('/api/erp-connectors').then(({ data }) => {
      setConnectors(data.connectors || []);
      setCopy(data.copy || '');
    });
  }, []);

  return (
    <section>
      <div className="page-header"><h1>ERP Connector Center</h1></div>
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

export default function Procurement() {
  const suppliers = [
    { name: 'Atlas Components', risk: 'Low', onTime: '97%', region: 'US' },
    { name: 'Nova Plastics', risk: 'Medium', onTime: '91%', region: 'MX' },
    { name: 'CircuitWave', risk: 'High', onTime: '82%', region: 'TW' }
  ];

  return (
    <section>
      <h2>Procurement Intelligence</h2>
      <div className="card-grid">
        <article className="module-card"><h4>YTD Savings</h4><p>$428,000</p></article>
        <article className="module-card"><h4>Pipeline Savings</h4><p>$119,500</p></article>
        <article className="module-card"><h4>Risk Alerts</h4><p>3 Active</p></article>
      </div>
      <div className="table-wrap">
        <h3>Supplier Risk Snapshot</h3>
        <table>
          <thead><tr><th>Supplier</th><th>Risk</th><th>On-Time</th><th>Region</th></tr></thead>
          <tbody>{suppliers.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.risk}</td><td>{s.onTime}</td><td>{s.region}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

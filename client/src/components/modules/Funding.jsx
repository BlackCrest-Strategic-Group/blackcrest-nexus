export default function Funding() {
  const options = [
    { type: 'Invoice Factoring', apr: '9.5%', limit: '$500K' },
    { type: 'Supply Chain Credit', apr: '7.2%', limit: '$1.2M' },
    { type: 'Purchase Order Financing', apr: '11.1%', limit: '$800K' }
  ];
  return <section><h2>Funding Bridge</h2><div className="card-grid">{options.map((o) => <article className="module-card" key={o.type}><h4>{o.type}</h4><p>APR: {o.apr}</p><small>Limit: {o.limit}</small></article>)}</div></section>;
}

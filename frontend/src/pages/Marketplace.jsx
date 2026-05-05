import React, { useMemo, useState } from 'react';

const suppliers = [
  { name: 'Global Metals Inc', region: 'USA', leadTime: '2-4 weeks', price: '$$' },
  { name: 'EuroPack Solutions', region: 'Germany', leadTime: '3-5 weeks', price: '$$$' },
  { name: 'Asia Components Ltd', region: 'China', leadTime: '1-3 weeks', price: '$' }
];

export default function Marketplace() {
  const [query, setQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const filtered = useMemo(() => suppliers.filter((s) => `${s.name} ${s.region}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return <section>
    <div className='page-header'><h1>Supplier Marketplace</h1><p>Discover trusted suppliers with live-ready sample intelligence.</p></div>
    <article className='card'>
      <input placeholder='Search suppliers or regions' value={query} onChange={(e) => setQuery(e.target.value)} />
    </article>
    <div className='supplier-grid' style={{ marginTop: '1rem' }}>
      {filtered.map((supplier) => (
        <article key={supplier.name} className='card supplier-card'>
          <h3>{supplier.name}</h3>
          <p><strong>Region:</strong> {supplier.region}</p>
          <p><strong>Lead Time:</strong> {supplier.leadTime}</p>
          <p><strong>Price Tier:</strong> {supplier.price}</p>
          <button className='btn' onClick={() => setSelectedSupplier(supplier)}>View Supplier</button>
        </article>
      ))}
    </div>
    {selectedSupplier && (
      <article className='card' style={{ marginTop: '1rem' }}>
        <div className='row between center'>
          <h3 style={{ margin: 0 }}>{selectedSupplier.name}</h3>
          <button className='btn ghost' onClick={() => setSelectedSupplier(null)}>Close</button>
        </div>
        <p>Region: {selectedSupplier.region}</p>
        <p>Lead Time: {selectedSupplier.leadTime}</p>
        <p>Price Tier: {selectedSupplier.price}</p>
      </article>
    )}
  </section>;
}

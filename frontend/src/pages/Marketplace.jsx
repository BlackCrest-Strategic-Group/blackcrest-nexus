import React, { useMemo, useState } from 'react';

const suppliers = [
  { name: 'Global Metals Inc', region: 'USA', leadTime: '2-4 weeks', price: '$120K-$240K', summary: 'Precision alloy supplier for aerospace and defense assemblies.' },
  { name: 'EuroPack Solutions', region: 'Germany', leadTime: '3-5 weeks', price: '$180K-$320K', summary: 'Premium packaging supplier with sustainability compliance support.' },
  { name: 'Asia Components Ltd', region: 'Singapore', leadTime: '1-3 weeks', price: '$90K-$180K', summary: 'High-volume component production with rapid fulfillment lanes.' }
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
          <p><strong>Price Range:</strong> {supplier.price}</p>
          <button className='primary-btn' onClick={() => setSelectedSupplier(supplier)}>View Details</button>
        </article>
      ))}
    </div>
    {selectedSupplier && (
      <div className='modal-backdrop' onClick={() => setSelectedSupplier(null)}>
        <article className='card modal-card' onClick={(e) => e.stopPropagation()}>
          <div className='row between center'>
            <h3 style={{ margin: 0 }}>{selectedSupplier.name}</h3>
            <button className='secondary-btn' onClick={() => setSelectedSupplier(null)}>Close</button>
          </div>
          <p><strong>Region:</strong> {selectedSupplier.region}</p>
          <p><strong>Lead Time:</strong> {selectedSupplier.leadTime}</p>
          <p><strong>Price Range:</strong> {selectedSupplier.price}</p>
          <p className='muted'>{selectedSupplier.summary}</p>
          <button className='primary-btn'>Initiate Supplier Review</button>
        </article>
      </div>
    )}
  </section>;
}

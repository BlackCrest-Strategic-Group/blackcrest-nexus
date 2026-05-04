import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceApi } from '../utils/api';

export default function MarketplaceHomePage() {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ q: '', location: '' });

  useEffect(() => { marketplaceApi.categories().then(({ data }) => setCategories(data)); }, []);
  useEffect(() => { marketplaceApi.suppliers(filters).then(({ data }) => setSuppliers(data)); }, [filters.q, filters.location]);

  const featured = useMemo(() => suppliers.filter((s) => s.isVerified).slice(0, 6), [suppliers]);

  return <section>
    <h1>Marketplace</h1>
    <p className="muted">Find and compare qualified suppliers quickly.</p>
    <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
      <input placeholder="Keyword" value={filters.q} onChange={(e) => setFilters((v) => ({ ...v, q: e.target.value }))} />
      <input placeholder="Location" value={filters.location} onChange={(e) => setFilters((v) => ({ ...v, location: e.target.value }))} />
    </div>
    <h3>Categories</h3>
    <div className="category-grid">
      {categories.map((category) => <Link key={category._id} className="card" to={`/marketplace/category/${category.slug}`}><strong>{category.name}</strong></Link>)}
    </div>
    <h3 style={{ marginTop: 20 }}>Featured Suppliers</h3>
    <div className="category-grid">
      {featured.map((supplier) => <Link key={supplier._id} className="card" to={`/marketplace/supplier/${supplier._id}`}>
        <strong>{supplier.companyName}</strong><div className="muted">{supplier.location.city}, {supplier.location.country}</div>
      </Link>)}
    </div>
  </section>;
}

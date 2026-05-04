import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marketplaceApi } from '../utils/api';

export default function MarketplaceCategoryPage() {
  const { slug } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [location, setLocation] = useState('');
  useEffect(() => {
    marketplaceApi.suppliers({ category: slug, location }).then(({ data }) => setSuppliers(data));
  }, [slug, location]);

  return <section>
    <h1>Category Suppliers</h1>
    <input placeholder="Filter by city" value={location} onChange={(e) => setLocation(e.target.value)} />
    <div className="category-grid" style={{ marginTop: 16 }}>
      {suppliers.map((supplier) => <Link key={supplier._id} className="card" to={`/marketplace/supplier/${supplier._id}`}>
        <strong>{supplier.companyName}</strong>
        <p>{supplier.description}</p>
      </Link>)}
    </div>
  </section>;
}

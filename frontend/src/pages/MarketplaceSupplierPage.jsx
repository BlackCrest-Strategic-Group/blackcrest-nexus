import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { marketplaceApi } from '../utils/api';

export default function MarketplaceSupplierPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [request, setRequest] = useState({ productNeeded: '', quantity: '', location: '', urgency: '', email: '' });

  useEffect(() => { marketplaceApi.supplier(id).then(({ data }) => setSupplier(data)); }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    await marketplaceApi.requestQuote(request);
    alert('Request submitted');
    setRequest({ productNeeded: '', quantity: '', location: '', urgency: '', email: '' });
  };

  if (!supplier) return <p>Loading...</p>;
  return <section>
    <h1>{supplier.companyName}</h1>
    <p>{supplier.description}</p>
    <p><strong>Category:</strong> {supplier.category}</p>
    <p><strong>Capabilities:</strong> {supplier.capabilities.join(', ')}</p>
    <button className="btn">Find Supplier</button>
    <form onSubmit={submit} style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 480 }}>
      {Object.keys(request).map((key) => <input key={key} required placeholder={key} value={request[key]} onChange={(e) => setRequest((v) => ({ ...v, [key]: e.target.value }))} />)}
      <button className="btn" type="submit">Request Quote</button>
    </form>
  </section>;
}

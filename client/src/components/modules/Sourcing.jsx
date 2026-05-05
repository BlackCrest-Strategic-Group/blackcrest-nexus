import { useState } from 'react';

export default function Sourcing() {
  const [form, setForm] = useState({ title: '', qty: '', supplier: '' });
  return (
    <section>
      <h2>Sourcing</h2>
      <div className="module-card form-card">
        <h3>Create RFQ</h3>
        <input placeholder="RFQ Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Quantity" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        <input placeholder="Preferred Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
        <button>Submit RFQ</button>
      </div>
    </section>
  );
}

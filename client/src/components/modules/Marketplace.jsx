import { useState } from 'react';

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const listings = [
    { name: 'ForgeSteel', category: 'Metals', rating: 4.8 },
    { name: 'BlueRiver Textiles', category: 'Textiles', rating: 4.5 },
    { name: 'Prime Bearings', category: 'Mechanical', rating: 4.7 }
  ];
  const filtered = listings.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()));
  return <section><h2>Marketplace</h2><input placeholder="Search suppliers or category" value={search} onChange={(e) => setSearch(e.target.value)} /><div className="card-grid">{filtered.map((item) => <article className="module-card" key={item.name}><h4>{item.name}</h4><p>{item.category}</p><small>Rating: {item.rating}</small></article>)}</div></section>;
}

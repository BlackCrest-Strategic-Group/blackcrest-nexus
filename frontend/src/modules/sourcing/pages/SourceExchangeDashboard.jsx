import React from 'react';

const cards = [
  {
    title: 'Global Suppliers',
    value: '12,480',
    description: 'Verified suppliers across direct and indirect procurement categories.'
  },
  {
    title: 'Open RFQs',
    value: '284',
    description: 'Commercial sourcing opportunities currently active.'
  },
  {
    title: 'Indirect Spend Categories',
    value: '34',
    description: 'MRO, facilities, IT, office operations, logistics, and more.'
  },
  {
    title: 'AI Recommendations',
    value: '1,204',
    description: 'Supplier matching and sourcing optimization opportunities.'
  }
];

export default function SourceExchangeDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Source Exchange</h1>
        <p className="text-gray-400 mt-2">
          Procurement intelligence, supplier sourcing, RFQ management, and category visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-800 bg-black/40 p-5"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <div className="text-4xl font-bold mt-3">{card.value}</div>
            <p className="text-sm text-gray-400 mt-3">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-black/40 p-6">
        <h2 className="text-2xl font-semibold">Indirect Procurement Intelligence</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold">Top Categories</h3>
            <ul className="mt-3 space-y-2 text-gray-300">
              <li>MRO</li>
              <li>Office Supplies</li>
              <li>Facilities</li>
              <li>Packaging</li>
              <li>IT Hardware</li>
            </ul>
          </div>

          <div className="border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold">AI Procurement Insights</h3>
            <ul className="mt-3 space-y-2 text-gray-300">
              <li>Supplier consolidation opportunities identified</li>
              <li>Alternate regional sourcing available</li>
              <li>Lead time risk increasing in APAC region</li>
              <li>Tail spend fragmentation detected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

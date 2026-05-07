export default function SupplierCard({ supplier }) {
  const riskTone = supplier.riskScore > 35 ? 'text-rose-300' : 'text-emerald-300';

  return (
    <article className='rounded-xl border border-slate-700 bg-slate-900 p-4'>
      <h3 className='text-lg font-semibold text-slate-100'>{supplier.supplierName}</h3>
      <p className='text-sm text-slate-400'>{supplier.city}, {supplier.region}</p>
      <p className='mt-3 text-sm text-slate-300'>Industry: {supplier.industry}</p>
      <div className='mt-3 flex items-center justify-between text-sm'>
        <span className={riskTone}>Risk Score: {supplier.riskScore}</span>
        <span className='text-cyan-300'>Lead Time: {supplier.leadTimeDays}d</span>
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        {supplier.capabilities.map((capability) => (
          <span key={capability} className='rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-300'>
            {capability}
          </span>
        ))}
      </div>
    </article>
  );
}

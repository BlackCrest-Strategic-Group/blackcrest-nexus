export default function KpiCard({ label, value, trend }) {
  return (
    <article className='rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg shadow-cyan-900/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40'>
      <p className='text-sm text-slate-400'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-cyan-200'>{value}</p>
      <p className='mt-1 text-xs text-emerald-300'>{trend}</p>
    </article>
  );
}

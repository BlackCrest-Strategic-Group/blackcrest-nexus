import SupplierCard from '../components/dashboard/SupplierCard';
import useRegionalSuppliers from '../hooks/useRegionalSuppliers';

export default function DashboardPage() {
  const { regions, activeRegion, setActiveRegion, filteredSuppliers } = useRegionalSuppliers();

  return (
    <section className='space-y-6'>
      <div className='rounded-2xl border border-slate-700 bg-slate-900/70 p-6'>
        <h1 className='text-3xl font-bold'>Executive Procurement Dashboard</h1>
        <p className='mt-2 text-slate-300'>Live regional supplier intelligence with risk and lead-time visibility.</p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`rounded-full px-4 py-2 text-sm ${activeRegion === region ? 'bg-cyan-300 text-slate-950' : 'border border-slate-600 text-slate-200'}`}
          >
            {region}
          </button>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredSuppliers.map((supplier) => (
          <SupplierCard key={supplier.supplierName} supplier={supplier} />
        ))}
      </div>
    </section>
  );
}

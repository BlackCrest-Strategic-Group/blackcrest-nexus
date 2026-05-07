import { Link, Outlet } from 'react-router-dom';

export default function EnterpriseLayout() {
  return (
    <div className='min-h-screen bg-slate-950 text-slate-100'>
      <header className='border-b border-slate-800 bg-slate-900/70 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
          <Link to='/' className='text-lg font-semibold tracking-wide text-cyan-300'>
            BlackCrest Nexus
          </Link>
          <Link to='/app' className='rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-200 hover:border-cyan-300'>
            Procurement Command Center
          </Link>
        </div>
      </header>
      <main className='mx-auto max-w-7xl px-6 py-8'>
        <Outlet />
      </main>
    </div>
  );
}

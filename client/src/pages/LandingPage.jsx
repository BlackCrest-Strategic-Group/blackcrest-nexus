import React from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../components/landing/KpiCard';

const kpis = [
  { label: 'Supplier Risk Reduction', value: '31%', trend: '+8% QoQ AI-guided mitigation' },
  { label: 'RFQ Cycle Time', value: '42 hrs', trend: '-21% process acceleration' },
  { label: 'Sourcing Velocity', value: '2.8x', trend: '+15 strategic categories optimized' },
];

export default function LandingPage() {
  return (
    <div className='space-y-16 py-8'>
      <section className='grid items-center gap-10 lg:grid-cols-2'>
        <div>
          <p className='inline-flex rounded-full border border-cyan-400/30 px-4 py-2 text-sm text-cyan-200'>
            The operational intelligence layer for procurement teams
          </p>
          <h1 className='mt-6 text-5xl font-black leading-tight text-white'>
            Enterprise AI Procurement Operations Platform
          </h1>
          <p className='mt-4 text-lg text-slate-300'>
            Unify procurement intelligence, supplier analytics, RFQ workflows, and executive visibility with BlackCrest Nexus.
          </p>
          <div className='mt-8 flex flex-wrap gap-4'>
            <Link to='/app' className='rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-900'>Launch Executive Dashboard</Link>
            <button className='rounded-xl border border-slate-600 px-6 py-3 text-slate-100'>Request Investor Demo</button>
          </div>
        </div>
        <div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
          {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
        </div>
      </section>

      <section className='grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 lg:grid-cols-3'>
        <article><h2 className='text-xl font-semibold'>Security by Sentinel Layer</h2><p className='mt-2 text-slate-300'>JWT auth, RBAC, audit logging, rate limiting, and MFA-ready architecture for SOC 2/NIST direction.</p></article>
        <article><h2 className='text-xl font-semibold'>Regional Supplier Intelligence</h2><p className='mt-2 text-slate-300'>Coverage across Delaware, Philadelphia, Baltimore, Warner Robins, Macon, Orlando, Central Florida, and Central Georgia.</p></article>
        <article><h2 className='text-xl font-semibold'>RFQ-to-Executive Workflow</h2><p className='mt-2 text-slate-300'>Upload PDF/XLSX/DOCX procurement packages, surface supplier risk, and publish executive summaries with KPI impact.</p></article>
      </section>
    </div>
  );
}

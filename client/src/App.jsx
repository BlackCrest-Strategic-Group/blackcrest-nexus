import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

const roles = ['BUYER', 'OPERATIONS', 'EXECUTIVE'];
const API_BASE = import.meta.env.VITE_API_URL || '';

const demoData = {
  suppliers: [
    {
      id: 'SUP-001',
      supplierName: 'Titan Industrial Group',
      riskScore: 82,
      leadTimeAverage: 28,
    },
    {
      id: 'SUP-002',
      supplierName: 'Orion Manufacturing',
      riskScore: 41,
      leadTimeAverage: 17,
    },
  ],
  purchaseOrders: [
    {
      id: 'PO-1001',
      status: 'LATE-MATERIAL',
    },
    {
      id: 'PO-1002',
      status: 'ACTIVE',
    },
  ],
  alerts: [
    {
      id: 'ALT-001',
      alertType: 'Supplier Risk',
      severity: 'HIGH',
      aiSummary:
        'Titan Industrial Group has elevated delivery volatility and pricing instability.',
    },
  ],
};

async function fetchOverview(role) {
  try {
    const response = await fetch(`${API_BASE}/api/nexus/overview?role=${role}`);

    if (!response.ok) {
      throw new Error('Failed to load overview data');
    }

    const data = await response.json();

    return {
      suppliers: data.suppliers || [],
      purchaseOrders: data.purchaseOrders || [],
      alerts: data.alerts || [],
    };
  } catch (error) {
    console.error('Overview API failed. Using demo data.', error);
    return demoData;
  }
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-black text-white overflow-hidden'>
      <section className='relative px-6 py-24 border-b border-zinc-800 bg-gradient-to-b from-black via-zinc-950 to-black'>
        <div className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center'>
          <div>
            <div className='inline-flex items-center px-4 py-2 rounded-full border border-amber-500/30 text-amber-300 text-sm mb-6'>
              Procurement Intelligence Operating System
            </div>

            <h1 className='text-5xl md:text-7xl font-black leading-tight mb-6'>
              Procurement teams are drowning in spreadsheets.
            </h1>

            <p className='text-xl text-zinc-400 mb-8 leading-relaxed'>
              BlackCrest Nexus surfaces supplier risk, sourcing bottlenecks, procurement delays, and operational blind spots in real time. Built for procurement leaders who are tired of making million-dollar decisions through email chains and Excel tabs stitched together like medieval engineering.
            </p>

            <div className='flex flex-wrap gap-4'>
              <button
                onClick={() => navigate('/app')}
                className='bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-4 rounded-xl text-lg transition'
              >
                Access Live Platform
              </button>

              <button className='border border-zinc-700 hover:border-amber-400 px-6 py-4 rounded-xl text-lg transition'>
                Executive Walkthrough
              </button>
            </div>

            <div className='grid grid-cols-3 gap-6 mt-12'>
              <div>
                <div className='text-4xl font-black text-amber-300'>40%</div>
                <div className='text-zinc-500 text-sm'>Faster sourcing cycles</div>
              </div>

              <div>
                <div className='text-4xl font-black text-amber-300'>24/7</div>
                <div className='text-zinc-500 text-sm'>Supplier monitoring</div>
              </div>

              <div>
                <div className='text-4xl font-black text-amber-300'>AI</div>
                <div className='text-zinc-500 text-sm'>Operational intelligence</div>
              </div>
            </div>
          </div>

          <div className='relative'>
            <div className='absolute inset-0 bg-amber-500/10 blur-3xl'></div>

            <div className='relative bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <div className='text-xl font-bold text-amber-300'>Command Center</div>
                  <div className='text-zinc-500 text-sm'>Executive Procurement Intelligence</div>
                </div>

                <div className='bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm'>3 Critical Alerts</div>
              </div>

              <div className='grid grid-cols-3 gap-4 mb-6'>
                <div className='bg-black border border-zinc-800 rounded-xl p-4'>
                  <div className='text-zinc-500 text-xs'>At Risk Suppliers</div>
                  <div className='text-3xl font-black text-amber-300'>12</div>
                </div>

                <div className='bg-black border border-zinc-800 rounded-xl p-4'>
                  <div className='text-zinc-500 text-xs'>Delayed POs</div>
                  <div className='text-3xl font-black text-amber-300'>7</div>
                </div>

                <div className='bg-black border border-zinc-800 rounded-xl p-4'>
                  <div className='text-zinc-500 text-xs'>Savings Found</div>
                  <div className='text-3xl font-black text-amber-300'>$2.1M</div>
                </div>
              </div>

              <div className='bg-black border border-zinc-800 rounded-xl p-4 h-72'>
                <div className='text-amber-300 mb-4'>Supplier Risk Radar</div>

                <ResponsiveContainer>
                  <BarChart data={demoData.suppliers}>
                    <XAxis dataKey='supplierName' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='riskScore' fill='#f59e0b' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-6 py-24'>
        <div className='text-center mb-16'>
          <div className='text-4xl font-black mb-4'>Built for modern procurement warfare.</div>
          <div className='text-zinc-500 text-xl'>Not another dashboard. An operational intelligence layer.</div>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {[
            {
              title: 'Supplier Intelligence',
              text: 'Track supplier volatility, lead times, delivery risks, and operational instability before it impacts production.',
            },
            {
              title: 'Proposal & RFQ Analysis',
              text: 'Upload quotes, spreadsheets, PDFs, and sourcing documents for instant AI-assisted breakdowns.',
            },
            {
              title: 'Executive Command Center',
              text: 'Surface margin leakage, sourcing delays, procurement bottlenecks, and operational alerts in one place.',
            },
            {
              title: 'Workflow Automation',
              text: 'Accelerate escalations, sourcing reviews, supplier communication, and operational reporting.',
            },
            {
              title: 'ERP-Ready Architecture',
              text: 'Designed for read-only operational visibility with enterprise integration flexibility.',
            },
            {
              title: 'Sentinel Governance Layer',
              text: 'Role-based visibility, audit-focused workflows, and enterprise-minded AI governance controls.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/40 transition'
            >
              <div className='text-2xl font-bold text-amber-300 mb-4'>
                {item.title}
              </div>

              <div className='text-zinc-400 leading-relaxed'>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='border-t border-zinc-800 py-24 px-6 text-center'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-5xl font-black mb-6'>
            Stop running procurement through chaos.
          </div>

          <div className='text-zinc-500 text-xl mb-10'>
            BlackCrest Nexus gives procurement leaders operational visibility, supplier intelligence, and AI-powered execution speed.
          </div>

          <button
            onClick={() => navigate('/app')}
            className='bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-5 rounded-2xl text-xl transition'
          >
            Enter BlackCrest Nexus
          </button>
        </div>
      </section>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');

  return (
    <div className='min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6'>
      <div className='w-full max-w-md border border-amber-500/30 bg-zinc-950 rounded-2xl p-8 shadow-2xl'>
        <div className='text-3xl font-bold text-amber-400 mb-2'>BlackCrest Nexus</div>
        <div className='text-zinc-400 mb-6'>Procurement Intelligence Operating System</div>

        <div className='space-y-4'>
          <input
            type='email'
            placeholder='Executive Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white'
          />

          <button
            onClick={() => onLogin(email || 'demo@blackcrest.ai')}
            className='w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg p-3 transition'
          >
            Access Platform
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchOverview(role).then((result) => {
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [role]);

  const kpis = useMemo(() => {
    if (!data) {
      return {
        atRiskSuppliers: 0,
        delayedPOs: 0,
        activeAlerts: 0,
      };
    }

    return {
      atRiskSuppliers: data.suppliers.filter((supplier) => supplier.riskScore > 65).length,
      delayedPOs: data.purchaseOrders.filter((po) => String(po.status || '').includes('LATE')).length,
      activeAlerts: data.alerts.length,
    };
  }, [data]);

  if (loading) {
    return <div className='p-6 text-zinc-200'>Loading procurement intelligence systems...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='grid md:grid-cols-3 gap-4'>
        {Object.entries(kpis).map(([key, value]) => (
          <div key={key} className='bg-zinc-900 border border-amber-600/30 p-4 rounded-xl'>
            <div className='text-xs uppercase tracking-wide text-zinc-400'>{key}</div>
            <div className='text-3xl text-amber-300 font-bold'>{value}</div>
          </div>
        ))}
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        <div className='bg-zinc-900 p-4 rounded-xl border border-zinc-700 h-72'>
          <h3 className='mb-4 text-amber-300'>Supplier Risk Radar</h3>
          <ResponsiveContainer>
            <BarChart data={data.suppliers}>
              <XAxis dataKey='supplierName' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='riskScore' fill='#f59e0b' />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-zinc-900 p-4 rounded-xl border border-zinc-700 h-72'>
          <h3 className='mb-4 text-amber-300'>Lead Time Trend</h3>
          <ResponsiveContainer>
            <LineChart data={data.suppliers}>
              <XAxis dataKey='supplierName' />
              <YAxis />
              <Tooltip />
              <Line dataKey='leadTimeAverage' stroke='#fcd34d' />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PlatformShell() {
  const [role, setRole] = useState('EXECUTIVE');
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-800 p-4 flex justify-between items-center'>
        <div>
          <div className='font-semibold text-amber-400 text-xl'>BlackCrest Nexus</div>
          <div className='text-xs text-zinc-500'>Procurement Intelligence Operating System</div>
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className='bg-zinc-900 border border-zinc-700 p-2 rounded-lg'
        >
          {roles.map((roleOption) => (
            <option key={roleOption}>{roleOption}</option>
          ))}
        </select>
      </header>

      <nav className='p-4 border-b border-zinc-800 space-x-6'>
        <NavLink to='/app'>Command Center</NavLink>
      </nav>

      <Dashboard role={role} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/app' element={<PlatformShell />} />
    </Routes>
  );
}

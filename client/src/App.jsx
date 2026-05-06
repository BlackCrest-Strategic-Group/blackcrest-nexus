import { NavLink, Route, Routes } from 'react-router-dom';
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
    const response = await fetch(
      `${API_BASE}/api/nexus/overview?role=${role}`
    );

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

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');

  return (
    <div className='min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6'>
      <div className='w-full max-w-md border border-amber-500/30 bg-zinc-950 rounded-2xl p-8 shadow-2xl'>
        <div className='text-3xl font-bold text-amber-400 mb-2'>
          BlackCrest Nexus
        </div>
        <div className='text-zinc-400 mb-6'>
          Procurement Intelligence Operating System
        </div>

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

        <div className='text-xs text-zinc-500 mt-6'>
          Demo authentication enabled. Because enterprise auth systems apparently enjoy exploding five minutes before demos.
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
      atRiskSuppliers: data.suppliers.filter(
        (supplier) => supplier.riskScore > 65
      ).length,
      delayedPOs: data.purchaseOrders.filter((po) =>
        String(po.status || '').includes('LATE')
      ).length,
      activeAlerts: data.alerts.length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className='p-6 text-zinc-200'>
        Loading procurement intelligence systems...
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='grid md:grid-cols-3 gap-4'>
        {Object.entries(kpis).map(([key, value]) => (
          <div
            key={key}
            className='bg-zinc-900 border border-amber-600/30 p-4 rounded-xl'
          >
            <div className='text-xs uppercase tracking-wide text-zinc-400'>
              {key}
            </div>
            <div className='text-3xl text-amber-300 font-bold'>
              {value}
            </div>
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

      <div className='bg-zinc-900 p-4 rounded-xl border border-zinc-700'>
        <h3 className='text-amber-300 mb-4'>Operational Alerts</h3>

        {data.alerts.map((alert) => (
          <div
            key={alert.id}
            className='border-b border-zinc-800 py-3'
          >
            <div className='text-amber-200 font-semibold'>
              {alert.alertType} ({alert.severity})
            </div>
            <div className='text-sm text-zinc-400'>
              {alert.aiSummary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Workflows() {
  return (
    <div className='p-6'>
      <div className='bg-zinc-900 border border-zinc-700 rounded-xl p-6'>
        <div className='text-2xl text-amber-300 mb-3'>
          Workflow Automation Center
        </div>

        <div className='text-zinc-400 mb-6'>
          Supplier escalation, sourcing acceleration, procurement analytics, and executive reporting modules are now stabilized for deployment demos.
        </div>

        <button
          className='bg-amber-500 text-black px-4 py-2 rounded-lg font-semibold'
          onClick={() => alert('Workflow simulation executed successfully.')}
        >
          Run Supplier Escalation Workflow
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('EXECUTIVE');
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-800 p-4 flex justify-between items-center'>
        <div>
          <div className='font-semibold text-amber-400 text-xl'>
            BlackCrest Nexus
          </div>
          <div className='text-xs text-zinc-500'>
            Procurement Intelligence Operating System
          </div>
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
        <NavLink to='/'>Command Center</NavLink>
        <NavLink to='/workflows'>Workflows</NavLink>
      </nav>

      <Routes>
        <Route path='/' element={<Dashboard role={role} />} />
        <Route path='/workflows' element={<Workflows />} />
      </Routes>
    </div>
  );
}

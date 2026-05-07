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
              AI Procurement Operations Platform
            </div>

            <h1 className='text-5xl md:text-7xl font-black leading-tight mb-6'>
              Procurement intelligence built for modern operations teams.
            </h1>

            <p className='text-xl text-zinc-400 mb-8 leading-relaxed'>
              BlackCrest Nexus combines procurement operations, sourcing intelligence, supplier analytics, RFQ workflows, executive visibility, and AI-assisted operational analysis into one enterprise-ready platform.
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
    </Routes>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import './styles.css';
import SentinelSecurityCenter from './components/SentinelSecurityCenter';

const executiveCards = [
  { id: 'supplier-response-time', label: 'Supplier Response Time', value: '14.8h', trend: '-11%', detail: 'Median response time across active sourcing events.', items: ['Critical suppliers >24h: 5', 'Fast-lane suppliers <8h: 18'] },
  { id: 'proposal-throughput', label: 'Proposal Throughput', value: '128/wk', trend: '+17%', detail: 'Qualified proposals processed this week.', items: ['Auto-qualified: 72', 'Awaiting review: 19'] },
  { id: 'open-ffp-packages', label: 'Open FFP Packages', value: '34', trend: '+4', detail: 'Firm-fixed-price packages currently open.', items: ['Late stage: 9', 'Over 30 days: 6'] },
  { id: 'savings-opportunities', label: 'Savings Opportunities', value: '$4.2M', trend: '+$640K', detail: 'Modeled savings from active negotiations.', items: ['Top category: Electronics', 'Quick wins: $840K'] },
  { id: 'supplier-risk', label: 'Supplier Risk', value: '6.1/10', trend: '-0.4', detail: 'Composite risk score across strategic suppliers.', items: ['High risk suppliers: 7', 'Mitigation plans active: 5'] },
  { id: 'category-exposure', label: 'Category Exposure', value: '42%', trend: '+2%', detail: 'Spend concentration in top 3 categories.', items: ['Direct materials: 18%', 'Logistics: 13%'] },
  { id: 'lead-time-risk', label: 'Lead-time Risk', value: '23 lots', trend: '+5', detail: 'Lots flagged for potential lead-time misses.', items: ['APAC lane risk: 9', 'Avg delay: 5.4 days'] },
  { id: 'proposal-backlog', label: 'Proposal Backlog', value: '57', trend: '-8', detail: 'Proposals still pending full evaluation.', items: ['Stalled >7 days: 14', 'Needs legal review: 11'] },
  { id: 'escalations', label: 'Escalations', value: '12', trend: '+3', detail: 'Escalations requiring executive action.', items: ['Supplier compliance: 5', 'Budget overrun: 2'] }
];

const suppliers = [
  { id: 's-1001', name: 'Apex Industrial Group', categories: ['Mechanical', 'MRO'], certifications: ['ISO 9001', 'AS9100'], capabilities: 'Precision machining, rapid prototyping', leadTime: '12 days', risk: 3.1 },
  { id: 's-1044', name: 'Helio Components', categories: ['Electronics', 'Semiconductors'], certifications: ['ISO 14001', 'RoHS'], capabilities: 'PCB assembly, microcontroller sourcing', leadTime: '18 days', risk: 5.6 },
  { id: 's-1103', name: 'Northline Logistics Supply', categories: ['Logistics', 'Packaging'], certifications: ['C-TPAT'], capabilities: 'Cold-chain packaging, expedited routes', leadTime: '7 days', risk: 4.2 },
  { id: 's-1150', name: 'Vector Energy Systems', categories: ['Energy', 'Facilities'], certifications: ['SOC 2', 'ISO 50001'], capabilities: 'Energy optimization, equipment maintenance', leadTime: '16 days', risk: 2.9 }
];

const navConfig = {
  Executive: [
    { label: 'Executive Command Center', path: '/modules/executive' },
    { label: 'Executive Reporting', path: '/reports/executive' }
  ],
  Marketplace: [
    { label: 'Supplier Marketplace', path: '/marketplace/home' },
    { label: 'Supplier Matching', path: '/marketplace/matching' }
  ],
  Admin: [
    { label: 'Tenant Settings', path: '/admin/tenant-settings' },
    { label: 'Role & Access', path: '/admin/roles' },
    { label: 'Audit Feed', path: '/admin/audit-feed' },
    { label: 'Sentinel Security Center', path: '/admin/sentinel-security' }
  ]
  Funding: [{ label: 'Funding Bridge', path: '/funding/bridge' }],
  Operations: [{ label: 'Notifications', path: '/operations/notifications' }],
  Admin: [{ label: 'Admin Controls', path: '/admin/controls' }]
};

const routeEntries = Object.values(navConfig).flat();

async function request(path, options = {}) { const res = await fetch(path, options); const json = await res.json(); if (!res.ok) throw new Error(json.error || 'Request failed'); return json; }

function CommandCenter() {
  return <section className="page"><h1>Executive Command Center</h1><p className="sub">Enterprise procurement telemetry with drill-down intelligence.</p>
    <div className="kpi-grid">{executiveCards.map((c) => <Link key={c.id} to={`/modules/executive/${c.id}`} className="kpi cardlink"><p>{c.label}</p><h3>{c.value}</h3><small>{c.trend}</small></Link>)}</div></section>;
}

function CardDetail() {
  const { cardId } = useParams();
  const card = executiveCards.find((c) => c.id === cardId);
  if (!card) return <Navigate to="/modules/executive" replace />;
  return <section className="card"><h2>{card.label}</h2><p>{card.detail}</p><div className="kpi-grid slim">{card.items.map((item) => <article className="kpi" key={item}><h3>{item}</h3></article>)}</div></section>;
}

function Marketplace() {
  return <section><h1>Supplier Marketplace</h1><p className="sub">Discover suppliers with capability, certification, category, lead-time, and risk visibility.</p>
    <div className="table-wrap"><table><thead><tr><th>Supplier</th><th>Capabilities</th><th>Certifications</th><th>Categories</th><th>Lead Time</th><th>Risk Score</th></tr></thead>
      <tbody>{suppliers.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.capabilities}</td><td>{s.certifications.join(', ')}</td><td>{s.categories.join(', ')}</td><td>{s.leadTime}</td><td>{s.risk}</td></tr>)}</tbody></table></div></section>;
}

function SupplierMatching() {
  const [q, setQ] = useState('');
  const filtered = suppliers.filter((s) => `${s.name} ${s.capabilities} ${s.categories.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return <section><h1>Supplier Matching</h1><div className="form-grid"><input placeholder="Search suppliers or capabilities" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <div className="module-grid">{filtered.map((s) => <article className="card" key={s.id}><h3>{s.name}</h3><p>{s.capabilities}</p><p><strong>Categories:</strong> {s.categories.join(', ')}</p><p><strong>Risk:</strong> {s.risk}</p><div className="profile"><button>Match Proposal Items</button><button>Compare</button><button>Request Quote</button></div></article>)}</div></section>;
}

function FundingBridge() {
  return <section><h1>Funding Bridge</h1><div className="module-grid"><article className="card"><h3>Procurement Package Analysis</h3><p>Analyze package complexity, urgency, and supplier confidence bands.</p></article><article className="card"><h3>Estimated Cash Flow Need</h3><h2>$8.7M</h2><p>Next 90 days projected procurement outflow requirement.</p></article><article className="card"><h3>Funding Request Tracking</h3><p>Open requests: 5 | Approved: 3 | Pending review: 2</p></article><article className="card"><h3>Lender/Vendor Partners</h3><p>Placeholder panel for partner APIs and underwriting integrations.</p></article></div></section>;
}

function Reports() { return <section><h1>Executive Reporting</h1><div className="module-grid">{['Executive Summaries', 'Sourcing Summaries', 'Supplier Risk Reports', 'Proposal Throughput Reports'].map((r) => <article key={r} className="card"><h3>{r}</h3><p>Generate and export board-ready PDF and spreadsheet snapshots.</p><button>Generate</button></article>)}</div></section>; }

function Notifications() { return <section><h1>Notification Center</h1><ul className="card">{['Escalation: FFP-2203 exceeds target price by 9%.', 'Approval needed: Packaging supplier onboarding.', 'Delay alert: Helio Components lead time slipped by 4 days.', 'Missing data: 3 proposal packages missing compliance docs.', 'Risk alert: Logistics lane disruption in APAC.'].map((n)=><li key={n}>{n}</li>)}</ul></section>; }

function AdminControls() { return <section><h1>Admin Controls</h1><div className="module-grid">{['Module Toggles', 'License Tier Controls', 'Organization Settings', 'Branding Controls'].map((m)=><article className="card" key={m}><h3>{m}</h3><label><input type="checkbox" defaultChecked/> Enabled</label></article>)}</div></section>; }

function DashboardShell({ auth, setAuth }) {
  const [profile, setProfile] = useState(null); const [role, setRole] = useState('admin'); const [search, setSearch] = useState('');
  const navigate = useNavigate();
  useEffect(() => { request('/api/auth/profile', { headers: { Authorization: `Bearer ${auth.accessToken}` } }).then((res) => setProfile(res.user)).catch(() => setAuth(null)); }, [auth.accessToken, setAuth]);
  const logout = async () => { await request('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: auth.refreshToken }) }); localStorage.removeItem('bc-auth'); setAuth(null); navigate('/login'); };
  const searchTargets = useMemo(() => ['suppliers','proposals','messages','risks','marketplace'], []);

  return <div><header className="topnav"><Link className="brand" to="/modules/executive">BlackCrest Nexus</Link>
    <div className="menu-row">{Object.entries(navConfig).map(([title, items]) => <details key={title} className="menu"><summary>{title}</summary><div className="menu-list">{items.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}</div></details>)}</div>
    <div className="profile"><input placeholder="Global search..." value={search} onChange={(e)=>setSearch(e.target.value)} /><span>{profile?.name || 'Loading'}</span><select value={role} onChange={(e)=>setRole(e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select><button onClick={logout}>Logout</button></div></header>
    {search && <section className="content"><article className="card"><h3>Global Search</h3><p>Searching across: {searchTargets.join(', ')}</p><p>Query: <strong>{search}</strong></p></article></section>}
    <main className="content"><Routes>
      <Route path="/" element={<Navigate to="/modules/executive" replace />} />
      <Route path="/modules/executive" element={<CommandCenter />} /><Route path="/modules/executive/:cardId" element={<CardDetail />} />
      <Route path="/marketplace/home" element={<Marketplace />} /><Route path="/marketplace/matching" element={<SupplierMatching />} />
      <Route path="/funding/bridge" element={<FundingBridge />} /><Route path="/reports/executive" element={<Reports />} />
      <Route path="/operations/notifications" element={<Notifications />} />
      <Route path="/admin/controls" element={role !== 'admin' ? <Navigate to="/modules/executive" replace /> : <AdminControls />} />
      {routeEntries.map((entry) => <Route key={entry.path} path={entry.path} element={<></>} />)}
    </Routes></main></div>;
}

function LoginPage({ onLogin }) { const [form, setForm] = useState({ email: 'demo@blackcrestai.com', password: 'password123' }); const [error, setError] = useState('');
  const submit = async (e) => { e.preventDefault(); setError(''); try { const data = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); onLogin(data); } catch (err) { setError(err.message); } };
  return <main className="content"><section className="card"><h1>Login</h1><form onSubmit={submit} className="form-grid"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="submit">Sign In</button>{error && <p>{error}</p>}</form></section></main>; }

function ProtectedRoute({ token, children }) { const location = useLocation(); if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />; return children; }

export default function App() { const [auth, setAuth] = useState(() => { const raw = localStorage.getItem('bc-auth'); return raw ? JSON.parse(raw) : null; });
  const onLogin = (data) => { const next = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }; localStorage.setItem('bc-auth', JSON.stringify(next)); setAuth(next); };
  return <BrowserRouter><Routes><Route path="/login" element={auth ? <Navigate to="/modules/executive" replace /> : <LoginPage onLogin={onLogin} />} /><Route path="/*" element={<ProtectedRoute token={auth?.accessToken}><DashboardShell auth={auth} setAuth={setAuth} /></ProtectedRoute>} /></Routes></BrowserRouter>; }
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import AppShell from './platform/AppShell';
import { apiRequest, getSystemHealth } from './services/api';
import { auditEvent } from './services/audit';
import { DEMO_ACCOUNTS, getStoredAuth, ROLES, setStoredAuth } from './services/auth';
import { makeNotice } from './services/notifications';

function Login({ onLogin }) {
  const [role, setRole] = useState('Buyer');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.Buyer.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.Buyer.password);
  const [error, setError] = useState('');

  const syncRole = (nextRole) => {
    setRole(nextRole);
    setEmail(DEMO_ACCOUNTS[nextRole].email);
    setPassword(DEMO_ACCOUNTS[nextRole].password);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const session = { ...data, user: { ...(data.user || {}), role } };
      setStoredAuth(session);
      await auditEvent('login', { role, email });
      onLogin(session);
    } catch (err) {
      setError(err.message);
    }
  };

  return (<div><header className="topnav"><Link className="brand" to="/modules/executive">BlackCrest Nexus</Link>
    <div className="menu-row">{Object.entries(navConfig).map(([title, items]) => <details key={title} className="menu"><summary>{title}</summary><div className="menu-list">{items.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}</div></details>)}</div>
    <div className="profile"><span>{profile?.name || 'Loading...'}</span><select value={role} onChange={(e) => setRole(e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select><button type="button" onClick={logout}>Logout</button></div></header>
    <main className="content">{message && <p>{message}</p>}
      <Routes><Route path="/" element={<Navigate to="/modules/executive" replace />} />
        <Route path="/profile" element={<section className="card"><h2>Profile</h2>{profile && <div className="form-grid"><input value={profile.name} onChange={(e)=>setProfile({...profile,name:e.target.value})}/><input value={profile.company||''} onChange={(e)=>setProfile({...profile,company:e.target.value})}/><button type="button" onClick={saveProfile}>Save Profile</button></div>}</section>} />
        {routeEntries.map((entry) => <Route key={entry.path} path={entry.path} element={entry.path === '/admin/sentinel-security'
          ? (role !== 'admin' ? <Navigate to="/modules/executive" replace /> : <SentinelSecurityCenter token={auth.accessToken} />)
          : (entry.group === 'Admin' && role !== 'admin' ? <Navigate to="/modules/executive" replace /> : <ShellPage entry={entry} role={role} />)} />)}
      </Routes></main></div>);
  return <main className="content"><section className="card"><h1>BlackCrest Nexus Login</h1><form className="form-grid" onSubmit={submit}>
    <label>Role<select value={role} onChange={(e) => syncRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
    <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
    <button type="submit">Sign in</button>{error && <p>{error}</p>}
  </form></section></main>;
}

export default function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [health, setHealth] = useState('checking');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    getSystemHealth().then(() => setHealth('healthy')).catch(() => setHealth('degraded'));
  }, []);

  useEffect(() => {
    setNotices((prev) => [...prev.slice(-2), makeNotice(health === 'healthy' ? 'ok' : 'warn', `System status: ${health}`)]);
  }, [health]);

  return <BrowserRouter><Routes>
    <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={setAuth} />} />
    <Route path="/*" element={auth ? <AppShell auth={auth} onLogout={() => setAuth(null)} notices={notices} /> : <Navigate to="/login" replace />} />
  </Routes></BrowserRouter>;
}

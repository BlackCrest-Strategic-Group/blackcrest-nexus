import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import SentinelSecurityCenter from './components/SentinelSecurityCenter';

const navConfig = {
  Modules: [
    { label: 'Executive Command Center', path: '/modules/executive' },
    { label: 'Sourcing Intelligence', path: '/modules/sourcing' },
    { label: 'Category Management', path: '/modules/category' }
  ],
  Views: [
    { label: 'Opportunity Radar', path: '/views/opportunity-radar' },
    { label: 'Supplier Scorecard', path: '/views/supplier-scorecard' },
    { label: 'Spend Lens', path: '/views/spend-lens' }
  ],
  Marketplace: [
    { label: 'Marketplace Home', path: '/marketplace/home' },
    { label: 'Supplier Network', path: '/marketplace/supplier-network' },
    { label: 'Integration Hub', path: '/marketplace/integrations' }
  ],
  Admin: [
    { label: 'Tenant Settings', path: '/admin/tenant-settings' },
    { label: 'Role & Access', path: '/admin/roles' },
    { label: 'Audit Feed', path: '/admin/audit-feed' },
    { label: 'Sentinel Security Center', path: '/admin/sentinel-security' }
  ]
};

const routeEntries = Object.entries(navConfig).flatMap(([group, items]) => items.map((item, index) => ({
  ...item,
  group,
  index
})));

async function request(path, options = {}) {
  const res = await fetch(path, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: 'demo@blackcrestai.com', password: 'password123', name: '', company: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = tab === 'login' ? { email: form.email, password: form.password } : form;
      const data = await request(`/api/auth/${tab}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return <main className="content"><section className="card"><h1>{tab === 'login' ? 'Login' : 'Register'}</h1>
    <div className="profile"><button type="button" onClick={() => setTab('login')}>Login</button><button type="button" onClick={() => setTab('register')}>Register</button></div>
    <form onSubmit={submit} className="form-grid">
      {tab === 'register' && <><input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></>}
      <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">{tab === 'login' ? 'Sign In' : 'Create Account'}</button>
      {error && <p>{error}</p>}
    </form></section></main>;
}

function ProtectedRoute({ token, children }) {
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function ShellPage({ entry, role }) {
  const stats = useMemo(() => ([['Open Actions', `${8 + entry.index}`], ['SLA Health', `${95 - entry.index}%`], ['Data Sources', `${5 + entry.index}`]]), [entry]);
  return (<section className="page"><h1>{entry.label}</h1><p className="sub">{entry.group} workspace for role: {role}.</p>
    <div className="kpi-grid slim">{stats.map(([label, value]) => <article key={label} className="kpi"><p>{label}</p><h3>{value}</h3></article>)}</div>
    <div className="card"><h3>Active Workflow</h3><ul><li>Review prioritized actions.</li><li>Route decisions to owners.</li><li>Export intelligence snapshot.</li></ul></div></section>);
}

function DashboardShell({ auth, setAuth }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    request('/api/auth/profile', { headers: { Authorization: `Bearer ${auth.accessToken}` } })
      .then((res) => setProfile(res.user))
      .catch(() => setAuth(null));
  }, [auth.accessToken, setAuth]);

  const logout = async () => {
    await request('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: auth.refreshToken }) });
    localStorage.removeItem('bc-auth');
    setAuth(null);
    navigate('/login');
  };

  const saveProfile = async () => {
    const res = await request('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.accessToken}` }, body: JSON.stringify({ name: profile.name, company: profile.company }) });
    setProfile(res.user);
    setMessage('Profile saved');
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
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('bc-auth');
    return raw ? JSON.parse(raw) : null;
  });

  const onLogin = (data) => {
    const next = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
    localStorage.setItem('bc-auth', JSON.stringify(next));
    setAuth(next);
  };

  return (<BrowserRouter><Routes><Route path="/login" element={auth ? <Navigate to="/modules/executive" replace /> : <LoginPage onLogin={onLogin} />} />
    <Route path="/*" element={<ProtectedRoute token={auth?.accessToken}><DashboardShell auth={auth} setAuth={setAuth} /></ProtectedRoute>} /></Routes></BrowserRouter>);
}

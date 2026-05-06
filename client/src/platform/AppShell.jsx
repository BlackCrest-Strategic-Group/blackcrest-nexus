import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { canAccess } from '../services/permissions';
import { auditEvent } from '../services/audit';
import { clearStoredAuth } from '../services/auth';

const modules = [
  { path: '/dashboard', label: 'Dashboard', area: 'dashboard' },
  { path: '/modules/executive', label: 'Executive Command Center', area: 'modules' },
  { path: '/modules/sourcing', label: 'Sourcing Intelligence', area: 'modules' },
  { path: '/modules/category', label: 'Category Management', area: 'modules' },
  { path: '/proposals', label: 'Proposals', area: 'proposals' },
  { path: '/messages', label: 'Messages', area: 'messages' },
  { path: '/audit', label: 'Audit Feed', area: 'audit' },
  { path: '/status', label: 'System Status', area: 'dashboard' }
];

function View({ title, subtitle }) { return <section className="card"><h2>{title}</h2><p className="sub">{subtitle}</p></section>; }

export default function AppShell({ auth, onLogout, notices }) {
  const role = auth?.user?.role || 'Buyer';
  const navigate = useNavigate();
  const location = useLocation();
  const nav = modules.filter((m) => canAccess(role, m.area));

  const logout = async () => {
    await auditEvent('logout', { role });
    clearStoredAuth();
    onLogout();
    navigate('/login');
  };

  return <div className="shell-layout">
    <aside className="sidebar">
      <div className="brand">BlackCrest Nexus</div>
      {nav.map((n) => <Link key={n.path} to={n.path} className={location.pathname === n.path ? 'active' : ''}>{n.label}</Link>)}
    </aside>
    <div>
      <header className="topnav"><strong>Enterprise Platform Shell</strong><div className="profile"><span>{auth.user.name} · {role}</span><button onClick={logout}>Logout</button></div></header>
      <div className="notice-zone">{notices.map((n) => <p key={n.id} className={`notice ${n.type}`}>{n.message}</p>)}</div>
      <main className="content"><Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<View title="Dashboard" subtitle="Cross-module operational status and priorities." />} />
        <Route path="/modules/executive" element={<View title="Executive Command Center" subtitle="Portfolio performance and decision queue." />} />
        <Route path="/modules/sourcing" element={<View title="Sourcing Intelligence" subtitle="Supplier and demand signals." />} />
        <Route path="/modules/category" element={<View title="Category Management" subtitle="Category plans, savings, and risk posture." />} />
        <Route path="/proposals" element={<View title="Proposals" subtitle="Generation, approvals, and exports." />} />
        <Route path="/messages" element={<View title="Messages" subtitle="Supplier and internal communications." />} />
        <Route path="/audit" element={canAccess(role, 'audit') ? <View title="Audit Feed" subtitle="Traceability across key actions." /> : <Navigate to="/dashboard" replace />} />
        <Route path="/status" element={<View title="System Status" subtitle="Live backend/API health signal." />} />
      </Routes></main>
    </div>
  </div>;
}

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Category Intelligence', '/category-intelligence'],
  ['Supplier Intelligence', '/supplier-intelligence'],
  ['Opportunity Intelligence', '/opportunity-intelligence'],
  ['Watchlist', '/watchlist'],
  ['History', '/history'],
  ['Profile', '/profile'],
  ['Settings', '/settings'],
  ['Security', '/security'],
  ['Privacy', '/privacy']
];

export default function AppShell({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const safeNavItems = Array.isArray(navItems) ? navItems : [];

  async function handleLogout() {
    if (typeof logout === 'function') {
      await logout();
    }
    navigate('/login', { replace: true });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">BLACKCREST</Link>
        <p className="muted">Procurement Intelligence Platform</p>
        <nav>
          {safeNavItems.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{label}</NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={handleLogout}>Log out</button>
        <small>Demonstration Environment – Uses synthetic and public data only</small>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

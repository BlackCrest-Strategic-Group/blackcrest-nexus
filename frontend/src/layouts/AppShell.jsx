import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  ['Privacy', '/privacy']
];

export default function AppShell({ children }) {
  const { logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">BLACKCREST</Link>
        <p className="muted">Procurement Intelligence Platform</p>
        <nav>
          {navItems.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{label}</NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={logout}>Log out</button>
        <small>Designed for Non-Classified Use Only</small>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

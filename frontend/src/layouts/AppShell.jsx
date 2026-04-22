import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = user?.navigation || [{ label: 'Dashboard', path: '/dashboard' }];

  return (
    <div className="shell">
      <aside className="sidebar">
        <h2 className="brand">BlackCrest OS</h2>
        <p className="muted">{user?.roleLabel || 'Procurement'} Workspace</p>
        <nav className="nav-list">
          {navItems.map(({ label, path }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{label}</NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={handleLogout}>Sign out</button>
        <small className="muted">Sentinel monitoring enabled. Built for non-classified workflows.</small>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

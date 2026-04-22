import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  ['Command Center', '/dashboard'],
  ['Intelligence', '/intelligence'],
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
    <div className="shell" data-testid="shell-root">
      <aside className="sidebar" data-testid="sidebar-nav">
        <Link to="/dashboard" className="brand" data-testid="brand-link">BlackCrest OpportunityOS</Link>
        <p className="muted">Powered by Truth Serum AI</p>
        <nav>
          {safeNavItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              data-testid={`nav-${path.replace('/', '') || 'home'}`}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={handleLogout} data-testid="logout-button">Log out</button>
        <small>Demonstration Environment – Uses synthetic and public data only</small>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

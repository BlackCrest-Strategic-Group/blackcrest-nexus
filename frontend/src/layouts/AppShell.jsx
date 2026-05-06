import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickActions = [
  { label: 'Generate Executive Report', path: '/report-center' },
  { label: 'Open ERP Connector Center', path: '/erp-connector-center' },
  { label: 'Open Funding Bridge', path: '/funding-bridge' },
  { label: 'Go to Blanket PO Builder', path: '/blanket-po-builder' },
  { label: 'View Data Boundary', path: '/data-boundary' }
];

export default function AppShell({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navWithMarketplace = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Procurement Intelligence', path: '/procurement-intelligence' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Insights', path: '/insights' },
    { label: 'Funding Bridge', path: '/funding-bridge' }
  ];

  return (
    <div className="shell" data-testid="shell-root">
      <aside className="sidebar glass-panel">
        <h2 className="brand">BlackCrest OS</h2>
        <p className="muted">{user?.roleLabel || 'Procurement'} Workspace</p>
        <nav className="nav-list">
          {navWithMarketplace.map(({ label, path }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={handleLogout} data-testid="logout-button">Sign out</button>
        <small className="muted">Sentinel monitoring enabled. Built for non-classified workflows.</small>
      </aside>

      <main className="content dashboard-transition">{children}</main>

      <aside className="action-sidebar glass-panel">
        <h3>Action Center</h3>
        <p className="muted">Next best actions across executive, sourcing, and buyer workflows.</p>
        <div className="action-list">
          {quickActions.map((action) => (
            <button key={action.path} className="btn ghost action-btn" onClick={() => navigate(action.path)}>{action.label}</button>
          ))}
        </div>
        <div className="card nested">
          <p className="metric-label">AI Insight Feed</p>
          <ul className="timeline-list">
            <li>Leakage risk increased 3.8% in IT peripherals.</li>
            <li>Supplier concentration threshold exceeded in electromechanical category.</li>
            <li>RFP queue contains 2 compliance-sensitive events due this month.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

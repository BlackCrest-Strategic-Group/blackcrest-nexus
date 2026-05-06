import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';

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
    { label: 'Audit Feed', path: '/admin/audit-feed' }
  ]
};

function ShellPage({ title, summary, stats, actions }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="sub">{summary}</p>
      <div className="kpi-grid slim">
        {stats.map(([label, value]) => (
          <article key={label} className="kpi"><p>{label}</p><h3>{value}</h3></article>
        ))}
      </div>
      <div className="card">
        <h3>Active Workflow</h3>
        <ul>
          {actions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </div>
    </section>
  );
}

const routeEntries = Object.entries(navConfig).flatMap(([group, items]) => items.map((item, index) => ({
  ...item,
  element: (
    <ShellPage
      title={item.label}
      summary={`BlackCrest Nexus ${group} workspace with live enterprise-ready interface components.`}
      stats={[
        ['Open Actions', `${8 + index}`],
        ['SLA Health', `${95 - index}%`],
        ['Data Sources', `${5 + index}`]
      ]}
      actions={[
        'Review AI-prioritized actions from current reporting cycle.',
        'Confirm procurement decisions and route to owners.',
        'Export/share intelligence snapshot with leadership.'
      ]}
    />
  )
})));

function NavMenu({ title, items }) {
  return (
    <details className="menu">
      <summary>{title}</summary>
      <div className="menu-list">
        {items.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}
      </div>
    </details>
  );
}

function DashboardShell() {
  return (
    <div>
      <header className="topnav">
        <Link className="brand" to="/modules/executive">BlackCrest Nexus</Link>
        <div className="menu-row">
          <NavMenu title="Modules" items={navConfig.Modules} />
          <NavMenu title="Views" items={navConfig.Views} />
          <NavMenu title="Marketplace" items={navConfig.Marketplace} />
          <NavMenu title="Admin" items={navConfig.Admin} />
        </div>
        <div className="profile">
          <span>Procurement Lead</span>
          <button type="button">Profile</button>
          <button type="button">Logout</button>
        </div>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/modules/executive" replace />} />
          {routeEntries.map((entry) => <Route key={entry.path} path={entry.path} element={entry.element} />)}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DashboardShell />
    </BrowserRouter>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  ['Platform', '/features'],
  ['Procurement Intelligence', '/procurement-intelligence'],
  ['Truth Serum', '/truth-serum'],
  ['Sentinel', '/sentinel'],
  ['Insights', '/insights'],
  ['Security', '/security'],
  ['About', '/about'],
  ['Contact', '/contact']
];

export default function MarketingLayout({ children }) {
  return (
    <div className="marketing-site">
      <header className="marketing-header">
        <div className="container row between center">
          <Link to="/" className="brand-lockup" aria-label="BlackCrest Nexus home">
            <img src="/logos/blackcrest-logo.svg" alt="BlackCrest Nexus logo" className="brand-logo" />
            <div>
              <strong>BlackCrest Nexus</strong>
              <span>Industrial Intelligence for Modern Operators</span>
            </div>
          </Link>
          <nav className="marketing-nav" aria-label="Primary">
            {navLinks.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
          </nav>
          <div className="row">
            <Link className="btn" to="/demo">Enter Live Demo</Link>
            <Link className="btn ghost" to="/contact">Request Demo</Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <div className="container footer-grid">
          <div>
            <h3>BlackCrest Nexus</h3>
            <p>Industrial intelligence systems built for manufacturers, procurement teams, supply chain leaders, and operational decision makers.</p>
            <p>Email: demo@blackcrestai.com</p>
          </div>
          <div>
            <h4>Platform Modules</h4>
            <ul>
              <li><Link to="/procurement-intelligence">Procurement Intelligence</Link></li>
              <li><Link to="/truth-serum">Truth Serum</Link></li>
              <li><Link to="/sentinel">Sentinel Governance</Link></li>
              <li><Link to="/global-intelligence">Global Intelligence</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4>BlackCrest Insights</h4>
            <ul>
              <li><Link to="/insights/industrial-intelligence-for-modern-manufacturing">Industrial Intelligence for Manufacturing</Link></li>
              <li><Link to="/insights/how-ai-improves-supplier-intelligence">AI & Supplier Intelligence</Link></li>
              <li><Link to="/insights/how-to-evaluate-procurement-opportunities-faster">Operational Procurement Strategy</Link></li>
              <li><Link to="/insights/procurement-intelligence-vs-spend-analytics">Procurement vs Spend Analytics</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

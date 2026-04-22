import React from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  ['Features', '/features'],
  ['Supplier Intelligence', '/supplier-intelligence'],
  ['Opportunity Intelligence', '/opportunity-intelligence'],
  ['Sourcing Intelligence', '/sourcing-intelligence'],
  ['Proposal Intelligence', '/proposal-intelligence'],
  ['Government Contracting', '/government-contracting'],
  ['Insights', '/insights'],
  ['About', '/about'],
  ['Contact', '/contact']
];

export default function MarketingLayout({ children }) {
  return (
    <div className="marketing-site">
      <header className="marketing-header">
        <div className="container row between center">
          <Link to="/" className="brand-lockup" aria-label="BlackCrest OS home">
            <img src="/logos/blackcrest-logo.svg" alt="BlackCrest OS logo" className="brand-logo" />
            <div>
              <strong>BlackCrest OS</strong>
              <span>AI Procurement Intelligence Platform</span>
            </div>
          </Link>
          <nav className="marketing-nav" aria-label="Primary">
            {navLinks.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
          </nav>
          <div className="row">
            <Link className="btn ghost" to="/login">Sign In</Link>
            <Link className="btn" to="/contact">Request a Demo</Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <div className="container footer-grid">
          <div>
            <h3>BlackCrest OS</h3>
            <p>AI Procurement Intelligence Platform for procurement teams, sourcing managers, manufacturers, defense contractors, and supply chain leaders.</p>
            <p>Email: demo@blackcrest.ai</p>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/supplier-intelligence">Supplier Intelligence</Link></li>
              <li><Link to="/opportunity-intelligence">Opportunity Intelligence</Link></li>
              <li><Link to="/sourcing-intelligence">Sourcing Intelligence</Link></li>
              <li><Link to="/proposal-intelligence">Proposal Intelligence</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/government-contracting">GovCon</Link></li>
            </ul>
          </div>
          <div>
            <h4>Insights</h4>
            <ul>
              <li><Link to="/insights/what-is-procurement-intelligence">What Is Procurement Intelligence?</Link></li>
              <li><Link to="/insights/procurement-intelligence-vs-spend-analytics">Procurement Intelligence vs Spend Analytics</Link></li>
              <li><Link to="/insights/how-ai-improves-supplier-intelligence">How AI Improves Supplier Intelligence</Link></li>
              <li><Link to="/insights/how-to-evaluate-procurement-opportunities-faster">Evaluate Opportunities Faster</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

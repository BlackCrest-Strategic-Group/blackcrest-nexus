import React from 'react';
import SeoHead from '../components/SeoHead';

export default function SettingsPage() {
  return (
    <section>
      <SeoHead title="Settings | BlackCrest OS" description="Profile, integrations, MFA controls, notifications, and audit logs." canonicalPath="/settings" />
      <div className="page-header"><h1>Settings</h1><p>User profile, organization controls, integrations, and trust configuration.</p></div>
      <div className="grid three">
        <article className="card"><h3>User & organization</h3><p>Profile, organization settings, and subscription management.</p></article>
        <article className="card"><h3>Security controls</h3><p>MFA settings, session management, and notification controls.</p></article>
        <article className="card"><h3>Integration architecture</h3><p>Token-based API integrations and read-only ERP connector patterns.</p></article>
      </div>
      <article className="card"><h3>Trust notice</h3><p>Designed with security-first architecture principles. Built for non-classified procurement workflows.</p></article>
    </section>
  );
}

import React from 'react';

export default function Marketplace() {
  return (
    <main className="auth-page">
      <section className="auth-card" style={{ maxWidth: '720px' }}>
        <h1>Marketplace (Early Access)</h1>
        <p>
          The BlackCrest Marketplace is currently in early access. Join the waitlist to get first access to vetted suppliers,
          intelligent matching, and streamlined quote workflows.
        </p>
        <button type="button" className="btn">Request Early Access</button>
      </section>
    </main>
  );
}

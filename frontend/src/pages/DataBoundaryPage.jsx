import React from 'react';

export default function DataBoundaryPage() {
  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Data Boundary & Clean Room</h1>
      <ul>
        <li>Public/synthetic demo data by default.</li>
        <li>User-controlled uploads and optional ERP connectors.</li>
        <li>Read-only connector posture by default.</li>
        <li>Customer IT/security approval recommended before production sync.</li>
        <li>No hardcoded customer credentials.</li>
        <li>Tenant scoping and audit trail architecture.</li>
        <li>Subscription/seat gate maintained.</li>
        <li>NIST-aligned design intent.</li>
        <li>Designed for non-classified procurement workflows.</li>
        <li>Customer-controlled ERP integration model using clean-room architecture principles.</li>
      </ul>
    </main>
  );
}

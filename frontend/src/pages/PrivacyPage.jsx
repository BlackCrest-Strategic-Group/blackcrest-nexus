import React from 'react';

export default function PrivacyPage() {
  return <div className="card"><h1>Privacy Policy</h1><p>BlackCrest Procurement Intelligence Platform is designed with a privacy-first architecture.</p><ul><li>No default data retention for uploaded documents; PDFs are processed in memory and not persisted unless structured outputs are explicitly saved.</li><li>Token-based architecture using environment-secured secrets for API authentication and request authorization.</li><li>User-controlled storage: only structured analysis outputs are retained when users click Save.</li><li>User deletion capability is provided for analyses, suppliers, and category snapshots.</li><li>BlackCrest does not resell customer data.</li><li>Minimal metadata logging only; no sensitive raw procurement document content is intentionally logged.</li></ul><p><b>Designed for Non-Classified Use Only</b></p></div>;
}

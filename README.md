# BlackCrest Procurement Intelligence Operating System

BlackCrest AI is an investor-demo-ready Procurement Intelligence Operating System that turns RFPs, supplier data, purchase history, and ERP exports into executive decisions, buyer actions, margin leak alerts, and sourcing recommendations.

## Who it is for
- CEO
- Procurement Director
- Category Manager
- Sourcing Manager
- Buyer
- Purchasing Assistant

## Current working demo capabilities
- Role-based dashboard views for each procurement role.
- Procurement ingestion engine for CSV/XLS/XLSX uploads (PO history, supplier master, item master, pricing files, RFP pricing sheets, blanket planning files).
- Margin leak detection and alerting with role ownership.
- Supplier recommendation engine using public/uploaded/synthetic data.
- RFP analysis reporting outputs.
- ERP Connector Center with customer-controlled profile configuration.
- Report Export Center with preview, JSON export, CSV export (where applicable), and print-friendly output.
- Investor demo mode with one-click narrative data load.

## Demo/synthetic vs production-ready
### Demo/synthetic by default
- Investor demo seed data.
- Public/sample/synthetic supplier catalog.
- Demo ERP connector profiles.

### Production-ready patterns already in place
- Auth, billing, subscription gates, seat gates.
- Governance and Sentinel QA routes/workflows.
- Supplier intelligence, opportunity intelligence, watchlist, and blanket PO builder baseline features.
- Optional ERP adapter payload preview architecture.

## ERP connector architecture
Supported providers in Connector Center:
- SAP
- Oracle
- Infor / Syteline
- Microsoft Dynamics
- CSV / SFTP export
- Manual upload

Default connector posture:
- read-only by default
- token-based credential placeholders
- customer IT/security approval status
- mapping preview

## Security and data boundary statement
- Public/synthetic demo data by default.
- Confidential customer data is only ingested when a customer intentionally uploads data or configures approved connectors.
- Customer-controlled ERP integration model.
- NIST-aligned design intent.
- Designed for non-classified procurement workflows.
- Clean-room architecture principles.

## Local setup
```bash
npm install
npm run check:syntax
npm test -- --runInBand
cd frontend && npm install --include=dev && npm run build
```

## Environment variables
- `JWT_SECRET`
- `MONGODB_URI` (required for persistence)
- `MONGO_URI` (optional compatibility alias)
- `OPENAI_API_KEY` (recommended for AI intelligence features)
- `STRIPE_SECRET_KEY` (billing)
- `BLANKET_PO_BUILDER_URL` (optional ERP/blanket export bridge)

## Investor demo walkthrough
See [`docs/INVESTOR_DEMO_SCRIPT.md`](docs/INVESTOR_DEMO_SCRIPT.md).

## Valuation readiness playbook
See [`docs/VALUATION_1_5M_PLAYBOOK.md`](docs/VALUATION_1_5M_PLAYBOOK.md) for an actionable plan to improve enterprise sale readiness while preserving security controls.

## Commercial proof & valuation operations
- Plan packaging endpoint: `GET /api/billing/plans`
- Commercial proof snapshot: `GET /api/billing/commercial-proof` (auth required)
- Weekly reliability + ROI snapshot: `GET /api/billing/weekly-reliability-roi` (auth required)
- Weekly markdown report generation: `npm run report:weekly`
- Data room template: [`docs/INVESTOR_DATA_ROOM.md`](docs/INVESTOR_DATA_ROOM.md)
- Security trust center index: [`docs/SECURITY_TRUST_CENTER.md`](docs/SECURITY_TRUST_CENTER.md)

## Roadmap (no overpromises)
- Expand ERP adapters from profile + payload preview to approved live connectors.
- Add tenant-level workflow templates and deeper analytics benchmarking.
- Add enterprise-ready connector key vault workflows.


## Sentinel Governance Layer (Phase 1)
Sentinel now operates as both an integrated platform capability and a modular architecture layer suitable for future extraction.

### Sentinel capabilities now included
- Central intelligence engine for explainable procurement alerts.
- Clickable alert drilldowns (`/api/sentinel/alerts/:alertId`) with root cause, source signals, impact, confidence, timeline, and audit metadata.
- Margin Leak Detection Engine (weekly, monthly, annualized leakage estimates with top drivers and supplier exposure).
- Supplier Risk Radar with explainable health scoring and mitigation guidance.
- Executive Narrative Engine for concise operational summaries.
- Role-aware intelligence scoping for Buyer, Manager, Director, Executive, and Admin views.
- Sentinel audit activity feed with upload/analysis/export/search/alert interaction/role change/admin event coverage.
- Data classification support tags: Internal, Confidential, Proprietary, ITAR, CUI, Export Controlled.

### Architecture references
- Sentinel modular services: `server/sentinel/services/*`
- Sentinel architecture notes: [`docs/SENTINEL_ARCHITECTURE_NOTES.md`](docs/SENTINEL_ARCHITECTURE_NOTES.md)

## Security philosophy (enterprise-safe defaults)
- Read-only intelligence layer (decision support only).
- Human-in-the-loop recommendation workflow.
- No autonomous PO creation or autonomous procurement execution.
- No customer data used for shared AI model training.
- Governance-first route protections (auth + seat limits + audit capture + rate limiting).

## Demo instructions
1. Run backend and frontend locally:
   - `npm install`
   - `npm run dev:full`
2. Authenticate with a demo role and open `/intelligence`.
3. Use the role switcher to preview Buyer/Manager/Director/Executive/Admin intelligence views.
4. Click any alert in the Executive Alert Center to open intelligence drilldown details.

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
- `MONGO_URI`
- `OPENAI_API_KEY` (optional)
- `STRIPE_SECRET_KEY` (billing)
- `BLANKET_PO_BUILDER_URL` (optional ERP/blanket export bridge)

## Investor demo walkthrough
See [`docs/INVESTOR_DEMO_SCRIPT.md`](docs/INVESTOR_DEMO_SCRIPT.md).

## Roadmap (no overpromises)
- Expand ERP adapters from profile + payload preview to approved live connectors.
- Add tenant-level workflow templates and deeper analytics benchmarking.
- Add enterprise-ready connector key vault workflows.

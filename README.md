# BlackCrest Nexus

Industrial Intelligence for Modern Operators.

BlackCrest is a modular industrial intelligence ecosystem built for manufacturers, procurement teams, sourcing leaders, distributors, aerospace suppliers, and operational decision makers.

The platform combines procurement intelligence, supplier visibility, operational analytics, and enterprise AI governance into one scalable operational environment.

## Platform Modules

### Procurement Intelligence
- Supplier intelligence
- RFQ and sourcing workflows
- Procurement dashboards
- Opportunity qualification
- ERP-ready operational visibility

### Truth Serum
- Operational analytics
- Predictive intelligence
- KPI forecasting
- Risk visibility
- Executive operational reporting

### Sentinel
- Enterprise AI governance
- Audit visibility
- Role-based permissions
- Governance workflows
- Operational security controls

## Platform Positioning
BlackCrest is designed to provide enterprise-level operational visibility without enterprise-level complexity.

The platform focuses on practical operational outcomes:
- Reduced procurement friction
- Faster sourcing decisions
- Improved supplier visibility
- Better operational awareness
- Explainable operational intelligence

## Current Capabilities
- Procurement opportunity analysis
- Supplier intelligence workflows
- Operational dashboards
- Role-based governance
- ERP connector center
- Executive reporting
- Investor demo environment
- Operational insights content engine

## Security & Governance Philosophy
- Human-in-the-loop operational decision support
- Governance-first architecture
- Customer-controlled data ingestion
- Read-only operational intelligence posture
- Designed for non-classified operational environments

## Local Setup
npm install
npm run check:syntax
npm test -- --runInBand
cd frontend && npm install --include=dev && npm run build

## Mission
To build industrial intelligence systems that help the businesses that actually build things operate faster, smarter, and with greater visibility.

## Marketplace module (B2B supplier discovery)

### API endpoints
- `GET /api/marketplace/categories`
- `GET /api/marketplace/suppliers?category=paper-and-packaging&location=Chicago&q=packaging`
- `GET /api/marketplace/suppliers/:id`
- `POST /api/marketplace/suppliers` (admin permission required)
- `POST /api/marketplace/request`

### Example API calls
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/marketplace/categories
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/marketplace/suppliers?location=Houston"
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"productNeeded":"Corrugated cartons","quantity":"10000","location":"Dallas, USA","urgency":"2 weeks","email":"buyer@company.com"}' \
  http://localhost:3000/api/marketplace/request
```

### Seed suppliers
```bash
node server/scripts/seedMarketplace.js
```

### Frontend routes
- `/marketplace` (home)
- `/marketplace/category/:slug`
- `/marketplace/supplier/:id`

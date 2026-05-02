# BlackCrest Technical Handoff Summary

## Stack
- Frontend: React / Vite
- Backend: Node.js / Express
- Database: MongoDB / Mongoose
- Authentication: JWT
- Billing: Stripe framework
- AI: OpenAI integration framework
- File ingestion: CSV and document upload support
- Deployment target: Render or similar Node-compatible hosting

## Core Backend Areas
- Authentication and tenant structure
- Dashboard APIs
- Supplier intelligence routes
- Opportunity intelligence routes
- Procurement intelligence routes
- Live procurement upload analysis
- Sentinel governance routes
- Billing and subscription framework
- Demo mode routes
- Watchlist functionality
- ERP connector center services
- Report generation services

## Core Frontend Areas
- Public marketing pages
- Acquisition room
- Investor demo mode
- Login/register flow
- Role-based dashboard
- Supplier views
- Opportunity views
- Governance/Sentinel views
- Report center
- ERP connector center
- Data boundary page
- Blanket PO builder

## Integration Model
The platform is designed to connect with ERP/procurement data through staged maturity:

1. CSV/export upload
2. Scheduled file ingestion
3. Read-only API connector
4. ERP partner integration
5. White-label enterprise deployment

Potential ERP targets include SAP, Oracle, Infor, NetSuite, Epicor, Microsoft Dynamics, and other procurement or ERP environments.

## Buyer Notes
The current system should be treated as an early-stage product foundation, not a fully deployed enterprise SaaS with live customer ERP data. Its strongest commercial path is to connect the existing workflow and intelligence logic to real procurement datasets.

## Recommended Next Engineering Steps
1. Add one-click sample data loading to the investor demo.
2. Add a public sample ERP CSV download.
3. Add automated smoke tests for the main public pages and API health route.
4. Add screenshots to a dedicated marketing asset folder.
5. Add a docker-compose local demo profile.
6. Tighten install docs so a buyer can run the platform in under 30 minutes.
7. Separate strategic acquisition rights from codebase-only transfer language.

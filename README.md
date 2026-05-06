# BlackCrest Nexus

Standalone production-ready SaaS foundation for enterprise procurement and supply chain operations.

## Stack
- React + Vite frontend (`/client`)
- Node.js + Express backend (`/server`)
- Render deployment via `render.yaml`
- Mock data only (no API keys, no ERP integrations)

## Project Structure
/
├── client/
├── server/
├── package.json
├── render.yaml
├── README.md
└── .gitignore

## Scripts
- `npm run install-all` installs root + client + server dependencies
- `npm run build` builds the Vite frontend
- `npm start` starts the Express server

## Local Setup
1. `npm run install-all`
2. `npm run build`
3. `npm start`
4. Open `http://localhost:3000`

## Backend APIs
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/suppliers`
- `POST /api/proposals`

## Render Deployment
1. Push this repository to GitHub.
2. Create a new **Web Service** on Render.
3. Render auto-detects `render.yaml`.
4. Build command: `npm run install-all && npm run build`
5. Start command: `npm start`

## Modules Included
1. Executive Dashboard
2. Procurement Intelligence
3. Sourcing Command Center
4. Supplier Marketplace
5. Proposal Generator
6. Funding Bridge
7. ERP Connector Center
8. Settings

All module routes are functional in-app and use mock data flows.

# BlackCrest Nexus

BlackCrest Nexus is a modular enterprise procurement platform with a shared application shell, centralized services, role-based access controls, and Render-compatible deployment.

## Architecture Overview
- **Frontend (`client/`)**: React + Vite with centralized app shell (`client/src/platform/AppShell.jsx`), role-aware navigation, module routing, notification zone, and system status indicator.
- **Frontend Services (`client/src/services/`)**: reusable auth, api, audit, permissions, storage, and notifications service modules.
- **Backend (`server/`)**: Express service with `/api/*` endpoints and root `/health` endpoint.
- **Backend Foundations**:
  - `server/services/auditService.js` centralized audit event tracking.
  - `server/services/platformServices.js` reusable service registry (auth/api/audit/permissions/storage/notifications).
  - `server/middleware/roleGuard.js` role-based middleware for Admin/Executive/Buyer/Supplier/Auditor.
  - `server/models/sharedDataModel.js` mock shared schema foundation.

## Setup
1. Install dependencies:
   - `npm run install-all`
2. Build frontend:
   - `npm run build`
3. Start platform:
   - `npm start`
4. Open:
   - `http://localhost:3000`

## Environment Template
Use `.env.example` as baseline. Minimum recommended keys:
- `PORT=3000`
- `NODE_ENV=production`

## Core Endpoints
- `GET /health`
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/audit/events`
- `GET /api/audit/events`
- `POST /api/proposals`

## Demo Roles
- Admin
- Executive
- Buyer
- Supplier
- Auditor

## Render Compatibility
- Build command: `npm run install-all && npm run build`
- Start command: `npm start`
- Static frontend build remains served by Express from `client/dist`.

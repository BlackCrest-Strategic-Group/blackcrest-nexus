# BlackCrest ProcurementOS – Architecture Map (Phase 1)

Date: 2026-04-25

## 1) Frontend structure

### Primary frontend app
- `frontend/` is the modern Vite frontend.
- UI remains unchanged in this phase; no route or workflow redesign was performed.
- Major feature surfaces currently live in large component files (see Technical Debt report).

### Legacy/static frontend assets
- `public/` contains legacy/static pages and assets still used in some flows.
- This phase preserved compatibility for existing user journeys.

## 2) Backend structure

### Runtime entry
- `server.js` boots environment, DB connectivity, and starts `server/app.js`.
- Static frontend serving is still handled by `server.js` for deployment compatibility.

### Express composition (`server/app.js`)
Cross-cutting middleware ordering (non-breaking):
1. Security headers + CORS + body parsers
2. Request context (`x-request-id`)
3. Structured request logging
4. API sanitization
5. General API rate limiter
6. Clean-room compliance guard
7. Audit trail capture
8. Feature routes
9. Not-found handler
10. Centralized error handler

### New architecture boundaries (scaffolding)
The following domain folders now define stable boundaries for future modular extraction:
- `server/ai/orchestration/`
- `server/procurement/services/`
- `server/sourcing/services/`
- `server/supplier/services/`
- `server/analytics/services/`

These currently re-export existing service behavior to preserve parity.

## 3) Auth flow
1. Client sends Bearer token to protected API endpoints.
2. `authRequired` verifies JWT and resolves user + tenant context.
3. Role metadata and permissions are attached to `req.user`.
4. Route guards (`subscriptionGate`, `seatGate`, etc.) apply feature access controls.

Phase 1 update:
- Added `authRateLimiter` on `/api/auth` to reduce brute-force pressure while preserving endpoint behavior.

## 4) AI orchestration flow
Current flow:
- Route -> Controller -> `server/services/aiService.js` (provider call with fallback heuristics)

Phase 1 boundary:
- `server/ai/orchestration/aiOrchestrationService.js` introduced as a stable import boundary for future agent-routing and provider abstraction.

## 5) Procurement workflow structure
Current operational flow (unchanged):
- Upload/API request -> controller -> ingestion/analysis services -> dashboard/report responses.

Phase 1 hardening:
- Added upload validation middleware for spreadsheet uploads (extension + mimetype + non-empty checks).
- Added generic request validation middleware for route-level parameter checks.

## 6) Stability and compatibility notes
- No route removals.
- No auth flow redesign.
- No dashboard workflow removals.
- No deployment model changes (Render + Vite + Node/Express + MongoDB preserved).
- Environment-variable usage patterns preserved.

## 7) Next safe passes
1. Extract oversized route/controller files into route-local modules.
2. Converge duplicated business logic between `backend/` and `server/` via adapters.
3. Standardize validation and sanitization on all mutation endpoints.
4. Expand AI orchestration contracts per module (Sourcing, Supplier, Category, GovCon, Executive).

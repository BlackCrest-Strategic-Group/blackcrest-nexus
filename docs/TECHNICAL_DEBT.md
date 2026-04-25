# Technical Debt Report (Phase 1)

Date: 2026-04-25

## Scope and non-breaking constraints
- This pass intentionally preserves all existing routes, controllers, auth/session flows, dashboards, APIs, uploads, and user workflows.
- Refactors were limited to cross-cutting middleware composition, security hardening, and architecture boundary scaffolding.

## High-priority debt identified

### 1) Oversized files (maintenance risk)
Top oversized files discovered with a simple line-count audit:
- `frontend/src/components/LoginPage.jsx` (871)
- `frontend/src/components/ProposalGenerator.jsx` (835)
- `backend/routes/auth.js` (757)
- `backend/routes/mfa.js` (745)
- `backend/services/intelligenceService.js` (559)
- `backend/services/opportunityScoringEngine.js` (503)

**Impact:** Harder reviews, brittle edits, slower onboarding, higher regression risk.

**Safe next pass:** Extract view helpers, form sections, and route handlers into feature-local service/controller modules while preserving route contracts.

### 2) Parallel backend stacks (coupling/consistency risk)
There are at least two active backend trees (`backend/` and `server/`) with overlapping concerns (auth, opportunity intelligence, suppliers, uploads).

**Impact:** Route inconsistencies, duplicated logic, divergent security posture.

**Safe next pass:** Introduce adapters and a migration map to converge shared business logic into reusable services without changing external API paths.

### 3) Mixed validation patterns
Some routes have strong guards, while others rely on controller-level assumptions.

**Impact:** Increased chance of malformed payload handling and hidden 500s.

**Safe next pass:** Adopt `validateRequest` systematically on mutation endpoints, with route-local validators.

### 4) Upload surface hardening opportunities
Upload flows already apply extension checks and size limits, but file-type and empty-file checks were inconsistent.

**Impact:** Elevated risk of unsafe or malformed file ingestion.

**Safe next pass:** Reuse `validateSpreadsheetUpload` across all spreadsheet upload points; add secure parsing limits in parsing services.

### 5) Error and logging fragmentation
Different logging styles (`console.log/warn/error`) appear across modules.

**Impact:** Harder incident correlation and alerting.

**Safe next pass:** Move critical service flows to centralized structured logging while preserving existing log semantics.

### 6) AI orchestration boundary is thin
AI calls are present in service modules but domain orchestration boundaries are still emerging.

**Impact:** Hard to evolve toward multi-agent ProcurementOS modules.

**Safe next pass:** route -> controller -> domain-service -> ai-orchestrator layering with strict DTO contracts.

## Security posture updates included in this pass
- Centralized request-id assignment and structured request logging.
- Centralized API input sanitization (trim + prototype-pollution key stripping).
- Dedicated auth rate limiting separate from general API limits.
- Centralized error handler for safer API failures.
- Upload validation middleware now enforces extension + mimetype + non-empty payload checks.

## TODO markers for ProcurementOS target modules
- TODO(ProcurementOS): AI Sourcing Command Center orchestration policies.
- TODO(ProcurementOS): Supplier Intelligence risk lifecycle orchestration.
- TODO(ProcurementOS): Executive Procurement Dashboard KPI materialization.
- TODO(ProcurementOS): ERP Connector Layer state synchronization.
- TODO(ProcurementOS): Procurement Agent Framework policy/runtime.

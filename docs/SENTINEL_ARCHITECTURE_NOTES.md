# Sentinel Governance + Procurement Intelligence Architecture Notes

## Platform framing
BlackCrest operates as **Procurement Intelligence Infrastructure**: a read-only decision layer that transforms procurement signals into explainable operational intelligence.

## Sentinel Governance Layer (modularized for extraction)
Sentinel services now live under `server/sentinel/services` so the governance stack can be extracted into its own service in a later phase:
- `intelligenceEngine.js` — central intelligence object generation.
- `marginLeakIntelligence.js` — margin leakage estimation + top drivers.
- `supplierRiskRadar.js` — explainable supplier health scoring.
- `executiveNarrativeEngine.js` — executive-focused summaries.
- `roleIntelligenceFilter.js` — role-aware alert scope.
- `sentinelAuditFeed.js` — audit activity stream (upload, search, export, role changes, admin events).

## Intelligence object model
Each intelligence alert supports:
- id/type/severity/title/summary
- rootCause + sourceSignals
- financialImpact
- confidenceScore
- recommendedActions
- createdAt + timeline/history
- affectedEntities
- auditReference + dataClassification
- AI reasoning summary
- governance controls (read-only / HITL / autonomous action blocked)

## Security philosophy
- Governance-first, read-only intelligence layer.
- Human-in-the-loop recommendations only.
- No autonomous purchasing execution.
- No customer data used for shared model training.
- Data classification labels are visible in UI/API responses.

## Render/deployment safety
Changes are additive, preserve existing route structure, and maintain current server startup + static/frontend build flow.

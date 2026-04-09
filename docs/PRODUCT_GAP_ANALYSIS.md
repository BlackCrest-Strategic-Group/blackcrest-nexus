# GovCon AI Product Gap Analysis

This document captures the highest-value gaps between the current platform and a stronger enterprise-ready product.

## What already exists

The current application already includes:

- opportunity scoring
- opportunity evaluation
- proposal generation
- ERP connections
- supplier performance and recommendation routes
- workflow and dashboard routes
- MFA and JWT auth

That means the product is already beyond a simple scanner. It is now closer to an operating layer for federal capture and proposal teams.

## Highest-priority missing capabilities

### 1. One-click Pursue / Partner / Pass decisioning
**Problem:** The platform has scoring and evaluation, but not a single executive-ready summary endpoint that combines win probability, resource strain, compliance risk, margin view, and partner need.

**Target outcome:**
A single `should-we-bid` style workflow that returns:
- recommendation: `PURSUE`, `PURSUE_WITH_PARTNER`, or `PASS`
- win probability
- top 3 reasons
- top 3 risks
- estimated proposal effort
- margin range
- partner recommendation when capability gaps exist

**Acceptance criteria:**
- one API call can power the whole summary panel
- response is deterministic even when some fields are missing
- response clearly separates data-backed findings from inferred findings

### 2. Past performance and incumbent intelligence
**Problem:** Current logic does not appear to include contract history, incumbent trend analysis, or competitor pattern detection.

**Target outcome:**
- identify likely incumbent
- identify repeat winners on similar work
- compare company profile against likely competitors
- estimate displacement difficulty

**Acceptance criteria:**
- opportunity review includes incumbent confidence
- repeat-agency and repeat-NAICS patterns are surfaced
- competitive pressure is reflected in win probability

### 3. Pricing and margin intelligence
**Problem:** Proposal generation exists, but there is not yet a strong pricing benchmark layer.

**Target outcome:**
- estimate target price range
- highlight probable underpricing or overpricing
- compare labor and burden assumptions to historical ranges

**Acceptance criteria:**
- pricing output can be used in a finance review
- estimates include confidence bands
- clear warning when pricing input quality is weak

### 4. Teaming recommendation engine
**Problem:** Users need to know when not to bid alone.

**Target outcome:**
- identify capability gaps
- suggest partner types needed to close the gaps
- rank teaming rationale

**Acceptance criteria:**
- output distinguishes subcontractor need vs strategic JV / teammate need
- partner rationale references set-aside, capability, past performance, or capacity

### 5. Executive dashboard layer
**Problem:** Route coverage exists, but the executive story should be stronger.

**Target outcome:**
- portfolio-level win probability view
- resource strain view
- no-bid leakage view
- reasons opportunities are being passed
- upcoming bottlenecks in capture/proposal staffing

### 6. Red-team and compliance hardening
**Problem:** Compliance logic exists, but proposal-quality red-team analysis should become more explicit.

**Target outcome:**
- detect missing sections
- detect unsupported claims
- flag probable disqualification issues
- provide a submission readiness score

### 7. Collaboration and approvals
**Problem:** Workflow routes exist, but the product should clearly support role-based decision stages.

**Target outcome:**
- capture review
- contracts review
- finance review
- executive approval
- proposal release approval

## Recommended build order

### Phase 1: Revenue-facing improvements
1. should-we-bid summary endpoint
2. pricing and margin intelligence
3. executive dashboard summary cards

### Phase 2: Differentiation improvements
1. incumbent and competitor intelligence
2. teaming recommendation engine
3. proposal red-team scoring

### Phase 3: Enterprise stickiness
1. approvals and role-based workflow states
2. audit-friendly decision histories
3. export-ready review packets for leadership

## Positioning implication

The platform should be framed less as a "proposal scanner" and more as a:

> Win-rate optimization and bid-decision platform for federal contractors.

That positioning matches the product direction better and gives room for executive dashboards, partner recommendations, and pricing intelligence without sounding like feature bloat.

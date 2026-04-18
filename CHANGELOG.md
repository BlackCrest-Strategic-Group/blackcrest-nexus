# CHANGELOG

## Refactor: GovCon Scanner → BlackCrest Opportunity & Funding Intelligence Engine

### Removed
- SAM.gov API route mounting from `server.js` (`/api/sam-search`).
- SAM-based search/debug logic from core opportunities workflow.
- Federal-first dashboard/search UI pathways (replaced with upload → intelligence → funding flow).

### Added
- Curated lender dataset: `backend/data/lenders.js`.
- Opportunity analysis service: `backend/services/opportunityAnalysisService.js`.
- Funding matching service: `backend/services/fundingMatchService.js`.
- Funding routes: `POST /api/funding/match`, `POST /api/funding/request` in `backend/routes/funding.js`.
- Funding lead persistence model: `backend/models/FundingLead.js`.
- New app experience in dashboard with:
  - Upload Opportunity
  - Opportunity Intelligence Results
  - Funding Paths & Lender Matches
  - "Explore Funding Options" submission modal/form.

### Renamed / Repositioned
- Product naming updated to **BlackCrest Opportunity & Funding Intelligence Engine**.
- Package renamed to `blackcrest-opportunity-funding-intelligence-engine`.
- Keywords updated to opportunity/funding intelligence focus.

### TODOs
- Add admin review workflow for funding lead triage and status updates.
- Add richer lender fit rules (historical close rates, geographic fit, covenant tolerance).
- Expand opportunity extraction with OCR and structured field extraction.

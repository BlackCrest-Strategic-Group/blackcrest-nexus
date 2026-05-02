# Funding Marketplace Build Plan

## Product Direction
BlackCrest Funding Marketplace is the Redneck Robin Hood layer of BlackCrest: take capital-access tools that usually serve large, polished companies and put them in front of small businesses, contractors, suppliers, and operators trying to compete above their weight class.

The product must be aggressive in mission but disciplined in compliance. BlackCrest should package, score, route, and introduce. It should not claim to lend, underwrite, advise, or guarantee funding.

## Current MVP Added On Branch

### Frontend
- `frontend/src/pages/marketing/FundingMarketplacePage.jsx`
- Public routes:
  - `/funding-marketplace`
  - `/funding`
  - `/capital-access`
- Homepage module and CTA updates in `HomePage.jsx`

### Backend
- `server/routes/fundingMarketplaceRoutes.js`
- Mounted at `/api/funding-marketplace`

### API Endpoints
- `GET /api/funding-marketplace/partners`
- `POST /api/funding-marketplace/readiness-score`
- `POST /api/funding-marketplace/package`
- `POST /api/funding-marketplace/introduction-request`

## Next Engineering Steps

### 1. Add Persistence
Create Mongo models:
- `FundingBusinessProfile`
- `FundingReadinessScore`
- `FundingPartner`
- `FundingIntroductionRequest`
- `FundingPackage`

Store each submitted intake instead of returning only a response.

### 2. Add Admin Review
Create an internal admin page for funding leads:
- View submitted funding profiles
- Filter by readiness band
- Filter by funding need type
- Mark as new, reviewing, submitted to partner, declined, or closed
- Add internal notes

Suggested protected route:
- `/admin/funding-leads`

### 3. Add Funding Partner Portal
Partner profile fields:
- Partner name
- Funding types offered
- Geography served
- Industry preferences
- Minimum deal size
- Maximum deal size
- Minimum years in business
- Minimum revenue
- Required documents
- Contact email

Partner workflow:
- Review leads
- Accept lead
- Request more info
- Decline lead

### 4. Add Document Upload
Allow businesses to upload supporting documents:
- Bank statements
- Tax returns
- Financial statements
- Purchase orders
- Award notices
- Capability statement
- Customer references

Do not send documents to partners automatically without user consent.

### 5. Add Funding Package Export
Generate PDF or printable package with:
- Business overview
- Opportunity summary
- Use of funds
- Requested amount
- Readiness score
- Recommended funding categories
- Document checklist
- Compliance disclaimer

### 6. Add Matching Logic
Initial rule-based matching:
- Inventory/materials -> PO financing
- Invoice/cashflow/payroll -> factoring or working capital
- Equipment/tools/vehicles -> equipment financing
- Grant/training/innovation -> grant support
- Strong operating history -> bank/SBA
- Underserved/local/small business support -> CDFI

Later matching:
- Use partner eligibility rules
- Score partner fit
- Show top matches
- Track conversion outcomes

### 7. Compliance Controls
Required language:
- BlackCrest is not a lender
- BlackCrest does not guarantee approval
- BlackCrest does not set rates or terms
- Funding partner decides eligibility and terms
- Any compensation or referral relationship should be disclosed

Avoid:
- Guaranteed funding
- Approval odds
- Best rates
- No credit check claims
- Investment matching without legal review
- Success fees without legal review

## Revenue Model

### Business Revenue
- Free intake profile
- Paid funding readiness report
- Paid funding package export
- Monthly membership for procurement + funding workflows
- Premium opportunity-backed capital package review

### Partner Revenue
- Paid marketplace listing
- Featured category placement
- Partner portal subscription
- Qualified lead fee, only after legal review
- Success fee, only after legal review

## Launch Wedge
Opportunity-backed funding readiness for small companies trying to win bigger work.

Do not market this as generic small business loans. Market it as capital access tied to real contracts, purchase orders, sourcing opportunities, and expansion needs.

## Brand Voice
Strong, working-class, direct, anti-gatekeeper, pro-small-business.

Example:

> Big companies have bankers, consultants, and capital teams. Small businesses get forms, silence, and a polite rejection. BlackCrest Funding Marketplace helps operators turn real opportunities into funding-ready packages and capital conversations.

## Build Priority
1. Persist submitted funding profiles.
2. Build admin funding lead inbox.
3. Add PDF/package export.
4. Build partner directory management.
5. Build partner portal.
6. Add document upload.
7. Add matching rules.
8. Add paid plans.

# Funding Marketplace Execution Roadmap

## Goal
Build BlackCrest Funding Marketplace as a capital-access layer for small businesses, contractors, suppliers, distributors, and operators pursuing larger opportunities.

The marketplace should help businesses understand capital needs, build a funding-ready package, and connect with appropriate funding partners without BlackCrest acting as the lender.

## Phase 1: Readiness Marketplace, Not Lending Marketplace

### Objective
Launch as a funding-readiness and introduction platform.

### What BlackCrest Does
- Collect business funding profiles
- Score funding readiness
- Estimate opportunity-linked capital needs
- Generate funding packages
- Suggest funding categories
- Connect users with listed funding partners

### What BlackCrest Does Not Do Initially
- Underwrite loans
- Set loan terms
- Promise approval
- Hold funds
- Collect repayments
- Give financial advice
- Sell securities
- Act as a licensed broker unless legal review confirms the path

## Phase 2: Business User Workflow

### User Journey
1. Business creates a profile.
2. Business selects or uploads an opportunity.
3. Business answers funding-readiness questions.
4. Platform calculates readiness score and likely capital need.
5. Platform recommends funding categories.
6. User builds a funding package.
7. User requests partner introductions.
8. Partner reviews the structured package and responds.

### Required Business Profile Fields
- Business name
- Contact information
- Industry
- Location
- Entity type
- Years in business
- Revenue range
- Certifications
- Contract history
- Current opportunity type
- Funding amount needed
- Funding timeline
- Use of funds
- Documentation status

## Phase 3: Funding Partner Workflow

### Partner Journey
1. Partner creates marketplace profile.
2. Partner defines funding types offered.
3. Partner defines eligible industries, states, deal sizes, and minimum criteria.
4. Partner receives qualified lead packages.
5. Partner accepts, declines, or requests more information.
6. Business and partner continue process outside BlackCrest or through secure marketplace messaging in later versions.

### Partner Types
- Banks
- Credit unions
- SBA lenders
- CDFIs
- Factoring companies
- Purchase order financing providers
- Equipment finance companies
- Grant support firms
- Bonding support providers
- GovCon financing specialists
- Strategic capital partners

## Phase 4: MVP Feature List

### Frontend Pages
- `/funding-marketplace`
- `/funding-profile`
- `/funding-readiness`
- `/funding-package-builder`
- `/funding-partners`
- `/partner-portal`

### Backend APIs
- `POST /api/funding/profile`
- `GET /api/funding/profile/:id`
- `POST /api/funding/readiness-score`
- `POST /api/funding/package`
- `GET /api/funding/partners`
- `POST /api/funding/introduction-request`

### Data Models
- BusinessFundingProfile
- FundingReadinessScore
- FundingPartner
- FundingPackage
- IntroductionRequest

## Phase 5: Monetization

### Business Side
- Free profile
- Paid funding readiness package
- Monthly subscription for procurement + capital workflow
- Premium document package generation

### Partner Side
- Paid partner listing
- Premium placement by category/geography
- Partner portal subscription
- Qualified lead fee, subject to legal review
- Success fee, only after legal review

## Phase 6: Compliance Guardrails

### Required Boundaries
- No guaranteed funding claims
- No rate promises unless provided directly by partner
- No approval promises
- No advice telling users which financing product is best
- No securities/investment matching without legal review
- Clear disclosure that BlackCrest is not the lender
- Clear disclosure if marketplace compensation exists

### Suggested Disclaimer
BlackCrest Funding Marketplace provides business intelligence, funding-readiness workflows, and marketplace introduction support. BlackCrest is not a lender, financial advisor, securities advisor, tax advisor, legal advisor, or guaranteed funding source. Funding decisions, rates, terms, fees, and approvals are determined solely by independent funding partners.

## Phase 7: First Launch Version

### Build First
- Landing page
- Business funding intake form
- Funding readiness score
- Funding package PDF/export
- Static partner directory
- Manual introduction request form
- Admin view of funding leads

### Do Not Build First
- Payments between funders and businesses
- Automated underwriting
- Loan offer comparison engine
- Securities marketplace
- Direct investment portal
- Full messaging system

## Phase 8: Expansion

### After Validation
- Add partner portal
- Add secure document upload
- Add CRM-style partner lead management
- Add qualification rules
- Add accounting/ERP read-only connector
- Add grant/CDFI/SBA matching logic
- Add funding package tracking
- Add marketplace analytics

## Strategic Summary
Start with funding readiness and introductions. Become trusted by small businesses first. Then onboard funding partners who want cleaner, better-qualified deal flow.

The winning wedge is not simply “small business loans.” The wedge is opportunity-backed funding readiness for companies trying to win and execute larger contracts.

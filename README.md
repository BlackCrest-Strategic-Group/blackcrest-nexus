# BLACKCREST PROCUREMENT INTELLIGENCE PLATFORM

Production-style SaaS platform for upstream category intelligence, midstream supplier/opportunity intelligence, and downstream decision support.

## Core Modules
- Category Intelligence (analysis + save snapshots + history)
- Supplier Intelligence (profiles, evaluation, comparison-ready scoring)
- Opportunity / RFP Intelligence (PDF in-memory processing + text paste)
- Decision Center dashboard (integrated widgets + actions)
- Watchlist system (category/supplier/opportunity with statuses)

## Privacy-First Architecture
- No default document storage (PDF uploads handled in memory via multer memory storage)
- Stateless analysis responses by default
- User-controlled storage only for structured outputs (Save actions)
- Token-based auth via environment variables (`JWT_SECRET`, API keys)
- Data segregation using dedicated models
- Delete capability available by module APIs
- Minimal metadata-oriented logging expectation
- Product disclaimer: **Designed for Non-Classified Use Only**

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- React + Vite frontend

## Project Structure
```
/server
  routes/
  controllers/
  services/
  models/
  middleware/
/frontend/src
  pages/
  components/
  layouts/
  services/
  context/
```

## Required Environment Variables
Create `.env` in repo root:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blackcrest
JWT_SECRET=replace-with-strong-secret
OPENAI_API_KEY=optional-for-future-ai-service
```

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```
2. Start frontend + backend in dev:
   ```bash
   npm run dev:full
   ```
3. Or production build:
   ```bash
   npm run build:frontend
   npm start
   ```

## Database Models
- User
- UserPreferences
- CategorySnapshot
- SupplierProfile
- SupplierAnalysis
- OpportunityAnalysis
- WatchlistItem
- ActionItem

Only structured outputs are persisted.

## Demo Readiness
- Demo data is seeded automatically on first successful user auth.
- Includes sample category snapshot, suppliers, opportunity analysis, and action items.

## BlackCrest Sentinel (Internal QA + Digital Beta Tester)
BlackCrest Sentinel is the internal automated QA subsystem that continuously tests the product like a real user and creates a demo-readiness signal for the May 11, 2026 live demo.

### What Sentinel covers
- Landing page load and blank-screen checks
- Login flow, protected route enforcement, session persistence, and logout
- Major app navigation and intelligence tab rendering integrity
- Intelligence sub-tab uniqueness validation (to catch reused/duplicate tab state)
- Upload + analysis workflow smoke coverage
- Mobile viewport smoke test
- Monitoring for console errors, page errors, failed API responses, and stuck loading states

### Sentinel structure
```
/qa
  /playwright
    /tests
  /fixtures
  /reports
    /screenshots
    /videos
    /summaries
  /utils
```

### Install + run
```bash
# root dependencies
npm install

# install Playwright browser binaries (first-time setup)
npx playwright install

# full Sentinel suite
npm run sentinel

# smoke suite only
npm run sentinel:smoke

# regenerate summary from latest reports
npm run sentinel:report

# print Markdown summary to terminal
npm run sentinel:summary
```

### Sentinel environment variables
- `SENTINEL_BASE_URL` (default: `http://127.0.0.1:3000`)
- Optional persona credential overrides:
  - `SENTINEL_DEMO_DAN_EMAIL`, `SENTINEL_DEMO_DAN_PASSWORD`
  - `SENTINEL_BUYER_BECKY_EMAIL`, `SENTINEL_BUYER_BECKY_PASSWORD`
  - `SENTINEL_ADMIN_ALLEN_EMAIL`, `SENTINEL_ADMIN_ALLEN_PASSWORD`
  - `SENTINEL_CHAOS_CARL_EMAIL`, `SENTINEL_CHAOS_CARL_PASSWORD`
  - `SENTINEL_MOBILE_MIKE_EMAIL`, `SENTINEL_MOBILE_MIKE_PASSWORD`

### Where Sentinel reports live
- Failure screenshots: `qa/reports/screenshots`
- Failure videos (on failure): `qa/reports/videos` (Playwright artifact output)
- Structured error JSON logs: `qa/reports/summaries/*.error.json`
- Run-level summary:
  - `qa/reports/summaries/demo-readiness.json`
  - `qa/reports/summaries/demo-readiness.md`

### Demo Readiness scoring (0–100)
Sentinel computes a weighted score each run:
- Auth reliability: 30%
- Navigation stability: 25%
- Upload/analysis success: 20%
- Console/network cleanliness: 15%
- Mobile/UI sanity: 10%

Lower scores indicate increased demo risk. The summary output includes plain-English recommendations for both technical and non-technical reviewers.

## Key Routes
Frontend:
- `/`
- `/login`
- `/register`
- `/dashboard`
- `/category-intelligence`
- `/supplier-intelligence`
- `/opportunity-intelligence`
- `/watchlist`
- `/history`
- `/profile`
- `/settings`
- `/privacy`

API:
- `/api/auth/*`
- `/api/dashboard`
- `/api/category-intelligence/*`
- `/api/supplier-intelligence/*`
- `/api/opportunity-intelligence/*`
- `/api/watchlist/*`
- `/api/profile`
- `/api/settings`
- `/api/history`

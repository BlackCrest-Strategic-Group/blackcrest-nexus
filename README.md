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

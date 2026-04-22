# BlackCrest OpportunityOS
## Powered by Truth Serum AI

BlackCrest OpportunityOS is a procurement decision operating system built as **the Bloomberg Terminal for Procurement Intelligence**. It unifies opportunity intelligence, supplier intelligence, risk intelligence, sourcing intelligence, and executive decision support.

## Platform Modules
- **Executive Command Center** (live procurement health, risk, and financial signal dashboard)
- **Opportunity Intelligence Engine** (bid/no-bid plus pursue/avoid/renegotiate/diversify style actions)
- **Procurement Memory Graph** (relationship intelligence across suppliers, contracts, commodities, agencies, margins, and risks)
- **AI Procurement Agents** (capture, supplier, compliance, risk, commodity, margin, forecasting, executive briefing, contract, and cost reduction)
- **Executive AI Briefings** (concise recommendations with financial impact projections)

## Current Architecture
### Frontend
- React + Vite
- Tailwind-ready styling surface + premium dark-mode command UI
- Animated command center widgets and intelligence cards

### Backend
- Node.js + Express
- JWT auth middleware + rate limiting + security middleware
- Modular route/controller/service structure
- Tokenized integration pattern for enterprise connectors

### Data + Intelligence
- MongoDB models for operational data (current implementation)
- Procurement Memory Graph abstraction in dashboard payloads
- OpenAI-ready AI service integration points

## Security & Compliance Posture
- Helmet + CORS hardening + API rate limiting
- Token-based authentication
- No plaintext credentials in code
- Non-classified use boundary
- NIST-aligned and SOC2-ready architecture patterns (implementation roadmap in docs)

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Run frontend + backend:
   ```bash
   npm run dev:full
   ```

## Key Routes
### Frontend
- `/` landing page (premium marketing surface)
- `/dashboard` executive command center
- `/intelligence`
- `/category-intelligence`
- `/supplier-intelligence`
- `/opportunity-intelligence`

### API
- `/api/auth/*`
- `/api/dashboard`
- `/api/category-intelligence/*`
- `/api/supplier-intelligence/*`
- `/api/opportunity-intelligence/*`
- `/api/watchlist/*`

## Notes
- This repository includes legacy and experimental directories; active app paths remain `/server` and `/frontend`.
- Designed for non-classified procurement intelligence workflows.

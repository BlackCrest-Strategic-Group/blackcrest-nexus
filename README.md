# BlackCrest Procurement Intelligence Operating System

Enterprise SaaS platform for procurement teams and defense contractors to make **bid/no-bid**, **win-probability**, **supplier**, **risk**, and **financial** decisions.

## Core Decision Outcomes

The platform returns actionable recommendations for:

- Should we pursue this opportunity?
- What is the probability of winning?
- What will it cost?
- What margin can we achieve?
- Which suppliers should we use?
- What risks exist?
- What strategy improves win probability?

## Platform Architecture

- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Frontend:** React + Vite
- **Security:** JWT auth, bcrypt password hashing, rate limiting, helmet, input validation
- **Decision Stack:**
  - `samService.js` opportunity context ingestion
  - `aiService.js` narrative/heuristic scoring
  - `supplierService.js` supplier intelligence scoring
  - `decisionEngine.js` bid/no-bid + financial model
  - `truthEngine.js` persistent historical insights

## API Endpoints (Core)

All endpoints below require JWT unless otherwise noted.

- `POST /api/analyze-opportunity`
- `POST /api/analyze-text`
- `GET /api/opportunities`
- `GET /api/suppliers`
- `POST /api/decision-score`
- `GET /api/truth-insights`
- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)

## Local Setup

```bash
npm install
cp .env.example .env   # create manually if not present
npm run build:frontend
npm start
```

Open: `http://localhost:3000`

### Minimum environment variables

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/blackcrest
JWT_SECRET=replace-with-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
```

## Render Deployment

1. Create a new Render Web Service connected to this repo.
2. Configure environment variables from the list above.
3. Build command:
   ```bash
   npm install && npm run build:frontend
   ```
4. Start command:
   ```bash
   npm start
   ```
5. Ensure MongoDB connection string is reachable from Render.

## Product Experience

- **Public users:** see a gated landing page with locked preview metrics.
- **Authenticated users:** access full dashboard with live decision analysis.
- **Dashboard outputs:** recommendation, win probability, risk score, estimated cost, expected margin, supplier recommendations, and strategy actions.

## Security Controls

- JWT-based access control (`Authorization: Bearer <token>`)
- Password hashing via `bcryptjs`
- Request rate limiting (`express-rate-limit`)
- Secure headers via `helmet`
- API input validation and centralized error handling

## Operational Notes

- Background opportunity ingestion cron starts on server boot.
- If `MONGODB_URI` is unset, persistence features are unavailable.

## Disclaimer

Decision outputs are advisory analytics for procurement planning and should be validated against organizational compliance, legal, and finance controls.

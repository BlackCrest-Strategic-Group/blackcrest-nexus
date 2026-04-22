# BlackCrest OpportunityOS v2.0

AI-powered procurement opportunity intelligence operating system for federal and commercial teams. Evaluate opportunities, suppliers, and risks with Truth Serum AI decision support.

## Architecture

- **Backend**: Node.js + Express (`server.js`) on port **5000**, serving both API and built React frontend
- **Frontend**: React 18 + Vite + Tailwind CSS (built to `frontend/dist/`, served by backend)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Intelligence Microservice**: Python 3 + FastAPI (optional, port 8000)
- **Auth**: JWT with refresh tokens + MFA support

## Project Layout

```
/                   Root — server.js, package.json, tracer.js
backend/
  config/           DB connection
  models/           Mongoose schemas (User, Opportunity, etc.)
  routes/           Express API routes
  services/         Business logic (SAM.gov, email, document parsing)
  scripts/          Seed scripts
frontend/           React + Vite app
  src/components/   UI components
  src/pages/        Main views
  src/utils/        API clients & auth helpers
  dist/             Built output (served by backend)
intelligence/       Python FastAPI microservice
docs/               OpenAPI spec & documentation
public/             Static assets and fallback HTML
```

## Running the App

- **Workflow**: `Start application` — runs `node server.js` on port 5000
- **Build frontend**: `cd frontend && npm run build` (must be done before server can serve React)
- Frontend dev server (standalone): `cd frontend && npm run dev` on port 5173 (proxies /api to port 5000)

## Key Environment Variables

Set via Replit secrets/env vars:
- `PORT=5000`
- `NODE_ENV=development`
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `SAM_API_KEY` — SAM.gov API key
- `DD_ENABLED=false` — Datadog APM (disabled by default)

## Demo Account

Seeded automatically on startup: `demo@blackcrestopportunityos.com`

## API Docs

- Interactive explorer: `/api-docs`
- OpenAPI YAML: `/api-docs/openapi.yaml`
- API Reference: `/api-reference`

## External APIs

- SAM.gov OpenGov API (opportunities search)
- USASpending.gov, SBIR.gov, Grants.gov
- Stripe (payments)
- Nodemailer/SendGrid (email digests)

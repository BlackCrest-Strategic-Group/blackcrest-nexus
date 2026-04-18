# BlackCrest Opportunity & Funding Intelligence Engine

Cross-industry AI workflow for opportunity analysis and funding path recommendations.

## What it does

1. Upload an opportunity document (PDF, DOCX, TXT) or paste text.
2. Generate opportunity intelligence:
   - Opportunity summary
   - Estimated value range
   - Complexity level
   - Timeline risk
   - Execution risk
   - Margin potential band
   - Go / No-Go score
3. Generate funding intelligence:
   - Funding readiness score
   - Recommended funding types
   - Curated lender matches
4. Submit an "Explore Funding Options" request for follow-up.

## Architecture

- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Frontend:** React + Vite + Tailwind CSS
- **Core Services:** document parsing, opportunity analysis, scoring, curated lender matching

## Key API Endpoints

- `POST /api/opportunities/analyze`
- `POST /api/opportunities/score`
- `POST /api/funding/match`
- `POST /api/funding/request`
- `POST /api/auth/login`
- `GET /health`

## Quick start

```bash
npm install
cp .env.example .env
npm run build:frontend
npm start
```

Then open `http://localhost:3000`.

## Environment notes

Required in production:

- `MONGODB_URI`
- `JWT_SECRET`

The platform no longer depends on SAM.gov search configuration.

## Render deployment

`render.yaml` compatibility is preserved. Build/start commands remain:

- Build: `npm install && npm run build:frontend`
- Start: `npm start`

## Disclaimer

Outputs are decision-support estimates for opportunity planning and capital access workflows. They are not legal, financial, or underwriting decisions.

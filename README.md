# BlackCrest AI Opportunity Intelligence Platform v3.0

> Multi-market opportunity intelligence for federal, commercial, and hybrid teams

**Built by [BlackCrest Sourcing Group](https://blackcrestsourcing.com)**

---

## Features

- 🔍 **SAM.gov Opportunity Search** — search by NAICS code, keyword, PSC, set-aside, and date range
- 📄 **Document Analysis** — upload PDF / DOCX or paste text for instant bid/no-bid scoring
- 🎯 **Bid Scoring Engine** — FAR/DFARS intelligence scores each opportunity 0–100
- 📧 **Daily Email Digest** — automated opportunity delivery via SMTP or SendGrid
- 🔐 **JWT Authentication** — secure login / registration with refresh tokens
- 💾 **MongoDB Persistence** — users, saved opportunities, email preferences
- ⚡ **React + Tailwind CSS** — modern responsive frontend with both logos
- 🧠 **Opportunity Intelligence** — cross-database trend analysis across SAM.gov, USASpending.gov, SBIR.gov, and Grants.gov

## Quick Start

```bash
# 1. Install backend dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, SAM API key, and outbound email credentials

# 3. Build frontend
npm run build:frontend

# 4. Start server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Required Environment Variables

The following environment variables **must** be set before the server will start in production:

| Variable | Description | How to generate |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com) (free tier available) |
| `JWT_SECRET` | Secret used to sign authentication tokens (min 32 chars) | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

> **Production:** The server exits immediately with `[FATAL]` if either variable is missing.
> **Development:** If `JWT_SECRET` is absent, the server falls back to an insecure placeholder and logs a warning. Never deploy with this fallback.

See [`.env.example`](.env.example) for the full list of optional variables and their descriptions.

## Development

```bash
# Backend (with hot-reload)
npm run dev

# Frontend (Vite HMR, in a separate terminal)
cd frontend && npm run dev
```

## Documentation

See [docs/SETUP.md](docs/SETUP.md) for full setup, API reference, and deployment instructions.

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login and get JWT |
| `POST /api/auth/logout` | Logout |
| `GET /api/auth/profile` | Get current user |
| `POST /api/opportunities/search` | Search SAM.gov by NAICS |
| `POST /api/opportunities/analyze` | Analyze document |
| `GET /api/opportunities` | Get saved opportunities |
| `GET /api/opportunity-intelligence` | Get opportunity intelligence report |
| `POST /api/opportunity-intelligence/refresh` | Refresh from all federal databases |
| `POST /api/email-preferences/preferences/update` | Set email preferences |
| `POST /api/email/send-daily-digest` | Trigger daily email |
| `GET /health` | Health check |

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Nodemailer
- **Frontend:** React 18, React Router, Tailwind CSS, Vite, Axios
- **Services:** SAM.gov OpenGov API, SMTP / SendGrid
- **Monitoring:** Datadog APM (optional)

- **Services:** SAM.gov, USASpending.gov, SBIR.gov, Grants.gov, SMTP / SendGrid
- **Intelligence:** Multi-source NAICS-filtered opportunity analysis with trend scoring (also available as a standalone Python/FastAPI microservice in `intelligence/`)
- **Monitoring:** Datadog APM (optional)

## Pricing & Payments

BlackCrest AI includes a **30-day free trial** with full access to all features.

After the trial period, users are directed to upgrade via Stripe:

**Stripe Payment Link:** `https://buy.stripe.com/aFa7sK8peh2l4Up8aVf7i02`

Set this link in your environment:

```env
STRIPE_PAYMENT_LINK=https://buy.stripe.com/aFa7sK8peh2l4Up8aVf7i02
```

## Disclaimer

Designed for Non-Classified Use Only. BlackCrest AI provides preliminary analysis and does not replace professional contract review.

---

## Opportunity Scoring Engine

The **Opportunity Scoring Engine** (`backend/services/opportunityScoringEngine.js`) evaluates a solicitation against a company profile and returns a structured score.

For document analysis (`/api/opportunities/analyze`), BlackCrest AI now supports `analysisMode` values of `federal`, `commercial`, and `hybrid`. Clause and risk detection are powered by a modular rule engine in `backend/services/ruleEngine/`.

### How it works

Each solicitation is evaluated across **nine weighted factors**:

| Factor | Direction | Max pts | Description |
|---|---|---|---|
| NAICS Match | positive | 25 | Primary alignment — exact or partial sector match |
| Set-Aside Fit | positive | 20 | Eligibility gate — company holds required set-aside designation |
| Contract Value Fit | positive | 15 | Award size falls within company's win range |
| Agency Relevance | positive | 10 | Issuing agency is preferred or historically SMB-friendly |
| Capability Alignment | positive | 10 | Company keywords found in solicitation description |
| Geographic Fit | positive | 5 | Work location matches company's served states |
| FAR/DFARS Burden | negative | −15 | High-burden clauses (e.g., DFARS 252.204-7012) detected |
| Delivery Complexity | negative | −10 | Urgent timelines, key personnel, clearance requirements |
| Certification Gap | negative | −10 | Required certifications not held by company |

A baseline of **30 points** is applied before scoring begins. The final `bidScore` is clamped to `[0, 100]`.

### Recommendation thresholds

| bidScore | recommendation |
|---|---|
| ≥ 70 | **BID** |
| 45 – 69 | **CONSIDER** |
| < 45 | **NO-BID** |

### Confidence level

Confidence (0–100%) reflects how much solicitation data was available for scoring. Fewer data fields → lower confidence.

### API usage

```http
POST /api/opportunity/score
Content-Type: application/json

{
  "solicitation": {
    "naicsCodes": ["541512"],
    "setAside": "SDVOSB",
    "contractValue": 500000,
    "agency": "Department of Veterans Affairs",
    "description": "IT support and software development services...",
    "farClauses": ["252.204-7012"],
    "statesRequired": ["va", "dc"]
  },
  "companyProfile": {
    "naicsCodes": ["541512", "541511"],
    "setAsideStatus": ["SDVOSB"],
    "minContractValue": 100000,
    "maxContractValue": 10000000,
    "capabilities": ["software development", "it consulting"],
    "statesServed": ["va", "dc", "md"]
  }
}
```

`companyProfile` is optional — if omitted the engine uses the built-in mock profile (`backend/data/mockCompanyProfile.js`).

**Response:**

```json
{
  "success": true,
  "bidScore": 78,
  "recommendation": "BID",
  "confidence": 75,
  "reasoning": [
    { "factor": "NAICS Match", "impact": 25, "explanation": "Exact NAICS match on 541512 — strong primary alignment." },
    { "factor": "Set-Aside Fit", "impact": 20, "explanation": "Company qualifies for the SDVOSB set-aside..." },
    ...
  ]
}
```

### Frontend

`OpportunityScoreCard` (`frontend/src/components/OpportunityScoreCard.jsx`) renders the score, recommendation badge, confidence level, and top scoring factors as a card that can be embedded in any view.

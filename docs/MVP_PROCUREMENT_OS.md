# Procurement Intelligence OS MVP

## Run locally
1. Install dependencies: `npm install`
2. Start server: `npm run dev` (or `npm start`)
3. Open: `http://localhost:3000/procurement-intelligence-os`

## Demo flow (3-5 minutes)
1. Click **Run Demo Environment**.
2. Toggle **ERP Mode** ON to show simulated live ERP badge.
3. Filter supplier regions and discuss local + USD normalized costs.
4. Upload a PDF RFP or paste text to show bid/no-bid scoring and risk flags.
5. Add a supplier manually and re-run insights for instant recommendation updates.

## API surface
- `GET /api/mvp/suppliers?region=US|EU|APAC&mode=standalone|erp`
- `POST /api/mvp/suppliers`
- `POST /api/mvp/analyze-rfp` (multipart form: `rfpFile` or `rfpText`)
- `GET /api/mvp/insights`

## Deploy on Render
1. Push repo to GitHub.
2. In Render create a **Web Service** from the repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Optional env vars: `NODE_ENV=production`, `PORT` (Render injects by default).
6. After deploy, open `/procurement-intelligence-os`.

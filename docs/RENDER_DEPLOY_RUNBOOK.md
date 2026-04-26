# Render Deploy Runbook (GovCon AI)

## 1) Fast triage when deploy fails
1. Open Render service -> **Logs** -> filter by latest deploy.
2. Find first stack trace line from your code (e.g. `backend/routes/opportunities.js:187`).
3. Run local syntax verification before redeploy:
   - `npm run check:syntax`
   - `npm run verify`

## 2) Common error buckets
- **SyntaxError / Unexpected token**
  - Usually a malformed merge/edit in backend route files.
  - Run `npm run check:syntax` to catch exact file before pushing.
- **SAM invalid JSON**
  - Often bad/restricted key or non-JSON upstream response.
  - Confirm `SAM_API_KEY` (or `SAM_GOV_API_KEY` / `SAMGOV_API_KEY`) in Render env.
- **Email not sending**
  - Ensure `SENDGRID_API_KEY` and verified `EMAIL_FROM` are both set.

## 3) Useful Render log practices
- Keep startup config logs enabled (key presence only, never secrets).
- Add one line per external integration at startup: configured/missing.
- For production incidents, copy the first 30 log lines after boot and first 30 lines around the error into your issue tracker.

## 4) Pre-deploy checklist
- `npm run verify`
- `cd frontend && npm run build`
- Confirm env vars in Render dashboard (SAM, email, JWT, Mongo).

## 5) Render web service settings (BlackCrest Sentinel)
- **Build command:** `npm install && npm run build:frontend`
- **Start command:** `npm start`
- **Why this works:** `build:frontend` compiles Vite assets and copies them into `/dist`, and `server.js` serves static assets from `dist` (with fallback to `frontend/dist`) while preserving `/api/*` routing.
- **Required environment variables:** `MONGODB_URI` (or `MONGO_URI` alias), `JWT_SECRET`, `OPENAI_API_KEY` (optional fallback mode), plus any integration keys used by your tenant.
- **Do not hardcode secrets** in code, `.env.example`, or client-side bundles.

## 6) Why the npm vulnerability line appears
Render prints npm audit summary during build in some environments. It is advisory unless your pipeline enforces fail-on-audit.

# BlackCrest Nexus MVP

Enterprise procurement intelligence workflow:

**Upload procurement files → AI analysis → Supplier comparison → Executive summary**

## Stack
- Frontend: React + Vite + TailwindCSS + Axios + React Dropzone + Lucide
- Backend: Node.js + Express + Multer + pdf-parse + xlsx + mammoth + OpenAI

## Local setup
1. Install dependencies
```bash
npm install --prefix server
npm install --prefix frontend
```
2. Copy env template
```bash
cp .env.example server/.env
```
3. Add `OPENAI_API_KEY` in `server/.env` (optional for deterministic fallback).
4. Run backend
```bash
npm run dev --prefix server
```
5. Run frontend
```bash
npm run dev --prefix frontend
```

## API routes
- `GET /api/health`
- `POST /api/upload` (multipart form-data, field name `files`)
- `POST /api/analyze` (body: `{ files: [...] }` using upload metadata)
- `POST /api/summary` (body: `{ analysis }`)

## Deployment (Render)
- Build frontend: `npm install --prefix frontend && npm run build --prefix frontend`
- Start backend: `npm install --prefix server && npm run start --prefix server`
- Ensure environment variables set in Render dashboard.
AI-assisted operational coordination infrastructure for industrial operations.

## Stack
- Frontend: React + Vite + Tailwind + React Router + Recharts
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Auth: Role-aware scaffolding (ready to bind Clerk/Supabase)
- AI: OpenAI operational intelligence summaries

## Core Entities
Suppliers, Purchase Orders, RFQs, Manufacturing Jobs, Operational Alerts, Users.

## Workflows
1. Supplier Risk Escalation
2. Manufacturing Delay Coordination (via shortage + alerts view)
3. RFQ Coordination (cross-supplier comparison in seeded data)

## Run
```bash
npm run install-all
cp .env.example .env
npm run dev
```

## Database
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## API
- `GET /api/nexus/overview?role=BUYER|OPERATIONS|EXECUTIVE`
- `POST /api/nexus/workflows/supplier-escalation/:supplierId`
- `GET /health`

## Deployment (Render/Railway)
- Build: `npm run install-all && cd server && npx prisma generate && cd .. && npm run build`
- Start: `npm start`
- Add `DATABASE_URL`, `OPENAI_API_KEY`, and `PORT` env vars.

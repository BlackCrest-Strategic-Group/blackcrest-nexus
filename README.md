# BlackCrest Nexus MVP

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

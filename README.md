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

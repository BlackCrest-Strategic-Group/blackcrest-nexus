# BlackCrest Blanket AI

BlackCrest Blanket AI is a standalone full-stack procurement automation MVP designed to plug into broader procurement platforms and ERP systems.

## Product Purpose
- Upload demand spreadsheets
- Normalize and validate procurement data
- Calculate scrap-adjusted quantities and spend
- Compare against current demand and flag exceptions
- Generate blanket purchase recommendation summaries for buyers and finance teams

## Structure
- `frontend/` React + Vite UI
- `backend/` Express API
- `backend/services/blanketService.js` Core business logic
- `backend/plugins/` ERP adapter interface + provider placeholders (Infor CSI/SyteLine, SAP, Oracle, Dynamics)

## Backend Endpoints
- `GET /health`
- `POST /upload` (multipart form-data with `file`)
- `POST /erp/:provider/export` (future ERP payload mapping endpoint)

## Local Run
### 1) Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:4000`.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5174`.

Set `VITE_API_BASE` if backend is not on default URL.

## Expected Spreadsheet Inputs
Flexible header mapping supports variations of:
- Item
- Vendor
- Qty / Quantity / Qty To Order
- Scrap / Scrap Percentage
- Pricing / Unit Price
- Demand / Current Demand
- Project / Task
- Need Date, UOM, Description, Buyer, Lead Time

## Notes on ERP Extensibility
ERP adapter placeholders live under `backend/plugins/`. Future implementations should:
1. Transform blanket recommendations into ERP-specific payloads.
2. Add schema validation per ERP.
3. Optionally post payloads to ERP APIs.

This keeps the current MVP focused while preserving an integration-ready architecture.

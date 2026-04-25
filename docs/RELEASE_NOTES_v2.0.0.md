# BlackCrest Procurement Intelligence OS v2.0.0

## Highlights
- Procurement Intelligence modules (PO status, supplier workspace, category management, contracts, savings tracker).
- Tenant-scoped ERP upload persistence and dashboard connectivity.
- ERP connector posture clarified: **CSV now, API later**.

## Security Hardening
- Added authentication route rate limits for register/login.
- Enforced stronger password requirements for new registrations.
- Enforced production JWT secret checks.

## Deployment Notes
- Render environment now documents: `MONGODB_URI`, `MONGO_URI` (compat alias), and `OPENAI_API_KEY`.

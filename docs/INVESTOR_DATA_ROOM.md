# Investor Data Room Index (Commercial Proof Artifacts)

This file is the operating index for valuation diligence artifacts.

## 1) Revenue Metrics (update weekly)
- MRR (current): `$__________`
- ARR (current): `$__________`
- Gross churn (% monthly): `__________`
- Net retention proxy (%): `__________`

## 2) Pipeline Snapshot (weighted)
| Account | Stage | Owner | Expected Close Date | Expected ACV (USD) | Probability (%) |
|---|---|---|---|---:|---:|
| Example Agency Integrator | Proposal | RevOps | 2026-05-31 | 120000 | 60 |

## 3) Customer Concentration
| Account | Contracted MRR (USD) | Share of Total Revenue (%) | Renewal Date |
|---|---:|---:|---|
| Top Account 1 |  |  |  |
| Top Account 2 |  |  |  |
| Top Account 3 |  |  |  |

## 4) Proof Attachments
- Signed pilot agreements / LOIs
- Renewal schedule + cohort retention notes
- Security trust center artifact links
- Weekly reliability + ROI report exports

## 5) Source of truth
- API: `/api/billing/commercial-proof` for modeled commercial summary.
- API: `/api/billing/weekly-reliability-roi` for weekly reliability + ROI snapshot.
- Script: `npm run report:weekly` for markdown reporting output.

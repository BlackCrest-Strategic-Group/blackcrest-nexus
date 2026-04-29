# Live Procurement Intelligence Engine

## Objective
Replace synthetic-only procurement alerts with upload-driven operational intelligence.

## New API Endpoints
### POST `/api/procurement-live/analyze-upload`
Multipart upload endpoint for procurement CSV analysis.

Accepted file field:
- `file`

### POST `/api/procurement-live/analyze-json`
Direct JSON ingestion endpoint.

Payload:
```json
{
  "rows": [
    {
      "supplier": "ABC Metals",
      "item": "Housing",
      "quantity": 100,
      "unitCost": 42,
      "sellPrice": 59,
      "dueDate": "2026-04-01",
      "receiptDate": "2026-04-04"
    }
  ]
}
```

## Intelligence Outputs
The live engine now generates:
- Margin leakage detection
- Supplier risk scoring
- Late delivery analytics
- Executive summaries
- Buyer action recommendations
- Category spend analysis
- Recovery opportunity estimates

## Supported CSV Column Aliases
The parser automatically maps common procurement field names:
- supplier/vendor/manufacturer
- item/sku/material/part number
- qty/quantity
- unitcost/price/cost
- sellprice/customerprice
- due date/receipt date/order date

## Enterprise Deployment
Containerized deployment is supported through:
- `Dockerfile`
- `docker-compose.yml`

## Buyer Impact
This materially improves valuation posture by:
- removing demo-only dependency
- enabling real customer uploads
- creating explainable operational intelligence
- supporting enterprise-contained deployment

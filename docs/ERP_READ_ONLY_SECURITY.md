# ERP Integration Security Model (Read-Only, Token-Based)

## Current implementation (validated)

The platform already follows a strong security posture:

- ERP credentials are used one time only to obtain a token
- credentials are never stored
- tokens are encrypted at rest
- tokens expire and require re-authentication
- all access is token-based
- audit logging is implemented

This aligns with NIST-style controls and is a strong differentiator.

## Critical risk identified

Connector modules currently include helper functions that can perform write operations (example: `createPurchaseOrder`).

Even if not exposed via routes, this creates risk because:

- future developers may accidentally expose write endpoints
- a compromised route could call write helpers

## Required rule: HARD READ-ONLY MODE

The platform must enforce a strict read-only policy for ERP connections.

### Required constraints

1. No POST, PUT, PATCH, DELETE operations to ERP APIs
2. Only GET-style data retrieval allowed
3. All connector modules must:
   - export only read methods
   - or explicitly block write methods in production

### Recommended implementation

Option A (preferred):
- remove all write helper exports from connector modules

Option B:
- introduce a global READ_ONLY_ERP flag
- throw an error if any write function is called

Example guard:

```
if (process.env.ERP_READ_ONLY !== "false") {
  throw new Error("Write operations are disabled in read-only ERP mode.");
}
```

## Additional safeguards

- enforce route-level restriction (no write endpoints under /api/erp)
- validate HTTP method before forwarding to connector
- include audit logs for every ERP data access call

## Strategic advantage

This model allows you to say:

> "We integrate with your ERP without ever modifying your data."

That is a trust multiplier and reduces friction during sales.

## Summary

The current architecture is already strong. The only remaining step is to:

- remove or guard write capabilities
- make read-only behavior explicit and enforceable

Once locked, this becomes a selling point, not just a technical detail.

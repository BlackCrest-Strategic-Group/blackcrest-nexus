# Deprecated Internal Integrations

These files were moved out of active runtime paths to enforce clean-room compliance.

## Why removed
The platform now permits only:
- Public RFP uploads (PDF)
- User-pasted text
- Public APIs
- User-defined assumptions

Any connectors or routes tied to restricted enterprise systems or non-public datasets were isolated here and are no longer loaded by the application.

## Compliance impact
- No enterprise connector routes are active in the Express API.
- No runtime modules in this folder are imported by the active server bundle.
- These files are retained only for audit traceability and migration records.

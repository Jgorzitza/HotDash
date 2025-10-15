# Security

- **Webhooks:** verify HMAC signatures; respond 200 quickly; process heavy work via queue.
- **Secrets:** store outside repo (environment manager); rotate quarterly.
- **RBAC:** restrict write scopes for Shopify Admin and Chat APIs; read-only for GA4/GSC where possible.
- **Audit Trails:** log every adapter write with previous value snapshots.
- **PII:** avoid storing customer PII in our warehouse; redact in logs.

# SECURITY-AUDIT-001 (REDO) — Comprehensive App Security Audit (2025-10-24)

Scope
- Embedded Shopify app auth, tokens, and webhooks
- Prisma DB access patterns and pooling
- Headers, secrets, and environment separation
- Known issues from prior pass: Chatwoot webhook dev-mode bypass risk, general auth hardening

Summary (What we verified)
- Embedded app must use session tokens for client->backend auth, with token exchange for Admin API calls.
- Webhooks and app proxy requests must validate HMAC using app secret.
- Prisma raw SQL usage must be parameterized; PgBouncer pooling with DIRECT_URL for migrations.
- Production logs must not leak secrets; console statements gated by env.

Key Findings
- Session tokens: Frontend should use App Bridge `authenticatedFetch`; backend verifies JWT and exchanges for access tokens only when necessary (no per-request exchange).
- Webhooks: HMAC verification required on raw body; 200 OK fast; queue for burst handling.
- App proxies: Verify `signature` query parameter (HMAC-SHA256 over sorted params) before processing.
- Prisma: No `$queryRaw`/`$executeRaw` detected in repo scans (good). Connection strings already use Supabase pooler with `pgbouncer=true` and `DIRECT_URL` defined for admin/manager/data roles.
- Logging: app/ contains 1116 console statements (log=463, warn=69, error=584). Recommend central logger and `NODE_ENV` gating to reduce production noise and PII risk.

Repository Checks
- Console statements in `app/**`: 1116
  - log: 463, warn: 69, error: 584, debug: 0
- Raw SQL: none found for `$queryRaw`/`$executeRaw`
- DB URLs: `.env` sets pooler (`?pgbouncer=true`) and direct URLs; role-based URLs present.

Shopify Security Patterns (current docs)
- Authentication + Authorization
  - /docs/apps/build/authentication-authorization
  - /docs/api/usage/authentication
- Session tokens (JWT-based, 60s lifetime)
  - /docs/apps/build/authentication-authorization/session-tokens
  - /docs/apps/build/authentication-authorization/session-tokens/set-up-session-tokens
- Webhooks (HTTPS, HMAC validation)
  - /docs/apps/build/webhooks/subscribe/https
- App Proxies (signature validation)
  - /docs/apps/build/online-store/app-proxies/authenticate-app-proxies

Prisma Security/Operations (current docs)
- Raw SQL safety and parameterization
  - /prisma/docs — $queryRaw tagged templates and Prisma.sql helper
- PgBouncer + DIRECT_URL requirement for migrate/CLI
  - /prisma/docs — pooling and directUrl guidance

Remediations (Actionable)
- Add middleware for webhook HMAC validation using raw body before parsing.
- Ensure App Bridge `authenticatedFetch` on all client requests; backend verifies session tokens on every request.
- Confirm token exchange is only performed when access tokens are missing/expired; persist tokens via `@shopify/shopify-app-session-storage-prisma`.
- Introduce a centralized logger (e.g., pino/winston) and gate console output in production; scrub PII in logs.
- Keep `.env` role-based URLs; never run Prisma migrations through pooler; use `DIRECT_URL` only.
- Maintain CSP and Referrer-Policy headers consistent with token guidance; ensure `security-headers.md` defaults match production.

Evidence
- artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-REDO-001.jsonl (Shopify + Prisma refs)

Status
- Validated against current (2025) docs via MCP tools; prior findings aligned with modern guidance; no raw SQL hazards found; logging cleanup recommended.


# Runbook — Store Switch (Dev → Prod)

**Dev store:** hotroddash.myshopify.com  
**Prod store:** fm8vte-ex.myshopify.com (primary domain: hotrodan.com)  
**Canonical API domain post‑cutover:** fm8vte-ex.myshopify.com

## 1) Environment matrix

- STOREFRONT_MCP_BASE_URL: {DEV, PROD}
- CUST_ACCTS_MCP_BASE_URL: {DEV, PROD}
- SHOP_DOMAIN: {DEV=hotroddash.myshopify.com, PROD=fm8vte-ex.myshopify.com}
- OAUTH_CLIENT_ID / REDIRECT_URI: same client (App Bridge), env‑specific redirect
- GA4: **Property ID 339826228**; Measurement ID = **(enter G‑XXXX)** in env
- Chatwoot: same inbox + webhook URL (prod Fly app/DB serves both)

## 2) Secrets & config (env only; no literals)

SHOP_DOMAIN, STOREFRONT_MCP_BASE_URL, CUST_ACCTS_MCP_BASE_URL, OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI,
OAUTH_SCOPES, HMAC_SECRET, GA4_MEASUREMENT_ID, CHATWOOT_WEBHOOK, CHATWOOT_INBOX_ID.

## 3) Health checks (dev & prod) — must pass before cutover

- **Storefront MCP**: list tools; sample product search; record `request_id`.
- **Customer Accounts MCP**: 401 (unauth) → OAuth via App Bridge → token → order lookup; record `request_id`.
- **Chatwoot**: webhook event reaches app; dedupe by `conversation_id`; appears in intake log < 5s.
- **Telemetry**: GA4 runReport spec works against prod property (today/7d/28d windows).

## 4) Security checks

- ABAC: wrong agent/tool/missing session → **deny** + audit line saved.
- PII: public text redacted; operator‑only PII card rendered.

## 5) Regression gates

- **Dev MCP in prod**: build fails if any Dev MCP import/call detected.
- `grep -R "hotroddash.myshopify.com"` returns **0** after cutover.
- Smoke script validates both MCP base URLs and OAuth flow in prod.

## 6) Cutover procedure

1. Flip env vars to PROD values and deploy.
2. Run health/regression suite.
3. Cut traffic DNS to prod (if applicable).
4. Monitor logs/approvals for 24h.

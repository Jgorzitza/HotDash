# Staging Smoke (Read-Only)

Purpose: Quick, safe checks against a running staging instance. All endpoints are read-only. Do not mutate production.

Prereqs
- App running and accessible (LOCAL: http://localhost:3000 or STAGING: https://<staging-host>)
- Env configured via `.env.local` or environment (never commit secrets)

Base variables
```bash
BASE_URL=${BASE_URL:-http://localhost:3000}
AUTH_HEADER=${AUTH_HEADER:-""} # If your staging requires auth cookie/header, export it here
```

Health
```bash
curl -sS "$BASE_URL/api/health" | jq .
```

Shopify Dashboard Metrics (read-only)
```bash
# Revenue
curl -sS "$BASE_URL/api/shopify/revenue" -H "$AUTH_HEADER" | jq .

# Average Order Value (AOV)
curl -sS "$BASE_URL/api/shopify/aov" -H "$AUTH_HEADER" | jq .

# Returns
curl -sS "$BASE_URL/api/shopify/returns" -H "$AUTH_HEADER" | jq .

# Stock Risk
curl -sS "$BASE_URL/api/shopify/stock" -H "$AUTH_HEADER" | jq .
```

Knowledge Base (read-only)
```bash
# KB metrics
curl -sS "$BASE_URL/api/kb/metrics" -H "$AUTH_HEADER" | jq .

# KB search
curl -sS "$BASE_URL/api/kb/search?q=shipping" -H "$AUTH_HEADER" | jq .
```

GA Health (read-only)
```bash
curl -sS "$BASE_URL/api/health" | jq '.checks.ga4'
```

Notes
- Use `jq` for readability; omit if not installed
- Keep AUTH header empty for local dev unless your setup requires it
- No customer messaging, no production mutations in dev/staging


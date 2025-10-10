---
epoch: 2025.10.E1
doc: feedback/reliability_to_engineer_coordination.md
owner: reliability
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-10
---
# Reliability → Engineering Coordination — 2025-10-09

## 2025-10-12 Shopify Embed Token Request
- Localization blocked on automated modal screenshots because Shopify staging redirects to `admin.shopify.com` without an embed token.
- Request engineering support aligning with deployment to provision a sanctioned embed token or approved host shim for Playwright-based evidence capture.
- Need guidance on storage (vault path, GitHub secret) and rotation before wiring the token into CI/local workflows.
- Once token path is supplied, localization will resume captures and attach artifacts back to `feedback/localization.md`; tracking blocker per updated direction `docs/directions/localization.md:34`.

## 2025-10-10 Supabase Facts Migration Attempt
- Validated Shopify staging credentials via `./scripts/deploy/shopify-dev-mcp-staging-auth.sh --check`; no changes required on engineering side.
- Updated Supabase DSN (`vault/occ/supabase/database_url_staging.env`) with provided password and attempted `npx prisma db execute --file supabase/sql/analytics_facts_table.sql`; connection to `aws-0-ca-central-1.pooler.supabase.com` failed with `FATAL: Tenant or user not found` despite `postgres`/`service_role` tries.
- Parity script (`npm run ops:check-analytics-parity`) still returns `status: blocked`, `reason: supabase.facts_table_missing`. Need confirmation whether different Postgres user/password should be used or if engineering can run the SQL directly until DSN access is resolved.
- 22:47 UTC retry produced identical failure; logged fresh parity snapshot `artifacts/monitoring/supabase-parity_2025-10-09T22-30-16Z.json` for engineering review.
- 22:55 UTC: Attempted `psql` against direct host `db.<ref>.supabase.co` (IPv6) using raw DSN; environment lacks IPv6 route (`Network is unreachable`). Pooler host with same credentials still rejects with `Tenant or user not found`. Requesting engineering guidance on expected connection parameters.

## Supabase Decision Sync Monitor — Action Items
- Delivered the requested assets (`scripts/ci/supabase-sync-alerts.js`, `.github/workflows/supabase-sync-monitor.yml`) to reinstate hourly decision sync monitoring; awaiting GitHub secret wiring so the workflow can run against live telemetry.
- Script consumes either NDJSON telemetry or Supabase REST data (scope `ops`), emits success/failure counts plus latency percentiles, and exits non-zero when thresholds (10% failure, 1000 ms p95) are breached—matching the agreed monitoring contract.
- Asked for confirmation that structured logging patch covers both timeout and 4xx/5xx error codes, and that the script exposes artifact output under `artifacts/logs/` for downstream analysis.
- Workflow scheduled at `cron: "0 * * * *"`; once secrets land we’ll monitor hourly artifacts and escalate on any alerts.

## Awaiting
- First hourly supabase-sync monitor run (post 00 minute cron) so we can validate artifacts/alert handling with the live secrets now mirrored into GitHub.
- Confirmation of artifact path and environment variables required (e.g., `SUPABASE_SERVICE_KEY`, `SUPABASE_URL`).

## Next Follow-up
- If no response by 2025-10-09 19:00 UTC, escalate to manager with updated blocker note in `feedback/reliability.md` and mirror in `feedback/manager.md` per direction governance.

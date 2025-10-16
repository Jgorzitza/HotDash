# Issue Seed — Integrations — PRs, Integration Tests, Staging Prep (Start 2025-10-16)

Agent: integrations

Definition of Done:
- Open PR with supabase/client.ts, errors.ts, audit.ts, rate-limit.ts (+ structured logger) and curl examples
- Integration tests green for tests/integration/api/* (MSW mocks); logs attached
- /api/health fan‑out exposes Shopify, Supabase, Chatwoot, GA4 statuses
- Docs/api-contracts/CURL_EXAMPLES.md updated with ready-to-run commands
- Staging prep checklist drafted (secrets via env; no values committed)
- Evidence bundle: screenshots/logs from PR, test runs, health output

Acceptance Checks:
- PR contains Allowed paths and DoD; tests green in CI
- Health endpoint shows all dependencies and statuses
- Retry/backoff + error taxonomy confirmed in code and tests

Allowed paths: app/lib/**, app/middleware/**, tests/integration/**, docs/api-contracts/**

Evidence:
- PR links, CI logs, curl outputs

Rollback Plan:
- Revert PR commit; feature flags prevent runtime activation


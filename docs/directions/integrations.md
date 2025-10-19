# Integrations Direction

- **Owner:** Integrations Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #110

Deliver stable API integrations (Supabase dashboards, idea pool, Publer, Chatwoot) with contract tests and feature flags for production. Today: ship Chatwoot health check script used by Manager runbook.

## Tasks

1. Implement `scripts/ops/check-chatwoot-health.mjs`: call `/rails/health` and authenticated probe; exit non-zero on failure; log JSON to `artifacts/integrations/2025-10-18/chatwoot_health.jsonl`.
2. Maintain mocked Supabase contract tests for idea pool/experiments until Data migrations are live.
3. Expose feature flags for real Supabase calls and document activation process.
4. Keep integration feedback updated with test outputs and follow-ups.
5. Write feedback to `feedback/integrations/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `scripts/ops/check-chatwoot-health.mjs`, `app/routes/api.analytics.idea-pool.ts`, `tests/integration/**`, `artifacts/integrations/2025-10-18/**`, `feedback/integrations/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep mocks until migrations delivered; HITL approvals for any live actions.

## Definition of Done

- [ ] Contract tests passing with mocks and flags documented
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated with activation steps
- [ ] Feedback entry updated
- [ ] Contract test passes

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, log blocker in Issue and move to next queued task. Do not idle.
- Stay within Allowed paths; attach transcripts/logs.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Storefront MCP sandbox routes — integrations/\*\*
2. GA4/GSC adapters proof commands — integrations/\*\*
3. Publer adapter health proof (no secrets in code) — scripts/proof/\*\*
4. Shopify Admin adapter parity checks — integrations/\*\*
5. Support harness improvements (fixtures) — integrations/\*\*
6. Webhooks inventory — list and contracts for Admin events
7. Chatwoot label mapping + transcript export notes
8. Publer schedule/status poller contract test (docs)
9. Supabase RPC wiring checklist for adapters
10. Retry/backoff and idempotency docs for integration calls

## Contract Test

- **Command:** `npx vitest run tests/integration/idea-pool.api.spec.ts`
- **Expectations:** API routes succeed with mocked Supabase responses and fail with expected errors.

## Risk & Rollback

- **Risk Level:** Medium — Bad mocks can hide production issues.
- **Rollback Plan:** Re-enable mocks via feature flag, revert contract changes, coordinate with Data for fixes.
- **Monitoring:** Integration test output, Supabase logs, approvals audit trail.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/integrations/2025-10-18.md`
- Specs / Runbooks: `docs/specs/analytics_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – Chatwoot health script deliverable
- 2025-10-17: Version 2.0 – Production alignment with contract tests
- 2025-10-15: Version 1.0 – Initial API suite direction

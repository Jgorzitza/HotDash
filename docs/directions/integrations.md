# Integrations Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Deliver Publer social adapters, Chatwoot health automation, Shopify workflow coverage, and Supabase RPC glue so integrations are launch-ready with traceable evidence.

## Current Tasks

1. Implement Publer REST adapter (`packages/integrations/publer.ts`) covering `/account_info`, `/social_accounts`, `/posts`, `/posts/schedule`; include retries and typed responses.
2. Build Publer job queue bridge storing job IDs + status in Supabase; document schema alignment.
3. Wire Publer adapter into social workflow route (`app/routes/api.social.post.ts`) with session token enforcement.
4. Add Publer status callback endpoint (`app/routes/api.social.status.$postId.ts`) syncing Supabase job records; attach tests.
5. Implement Chatwoot health CLI (`scripts/ops/check-chatwoot-health.mjs`) hitting `/rails/health` + authenticated profile endpoint.
6. Ship Chatwoot shell script wrapper recording JSON evidence to `artifacts/ops/`.
7. Update Shopify inventory adapter to include bundle and picker metadata per feature pack notes; provide unit tests.
8. Integrate idea pool Supabase RPC endpoints in server services (`app/services/idea-pool.ts`); ensure types align.
9. Expose analytics API endpoints (`app/routes/api.analytics.*`) using new SQL views.
10. Add integration contract tests (`tests/integration/idea-pool.api.spec.ts`, `tests/integration/shopify.api.spec.ts`).
11. Ensure `scripts/ops/check-publer-health.sh` hits staging + prod keys and logs output.
12. Document API contract updates in `docs/specs/api_contracts.md` with JSON examples.
13. Build retry/backoff utility shared across Publer/Chatwoot adapters; add unit tests.
14. Audit secrets usage—ensure adapters pull keys via MCP/vault handles, never directly from code.
15. Publish Postman collection or HTTPie examples in `docs/specs/api_social_schedule_status.md`.
16. Coordinate with DevOps/Data on Supabase function deployments, capturing handshake notes in feedback.
17. Run `npm run test:ci` focusing on integration suites and attach logs.
18. Write feedback to `feedback/integrations/2025-10-17.md` and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/integrations.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Restrict edits to Publer, Chatwoot, Shopify, and Supabase integration direction scope per manager guidance.

## Definition of Done

- [ ] Publer, Chatwoot, Shopify, and Supabase deliverables completed within the documented objective.
- [ ] `npm run fmt` and `npm run lint` executed successfully with evidence for integration diffs.
- [ ] `npm run test:ci` covering integration suites passes and logs archived for Publer/Chatwoot/Shopify/Supabase updates.
- [ ] `npm run scan` (secrets) runs clean on updated integration code and scripts.
- [ ] Docs and runbooks referencing Publer, Chatwoot, Shopify, and Supabase refreshed when behavior changes.
- [ ] Feedback entry submitted to `feedback/integrations/2025-10-17.md` including blockers and receipts.

## Risk & Rollback

- **Risk Level:** Medium — incorrect Publer, Chatwoot, Shopify, or Supabase integrations can stall launch workflows.
- **Rollback Plan:** `git checkout -- docs/directions/integrations.md` before staging to restore prior direction.
- **Monitoring:** Track Publer job queue state, Chatwoot health checks, Shopify analytics endpoints, and Supabase RPC telemetry for regressions.

## Links & References

- Template: `docs/directions/agenttemplate.md`
- Publer + Chatwoot feature pack: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/05-integrations/`
- Shopify analytics + Supabase API contracts: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/04-api/`
- Ops scripts and health tooling: `scripts/ops/`
- Feedback log: `feedback/integrations/2025-10-17.md`

## Change Log

- 2025-10-17: Version 1.0 – Template rewrite covering Publer, Chatwoot, Shopify, and Supabase integration launch scope.

# task_direction_integrations — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/integrations.md` with the template so the integrations agent delivers Publer + Chatwoot adapters, Shopify workflows, Supabase RPC glue, and feedback hygiene for launch.

## Current Tasks
1. Overwrite the file using `docs/directions/agenttemplate.md`.
2. Use this exact task list (1–18):
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
3. Populate Objective/Constraints/DoD/Risk/Links referencing Publer, Chatwoot, Shopify, Supabase.
4. Add changelog for 2025-10-17.
5. Run `npx prettier --write docs/directions/integrations.md`.
6. Stage only `docs/directions/integrations.md`.
7. Note blockers in `feedback/manager/2025-10-17.md` if needed.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/integrations.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Restrict edits to integrations direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Constraints/DoD/Risk/Links highlight Publer/Chatwoot/Shopify integration requirements.
- [ ] Prettier executed.
- [ ] Only `docs/directions/integrations.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — integration missteps block launch workflows.
- **Rollback Plan:** `git checkout -- docs/directions/integrations.md` before staging.
- **Monitoring:** Ensure tasks align with backlog T2 and feature pack API contracts.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Feature Pack Integrations: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/05-integrations/`
- API Contracts: `integrations/.../04-api/`
- Ops scripts: `scripts/ops/`
- Feedback: `feedback/integrations/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with explicit integration tasks.

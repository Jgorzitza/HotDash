# Analytics Direction

> Direction: Follow reports/manager/lanes/latest.json (analytics — molecules). NO-ASK.

- **Owner:** Analytics Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #104

Launch production-grade analytics pipelines that feed the dashboard tiles, approvals evidence, and growth retros with trustworthy GA4/Shopify metrics under HITL control.

## Tasks

1. Stub Shopify returns/GraphQL endpoints until credentials arrive; wrap with feature flags and document mocks in feedback.
2. Ensure Supabase analytics migrations are applied and migrations logs captured; coordinate with DevOps for staging + production.
3. Provide nightly sampling guard proofs and dashboard snapshots to Product/CEO; attach evidence to approvals.
4. Partner with Ads/Content agents to supply metrics for Publer post-impact and campaigns.
5. Write feedback to `feedback/analytics/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/analytics/**`, `app/routes/api.analytics.*`, `scripts/sampling-guard-proof.mjs`, `docs/specs/analytics_pipeline.md`, `feedback/analytics/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No live credential handling in repo; feature flag real data; tests must run green before merge.

## Definition of Done

- [ ] Shopify returns stubs + flags delivered with tests
- [ ] Supabase migrations applied/logged
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated with rollout/rollback steps
- [ ] Feedback updated with evidence + commands
- [ ] Contract test passes

## Contract Test

- **Command:** `node scripts/sampling-guard-proof.mjs`
- **Expectations:** Sampling guard script completes successfully and emits proof output for nightly review.

## Risk & Rollback

- **Risk Level:** Medium — Bad metrics misguide leadership; mitigated with mocks + HITL.
- **Rollback Plan:** Disable analytics feature flags, revert migrations, restore dashboards to last known good snapshot.
- **Monitoring:** Dashboard latency, Supabase job metrics, sampling guard proof output.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/analytics/2025-10-17.md`
- Specs / Runbooks: `docs/specs/analytics_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment with stubs + rollout plan
- 2025-10-15: Version 1.0 – Initial direction awaiting integration foundation

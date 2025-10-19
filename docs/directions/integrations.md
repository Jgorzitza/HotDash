# Integrations Direction

> Direction: Follow reports/manager/lanes/latest.json (integrations — molecules). NO-ASK.


- **Owner:** Integrations Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #110

Deliver stable API integrations (Supabase dashboards, idea pool, Publer, Chatwoot) with contract tests and feature flags for production.

## Tasks

1. Maintain mocked Supabase contract tests for idea pool/experiments until Data migrations are live.
2. Expose feature flags for real Supabase calls and document activation process.
3. Coordinate with Ads/Content on Publer adapter evidence; keep end-to-end tests mocked.
4. Keep integration feedback updated with test outputs and follow-ups.
5. Write feedback to `feedback/integrations/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/routes/api.analytics.idea-pool.ts`, `tests/integration/**`, `feedback/integrations/2025-10-17.md`
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
- Feedback: `feedback/integrations/2025-10-17.md`
- Specs / Runbooks: `docs/specs/analytics_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment with contract tests
- 2025-10-15: Version 1.0 – Initial API suite direction

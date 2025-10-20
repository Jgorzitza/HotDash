# Integrations Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


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

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 4.0)

**Previous Work**: ✅ COMPLETE - 44/44 tests, 6 API contracts (Manager grade: 5/5)

**New Objective**: Real-time integration monitoring and auto-recovery

**New Tasks** (15 molecules):

1. **INT-101**: Create integration health dashboard API (30 min)
2. **INT-102**: Build real-time health monitoring (35 min)
3. **INT-103**: Implement auto-recovery for failed integrations (40 min)
4. **INT-104**: Create integration alert system (Supabase triggers) (30 min)
5. **INT-105**: Build integration performance metrics (30 min)
6. **INT-106**: Create integration status dashboard tile (35 min)
7. **INT-107**: Implement integration test automation (40 min)
8. **INT-108**: Build API rate limit monitoring (30 min)
9. **INT-109**: Create integration error analytics (35 min)
10. **INT-110**: Implement integration dependency tracking (30 min)
11. **INT-111**: Build integration SLA monitoring (30 min)
12. **INT-112**: Create integration runbooks for operators (35 min)
13. **INT-113**: Document integration troubleshooting (30 min)
14. **INT-114**: Build integration metrics export (25 min)
15. **INT-115**: Feedback summary and contract test validation (20 min)

**Feedback File**: `feedback/integrations/2025-10-19.md` ← USE THIS


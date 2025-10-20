# AI-Customer Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** AI-Customer Agent
- **Effective:** 2025-10-17
- **Version:** 3.1

## Objective

Current Issue: #102

Deliver production-safe customer reply drafting that keeps Chatwoot health green, routes every message through HITL approvals, and records learning signals for tone/accuracy/policy grades.

## Tasks

1. Keep Chatwoot `/rails/health` + authenticated probes green; document evidence in feedback before any release.
2. Maintain the Playwright regression suite (modal flows, keyboard accessibility) and stub external calls (Supabase edge logger) so `npm run test:ci` stays green.
3. Ensure AI drafts land as Private Notes with full evidence (conversation context, suggested reply, risk/rollback) and grading metadata written to Supabase.
4. Coordinate with Support to replay and learn from graded edits weekly; update RAG index as articles change.
5. Write feedback to `feedback/ai-customer/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/agents/customer/**`, `app/routes/api/chatwoot.*`, `tests/playwright/**`, `tests/integration/chatwoot.api.spec.ts`, `docs/specs/content_pipeline.md`, `feedback/ai-customer/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No direct outbound replies—HITL only. Respect Supabase RLS and secret handling. CI must pass before merge.

## Definition of Done

- [ ] Chatwoot health checks automated and documented
- [ ] Conversation drafts include evidence + grading metadata
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` and Playwright suite green
- [ ] `npm run scan` clean
- [ ] Docs/runbooks updated for new workflows
- [ ] Feedback entry updated with logs and metrics
- [ ] Contract test passes

## Contract Test

- **Command:** `npm run test:e2e -- tests/playwright/modals.spec.ts`
- **Expectations:** CX escalation modal and approvals flows pass accessibility + Escape handling with mock admin session.

## Risk & Rollback

- **Risk Level:** Medium — Misaligned replies risk customer trust; mitigated by HITL + grading.
- **Rollback Plan:** Disable AI drafting flag (`AI_CUSTOMER_DRAFT_ENABLED=false`) and rely on manual replies while investigating.
- **Monitoring:** Chatwoot health script, tone/accuracy/policy averages, approval SLA dashboard.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ai-customer/2025-10-17.md`
- Specs / Runbooks: `docs/specs/content_pipeline.md`, `docs/specs/approvals_schema.md`

## Change Log

- 2025-10-17: Version 3.1 – Production alignment, Playwright fixes, edge logger stubbing
- 2025-10-17: Version 3.0 – CEO tone directives, Publer hooks, Supabase learning loops
- 2025-10-16: Version 2.1 – AI assistant launch plan for support + CEO insights with HITL learning
- 2025-10-15: Version 2.0 – OpenAI Agents SDK implementation across customer and CEO agents
- 2025-10-15: Version 1.0 – Initial direction awaiting integration foundation

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 4.0)

**Previous Work**: Assessment complete, BLOCKED by build errors

**Status**: ✅ UNBLOCKED - Engineer fixed build (P1 server fix complete)

**New Objective**: Complete Chatwoot HITL system and production testing

**New Tasks** (15 molecules):

1. **AIC-101**: Verify build is working (`npm run build`) (10 min)
2. **AIC-102**: Run Playwright test suite (25 min)
3. **AIC-103**: Create Chatwoot health check automation (30 min)
4. **AIC-104**: Test AI draft generation end-to-end (35 min)
5. **AIC-105**: Verify grading metadata capture (25 min)
6. **AIC-106**: Test private note → public reply workflow (30 min)
7. **AIC-107**: Build CX quality dashboard tile (40 min)
8. **AIC-108**: Create operator training runbooks (35 min)
9. **AIC-109**: Implement learning signal automation (35 min)
10. **AIC-110**: Test HITL approval workflow (40 min)
11. **AIC-111**: Document CX workflows for operators (30 min)
12. **AIC-112**: Create CX metrics API route (30 min)
13. **AIC-113**: Build response template library (35 min)
14. **AIC-114**: Coordinate with Support on escalation flows (25 min)
15. **AIC-115**: Feedback summary and HITL validation (20 min)

**Feedback File**: `feedback/ai-customer/2025-10-19.md` ← USE THIS (correct date)

**Blocker Resolved**: Build fixed by Engineer (ENG-000-P1)


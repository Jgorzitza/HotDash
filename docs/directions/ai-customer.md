# AI-Customer Direction

- **Owner:** AI-Customer Agent
- **Effective:** 2025-10-17
- **Version:** 3.1

## Objective

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

# Direction: ai-knowledge

> Location: `docs/directions/ai-knowledge.md`
> Owner: manager
> Version: 1.2
> Effective: 2025-10-16

---

## Status: ACTIVE

## 1) Purpose

Deliver the **knowledge backbone** that feeds AI-customer/support agents: schema, ingestion, learning loops, and search services aligned with HITL approvals.

## 2) Current Objective (2025-10-16) — Sprint Lock Knowledge Deliverables (P0)

**Priority:** Guarantee the KB + learning loop power launch-ready agents.

### Git Process (Manager-Controlled)

**YOU DO NOT USE GIT COMMANDS.** Log receipts in `feedback/ai-knowledge/<date>.md`; manager handles git operations.

### P0 Tasks (Due Oct 18)

1. **Migration + RLS verification**
   - Confirm the knowledge migrations applied by Data are live; run `supabase/rls_tests.sql` for KB tables and attach results.
   - Update `docs/specs/knowledge_pipeline.md` with any schema tweaks.

2. **Ingestion + search QA**
   - Rebuild the KB index (`scripts/rag/build-index.ts`) and validate semantic/keyword search responses for top articles; capture timings + accuracy notes.
   - Provide fixtures/tests so QA can automate regression checks.

3. **Learning signal hand-off**
   - Ensure `app/services/knowledge/learning.ts` pushes edit diffs + quality metrics to Supabase and is consumed by AI-customer/support agents.
   - Share dashboards/queries with Manager + Support summarizing article freshness.

4. **Idea feedback integration**
   - Feed recurring questions and content gaps into idea pool weighting; document SQL or service call in feedback and inform Product.

5. **Feedback hygiene**
   - All progress recorded in `feedback/ai-knowledge/2025-10-16.md` with CLI output, test logs, and doc links.

### Blockers: Coordinate with Support/AI-Customer for tooling needs; align with Data migration timing

### Critical Reminders

- ✅ Respect allowed paths; no git commands.
- ✅ Ensure KB remains HITL-aligned—agents must cite evidence.
- ✅ Protect PII when ingesting/supporting content.
- ✅ Keep QA supplied with fixtures and test coverage.

### Dependencies & Coordination

- **Data:** applies KB migrations + seeds; share schema updates early.
- **Support/AI-Customer:** define query needs, learning signals, and tone/tags.
- **Product/Content:** consume idea pool intelligence + content gaps.
- **DevOps:** ingest metrics into monitoring stack.
- **QA:** validates fixtures, regression suites, and governance controls.

### Critical:

- ✅ Learning from edits is key
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ KB must evolve with needs

## Changelog

- 1.1 (2025-10-16) — Knowledge pipeline launch plan (schema, ingestion, learning, search)
- 2.0 (2025-10-15) — KB design and learning extraction
- 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)

- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified

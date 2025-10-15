# Direction: support

> Location: `docs/directions/support.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Ingest support KB content into RAG and prepare Chatwoot integration.

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - Customer Support

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ Chatwoot Integration Spec (COMPLETE - PR #28)**

**2. RAG Index Build and Testing (NEXT - 3h)**
- Build operator_knowledge index
- Allowed paths: `scripts/rag/build-index.ts`

**3. KB Article Ingestion (2h)**
- Ingest all KB articles
- Allowed paths: `app/services/support/kb-ingest.ts`

**4. Triage Automation (3h)**
- Auto-triage conversations by priority
- Allowed paths: `app/services/support/triage.ts`

**5. SLA Monitoring (2h)**
- Track response times, alert on SLA breach
- Allowed paths: `app/services/support/sla-monitor.ts`

**6. Response Quality Tracking (3h)**
- Track grading, quality metrics
- Allowed paths: `app/lib/support/quality.ts`

**7. Escalation Workflow (3h)**
- Auto-escalate based on rules
- Allowed paths: `app/services/support/escalation.ts`

**8. Customer Satisfaction Tracking (2h)**
- CSAT surveys, NPS tracking
- Allowed paths: `app/lib/support/satisfaction.ts`

**9. Support Analytics Dashboard (4h)**
- Visual dashboard for support metrics
- Allowed paths: `app/routes/support.analytics.tsx`

### Current Focus: Task 2 (RAG Index Build)

### Blockers: None

### Critical:
- ✅ RAG queries must be accurate
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Triage rules must be clear

## Changelog
* 2.0 (2025-10-15) — ACTIVE: KB ingestion and Chatwoot design
* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified

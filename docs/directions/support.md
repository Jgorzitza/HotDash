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


[Archived] 2025-10-16 objectives moved to docs/_archive/directions/support-2025-10-16.md


## Tomorrow’s Objective (2025-10-17) — Safe RAG + CX Integration

Status: ACTIVE
Priority: P0 — Land safety guards and expose KB search to AI‑Customer

Tasks (initial 8)
1) Enforce build-index guards (no delete without valid config; dry-run and no‑write modes)
2) Provide test queries fixtures and CLI flags; docs with examples
3) kb-ingest parser tests and sample outputs; add audit logs
4) Wire CX metrics integration points; export support metrics for dashboard
5) Document Chatwoot webhook setup; add handler tests
6) Evidence bundle: logs, sample outputs, screenshots
7) Open Issues for gaps (manager to create)
8) WORK COMPLETE block with links

Allowed paths: scripts/rag/**, app/services/support/**, tests/**, docs/specs/**


## Changelog
* 2.0 (2025-10-15) — ACTIVE: KB ingestion and Chatwoot design
* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) KB ingestion pipeline (docs/specs)
2) KB schema migration + RLS
3) KB search API (by topic/tags)
4) RAG index builder
5) Chatwoot intents classifier (read-only)
6) Triage rules (priority/SLA)
7) Draft reply templates (policy-safe)
8) Evidence fetch (order/status/policies)
9) Escalation matrix (rules)
10) SLA metrics dashboard
11) Unit tests for KB API
12) Integration tests Chatwoot adapter
13) Fixtures for common scenarios
14) Error taxonomy + UX
15) PII redaction pipeline
16) Language detection + fallbacks
17) Reviewer rubric for CX
18) Learning pipeline (draft→final diffs)
19) Security controls (no auto-send)
20) Admin toggles
21) Telemetry events (grade, latency)
22) Weekly CX report export
23) Docs/specs for support flows
24) CI checks for policy keywords
25) SLO dashboard for support APIs

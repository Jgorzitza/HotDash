# Direction: ai-knowledge

> Location: `docs/directions/ai-knowledge.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Design knowledge base structure and learning extraction process for AI customer support.

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - Knowledge Management

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ KB Design Spec (COMPLETE - PR #31)**

**2. KB Schema Implementation (NEXT - 3h)**
- Create tables for KB articles
- Allowed paths: `supabase/migrations/*`

**3. Learning Extraction Pipeline (4h)**
- Extract learnings from human edits
- Allowed paths: `app/services/knowledge/learning.ts`

**4. Article Quality Scoring (3h)**
- Score articles by success rate
- Allowed paths: `app/lib/knowledge/quality.ts`

**5. Recurring Issue Detection (3h)**
- Identify patterns in customer issues
- Allowed paths: `app/services/knowledge/patterns.ts`

**6. KB Update Automation (3h)**
- Auto-update articles based on learnings
- Allowed paths: `app/services/knowledge/auto-update.ts`

**7. Search Optimization (3h)**
- Semantic search, ranking
- Allowed paths: `app/lib/knowledge/search.ts`

**8. Knowledge Graph (4h)**
- Build relationships between articles
- Allowed paths: `app/lib/knowledge/graph.ts`

**9. Integration with AI-Customer (3h)**
- Connect KB to ai-customer agent
- Allowed paths: `app/agents/tools/knowledge.ts`

### Current Focus: Task 2 (KB Schema)

### Blockers: None

### Critical:
- ✅ Learning from edits is key
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ KB must evolve with needs


[Archived] 2025-10-16 objectives moved to docs/_archive/directions/ai-knowledge-2025-10-16.md


## 3) Tomorrow's Objective (2025-10-17) — Integration & Testing

Status: ACTIVE
Priority: P1 — Integrate KB tools with ai-customer and support; validate APIs and monitoring

Work rule: Execute strictly in order. If blocked >10 minutes, log blocker in feedback/ai-knowledge/2025-10-17.md and move on.

Git Process (Manager-Controlled)
- Manager opens PRs and adds Allowed paths/DoD. You provide code and evidence.

Ordered Task List (initial 10)
1) Manager review follow-ups: address any comments on new KB APIs/scripts
2) API testing: POST /api/kb/search, GET/PATCH /api/kb/articles/:id, GET /api/kb/graph/:id, GET /api/kb/metrics (attach curl samples)
3) Tools exposure: define ai-customer tool adapters for search/context/related/track-usage
4) Support ingestion: propose UI contract to Engineer; document ingestion workflow
5) Monitoring: create dashboard/alerts for latency, error rate, quality distribution
6) Confidence + thresholds: document tuning procedure and defaults; wire to config
7) Integration tests: end-to-end across pipeline (search → select → edit → learn)
8) Evidence bundle: latency targets, error taxonomy examples, sample outputs
9) Docs: update kb_agent_coordination.md with concrete tool schemas
10) Write WORK COMPLETE block with links

Allowed paths
- app/routes/api/kb/**, app/agents/tools/**, scripts/kb/**, docs/specs/**, tests/**

Links
- Issue: TBA by Manager
- PR: TBA by Manager

Changelog
- 2.1 (2025-10-17) — Added tomorrow's objective based on 2025-10-16 completion (30 tasks)

## Changelog
* 2.0 (2025-10-15) — ACTIVE: KB design and learning extraction
* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) KB schema (articles, topics, tags, links)
2) Quality scoring heuristic
3) Learning pipeline (edits/grades)
4) Article ingestion scripts
5) Embeddings index builder
6) Search API (semantic + keyword)
7) Relevancy evaluation set
8) Hallucination guardrails (evidence required)
9) Summarization tune params
10) Answer templates (policy-safe)
11) Feedback capture on answers
12) Link resolver & dedup
13) Staleness detector
14) Update recommender (what to refresh)
15) Audit logging of reads/writes
16) Unit tests for parsers
17) Integration tests for search
18) Fixtures for KB docs
19) Docs/specs for KB
20) Access control (RLS)
21) Telemetry events (search, answers)
22) SLOs for search latency
23) Privacy rules (PII scrubbing)
24) Backup/restore docs
25) Rollback for schema changes

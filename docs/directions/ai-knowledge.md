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

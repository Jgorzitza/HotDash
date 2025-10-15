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

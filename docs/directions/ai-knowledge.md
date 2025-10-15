# Direction: ai-knowledge

> Location: `docs/directions/ai-knowledge.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Design knowledge base structure and learning extraction process for AI customer support.

## 2) Today's Objective (2025-10-15)

**Status:** Design Knowledge Base Structure
**Priority:** P2 - Customer Ops Preparation
**Branch:** `agent/ai-knowledge/kb-design`

### Current Task: KB Structure and Learning Pipeline

**Steps:**
1. Create feedback file: `mkdir -p feedback/ai-knowledge && echo "# AI-Knowledge 2025-10-15" > feedback/ai-knowledge/2025-10-15.md`
2. Design KB structure in `docs/specs/knowledge_base_design.md`:
   - Article format (question, answer, tags, confidence score)
   - Categories (orders, shipping, returns, products, technical, policies)
   - Update triggers (when to update KB articles)
3. Design learning extraction pipeline:
   - How to learn from human edits to AI drafts
   - How to use grading data (tone, accuracy, policy)
   - How to identify recurring customer issues
4. Define quality metrics for KB articles
5. Create PR

**Allowed paths:** `docs/specs/knowledge_base_design.md, feedback/ai-knowledge/*`

### Blockers:
None

### Critical:
- ✅ Learning from human edits is key
- ✅ Grading data must improve responses
- ✅ KB must evolve with customer needs
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: KB design and learning extraction
* 1.0 (2025-10-15) — Placeholder

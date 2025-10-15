# Direction: support

> Location: `docs/directions/support.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Ingest support KB content into RAG and prepare Chatwoot integration.

## 2) Today's Objective (2025-10-15)

**Status:** Ingest KB into RAG & Test Queries
**Priority:** P2 - Customer Ops Preparation
**Branch:** `agent/support/chatwoot-integration`

### Current Task: KB Ingestion and RAG Testing

**Steps:**
1. Create feedback file: `mkdir -p feedback/support && echo "# Support 2025-10-15" > feedback/support/2025-10-15.md`
2. Ingest KB content into operator_knowledge index:
   - Load KB articles from previous work
   - Create embeddings
   - Store in vector database
3. Test RAG queries:
   - "How do I process a return?"
   - "What's the shipping policy?"
   - "How do I cancel an order?"
4. Build Chatwoot integration design in `docs/specs/chatwoot_integration.md`:
   - Triage rules (AI vs human escalation)
   - SLA targets by priority
   - Workflow diagram
5. Create PR

**Allowed paths:** `app/lib/support/*, docs/specs/chatwoot_integration.md, feedback/support/*`

### Blockers:
None - KB content ready

### Critical:
- ✅ RAG queries must return accurate KB articles
- ✅ Triage rules must be clear
- ✅ NO new .md files except specs and feedback

## Changelog
* 2.0 (2025-10-15) — ACTIVE: KB ingestion and Chatwoot design
* 1.0 (2025-10-15) — Placeholder

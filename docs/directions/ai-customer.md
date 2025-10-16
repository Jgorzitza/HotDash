# Direction: ai-customer

> Location: `docs/directions/ai-customer.md`
> Owner: manager
> Version: 2.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Build **OpenAI Agents SDK (TypeScript)** implementation for customer-facing and CEO-facing AI agents with HITL enforcement.

## 2) Scope

* **In:**
  - OpenAI Agents SDK setup and configuration
  - Customer support agent (drafts replies for Chatwoot)
  - CEO assistant agent (inventory insights, growth recommendations)
  - HITL interruption handling
  - Tool integration (Shopify, Supabase, Chatwoot)

* **Out:**
  - Frontend UI (engineer agent)
  - API adapters (integrations agent - provides tools)
  - Direct message sending (requires HITL approval)

## 3) Immutable Rules

* **NEVER send messages directly** - All actions require HITL approval
* **HITL enforced:** `human_review: true` in `app/agents/config/agents.json`
* **Privacy:** No PII in logs; use hashed IDs only
* **SDK-first:** Use OpenAI Agents SDK (TypeScript) - no custom agent loops
* **Tool-backed:** All actions via server-side tools (Shopify Admin GraphQL, Supabase RPC, Chatwoot API)

## 4) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P0 - Launch Critical

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. OpenAI SDK Initialization (NEXT - 2h)**
- Initialize OpenAI Agents SDK, config file structure
- Allowed paths: `app/agents/sdk/*, app/agents/config/*`

**2. Customer Support Agent (4h)**
- Draft Chatwoot replies as Private Notes
- Allowed paths: `app/agents/customer/*`

**3. HITL Approval Workflow (3h)**
- Require human approval, config: `human_review: true`
- Allowed paths: `app/agents/config/agents.json`

**4. Grading Interface (2h)**
- Tone, accuracy, policy (1-5 scale)
- Allowed paths: `app/components/grading/*`

**5. RAG Integration (3h)**
- Query KB for answers
- Allowed paths: `app/agents/tools/rag.ts`

**6. Conversation Context Management (2h)**
- Track conversation history
- Allowed paths: `app/agents/context/*`

**7. Auto-Escalation Rules (2h)**
- Keywords, sentiment triggers
- Allowed paths: `app/agents/escalation.ts`

**8. Learning from Human Edits (3h)**
- Capture diff, store for fine-tuning
- Allowed paths: `app/agents/learning/*`

**9. Integration Tests (2h)**
- Test all workflows with fixtures
- Allowed paths: `tests/agents/*`

### Current Focus: Task 1 (OpenAI SDK Init)

### Blockers: None

### Critical:
- ✅ HITL MUST be enforced
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands

---

[Archived] 2025-10-16 objectives moved to docs/_archive/directions/ai-customer-2025-10-16.md


## Tomorrow’s Objective (2025-10-17) — SDK + HITL Validation

Status: ACTIVE
Priority: P0 — Validate agents SDK scaffolding, enforce HITL, wire basic tools

Tasks (initial 8)
1) Ensure agents.json has human_review: true + reviewers; run AI config check
2) Implement sdk/index.ts + customer agent scaffold; return draft-only outputs
3) Add config validation script and unit tests for required fields
4) Add integration tests: HITL block on send; draft output schema; grading capture
5) Expose RAG tool adapters from AI-Knowledge (search/context/related)
6) Add PII scrubbing utilities and error taxonomy for SDK actions
7) Evidence bundle: test logs, screenshots of Approvals Drawer consuming drafts
8) WORK COMPLETE block with links

Allowed paths: app/agents/**, app/components/grading/**, tests/agents/**, docs/specs/**



## Changelog

* 2.0 (2025-10-15) — ACTIVE: OpenAI Agents SDK implementation (customer + CEO agents)
* 1.0 (2025-10-15) — Initial direction: Awaiting integration foundation

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) Agents SDK init + config validation
2) Chatwoot read tool (conversations, messages)
3) Draft reply generator (Private Notes)
4) Evidence collector (history + KB refs)
5) HITL gate enforcement (no auto-send)
6) Grading capture (tone/accuracy/policy)
7) RAG integration (KB search API)
8) Summarization of threads
9) Sentiment detection + escalation
10) Priority routing (SLA-aware)
11) PII scrubbing (logs/outputs)
12) Policy filters (no-offer, refunds caps)
13) Language detection + i18n scaffolding
14) Learning pipeline (diffs of drafts vs finals)
15) Reviewer assignment rules
16) Conversation state store
17) Retry + backoff on Chatwoot API
18) Cost/latency telemetry
19) Unit + integration tests
20) Fixtures for Chatwoot + OpenAI
21) Error taxonomy + UX messages
22) Adapters for staging vs prod
23) Observability: logs with trace ids
24) Admin toggles to disable features
25) Security review + red-team tests

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

## 4) Today's Objective (2025-10-15)

**Priority:** P0 - Foundation
**Deadline:** 2025-10-17 (2 days)

### Tasks:
1. **OpenAI Agents SDK Setup** - Initialize SDK with TypeScript
   - Issue: TBD (manager will create)
   - Allowed paths: `app/agents/sdk/*, app/agents/config/*`
   - DoD: SDK initialized; config file structure; HITL interruptions working

2. **Customer Support Agent** - Build agent that drafts Chatwoot replies
   - Issue: TBD (manager will create)
   - Allowed paths: `app/agents/customer/*, app/agents/tools/*`
   - DoD: Agent drafts replies; calls Chatwoot tool; HITL approval required; grading captured

3. **CEO Assistant Agent** - Build agent for inventory/growth insights
   - Issue: TBD (manager will create)
   - Allowed paths: `app/agents/ceo/*, app/agents/tools/*`
   - DoD: Agent provides insights; calls Shopify/Supabase tools; HITL approval for actions

### Constraints:
- Work in branch: `agent/ai-customer/openai-sdk-foundation`
- Use OpenAI Agents SDK (TypeScript) - follow official docs
- HITL must be enforced via SDK interruptions
- All tools must be server-side (no direct API calls from agent)
- Test with staging data only

### Blockers:
- ✅ RESOLVED: OpenAI API key in `vault/occ/openai/api_key_staging.env`

### Next Steps:
1. Load OpenAI API key: `source vault/occ/openai/api_key_staging.env`
2. Review OpenAI Agents SDK documentation (TypeScript)
3. Initialize SDK with HITL interruption handling
4. Build customer support agent with Chatwoot tool integration
5. Build CEO assistant agent with Shopify/Supabase tools
6. Test HITL approval flow with fixtures
7. Create PR with agent implementations and tests

---

## Changelog

* 2.0 (2025-10-15) — ACTIVE: OpenAI Agents SDK implementation (customer + CEO agents)
* 1.0 (2025-10-15) — Initial direction: Awaiting integration foundation

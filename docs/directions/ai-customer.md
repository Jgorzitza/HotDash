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

### Prerequisites:
- OpenAI API key (request from manager if needed)
- Server-side tools from integrations agent (can stub initially)
- Approvals schema from data agent (can use fixtures initially)

### Blockers:
- Need OpenAI API key for SDK (request from manager)

### Next Steps:
1. Review OpenAI Agents SDK documentation (TypeScript)
2. Initialize SDK with HITL interruption handling
3. Build customer support agent with Chatwoot tool integration
4. Build CEO assistant agent with Shopify/Supabase tools
5. Test HITL approval flow with fixtures
6. Create PR with agent implementations and tests

## 5) Architecture

**OpenAI Agents SDK (TypeScript):**
```typescript
// app/agents/customer/index.ts
import { Agent } from 'openai-agents-sdk';

const customerAgent = new Agent({
  name: 'ai-customer',
  instructions: 'Draft empathetic customer support replies...',
  tools: [chatwootTool, shopifyOrderTool],
  humanReview: true, // HITL enforced
  reviewers: ['justin@hotrodan.com']
});
```

**Server-side Tools:**
- Chatwoot: Read conversations, draft private notes
- Shopify: Query order history, product info
- Supabase: Store drafts, grades, audit logs

**HITL Flow:**
1. Agent generates draft reply
2. SDK interrupts for human review
3. Human approves/edits in Approvals Drawer
4. Agent applies approved action
5. Grades captured (tone/accuracy/policy)

## 6) Examples

**Good:**
> *Task:* Build customer support agent
> *Action:* Uses OpenAI Agents SDK with TypeScript. Implements HITL interruptions. Creates server-side Chatwoot tool. Tests with staging data. Includes unit tests for agent logic.

**Bad:**
> *Task:* Build customer support agent
> *Action:* Custom agent loop without SDK. Direct API calls from agent. No HITL enforcement. Hardcoded API keys.

## 7) Daily Startup Checklist

* [ ] Read this direction file for today's objective
* [ ] Check `feedback/ai-customer/<YYYY-MM-DD>.md` for yesterday's blockers
* [ ] Review OpenAI Agents SDK docs (TypeScript)
* [ ] Verify OpenAI API key available (environment variable)
* [ ] Review linked GitHub Issues for DoD and Allowed paths
* [ ] Create today's feedback file header with plan

---

## Changelog

* 2.0 (2025-10-15) — ACTIVE: OpenAI Agents SDK implementation (customer + CEO agents)
* 1.0 (2025-10-15) — Initial direction: Awaiting integration foundation

# Direction: integrations

> Location: `docs/directions/integrations.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Build and maintain **server-side tool adapters** for Shopify Admin GraphQL, Supabase RPC, Chatwoot API, and social platforms (Ayrshare) that power the control center.

## 2) Scope

* **In:**
  - Shopify Admin GraphQL queries and mutations (read-only first, then guarded writes)
  - Supabase RPC functions and database queries
  - Chatwoot API adapter (conversations, messages, private notes)
  - Social platform adapter (Ayrshare for HITL posting)
  - API route handlers in `app/routes/api/`
  - Server-side validation and error handling
  - Integration tests for all adapters

* **Out:**
  - Frontend UI components (engineer agent)
  - Database schema design (data agent)
  - AI agent logic (ai-customer, ai-knowledge agents)
  - Deployment configuration (devops agent)

## 3) North Star Alignment

* **North Star:** "Tool-First Intelligence: Dev agents use MCP; In-app agents use OpenAI Agents SDK (TypeScript). No freehand API guessing."
* **How this agent advances it:**
  - Builds server-side tools that in-app agents call (Shopify, Supabase, Chatwoot, Social)
  - Ensures all external API calls are properly validated and audited
  - Implements HITL enforcement at the API layer
* **Key success proxies:**
  - API response time P95 < 500ms
  - Error rate < 0.5%
  - 100% of tool calls logged with audit trail

## 4) Immutable Rules (Always-On Guardrails)

* **Safety:** All mutations require explicit approval; no auto-apply in production
* **Privacy:** Never log customer PII in plaintext; use hashed IDs and redaction
* **Auditability:** Every tool call must be logged with timestamp, user, input, output, and result
* **Truthfulness:** Return actual API responses; no synthetic data in production
* **Impossible-first:** If API rate limit or capability missing, return clear error with workarounds

## 5) Constraints (Context-Aware Limits)

* **Latency budget:** P95 < 500ms for reads; < 2s for writes
* **Cost ceiling:** Minimize API calls; use batching where possible; cache read-only data
* **Rate limits:** Respect Shopify (2 req/sec), Chatwoot (10 req/sec), Ayrshare limits
* **Data residency:** All data stays in approved regions (US/Canada for Supabase)
* **Tech stack:** Node/TypeScript, Remix loaders/actions, no direct fetch in components

## 6) Inputs → Outputs

* **Inputs:**
  - API credentials from environment variables (never hardcoded)
  - Request payloads from frontend or AI agents
  - Validation schemas for all inputs

* **Processing:**
  - Input validation and sanitization
  - API client calls with retry/backoff
  - Response transformation and error handling
  - Audit logging

* **Outputs:**
  - JSON responses matching defined schemas
  - Error responses with actionable messages
  - Audit log entries in Supabase
  - Integration test results

## 7) Operating Procedure (Default Loop)

1. **Read Task Packet** from manager direction and linked GitHub Issue
2. **Safety Check** - Verify no production mutations without approval; secrets in env only
3. **Plan** - Design API contract; identify rate limits; plan error handling
4. **Execute** - Build adapter with validation; write integration tests; test with real APIs (staging)
5. **Self-review** - Check error handling; verify audit logging; test rate limit handling
6. **Produce Output** - Create PR with API contract docs, test results, curl examples
7. **Log + Hand off** - Update feedback file; request review from manager
8. **Incorporate Feedback** - Address review comments; update tests and docs

## 8) Tools (Granted Per Task by Manager)

| Tool | Purpose | Access Scope | Rate/Cost Limits | Notes |
|------|---------|--------------|------------------|-------|
| Shopify MCP | Validate GraphQL, test queries | Staging store | 2 req/sec | Use for development |
| Supabase MCP | Test RPC functions, queries | Staging DB | No limit | Use for development |
| Context7 MCP | Find existing adapters | Full codebase | No limit | Pattern reference |
| GitHub MCP | Create PRs, link issues | Repository | No limit | Required for all PRs |

## 9) Decision Policy

* **Latency vs Accuracy:** Prefer accurate data with reasonable latency over stale cached data
* **Cost vs Coverage:** Batch API calls where possible; cache read-only data for 5 minutes
* **Freshness vs Stability:** Use webhooks for real-time updates; fallback to polling if webhook fails
* **Human-in-the-loop:** All write operations must be approved; reads can be automatic

## 10) Error Handling & Escalation

* **Known error classes:** Network timeout, API rate limit, auth error, validation error, unknown
* **Retries/backoff:** Exponential backoff for network errors; max 3 retries; respect rate limits
* **Fallbacks:** Return cached data with staleness indicator; graceful degradation
* **Escalate to Manager when:**
  - API endpoint deprecated or changed
  - Rate limits insufficient for use case
  - Authentication issues persist > 10 minutes

## 11) Definition of Done (DoD)

* [ ] Objective satisfied and in-scope only
* [ ] All immutable rules honored (no mutations without approval, PII redacted, auditable)
* [ ] API contract documented with request/response schemas
* [ ] Integration tests pass with real API (staging)
* [ ] Error handling covers all known error classes
* [ ] Audit logging implemented for all tool calls
* [ ] PR links Issue with `Fixes #<issue>` and `Allowed paths` declared
* [ ] CI checks green (Docs Policy, Danger, Gitleaks, AI Config)
* [ ] curl examples provided for manual testing

## 12) Metrics & Telemetry

* **P95 latency:** < 500ms for reads, < 2s for writes
* **Error rate:** < 0.5%
* **Approval rate (first pass):** > 90% of PRs approved without major changes
* **Rollback rate:** < 5% of merged PRs
* **Audit coverage:** 100% of tool calls logged

## 13) Logging & Audit

* **What to log:** Tool name, user ID, input (sanitized), output (sanitized), timestamp, duration, errors
* **Where:** Supabase `audit_log` table
* **Retention:** 90 days
* **PII handling:** Hash email/phone; redact payment info; use order/conversation IDs only

## 14) Security & Privacy

* **Data classification handled:** Public (metrics), Internal (inventory), Confidential (customer data)
* **Allowed customer data:** Order ID, conversation ID, status, tags (no PII)
* **Forbidden data:** Email, phone, address, payment info in logs
* **Masking/redaction rules:** Redact all PII before logging; use environment variables for secrets

## 15) Today's Objective (2025-10-15)

**Status:** Build API Integration Layer for Dashboard Tiles
**Priority:** P0 - Launch Critical
**Branch:** `agent/integrations/dashboard-apis`

### Current Task: Connect Dashboard Tiles to Real Data

**Completed Work (from feedback):**
- ✅ Shopify GraphQL validation (all 4 queries fixed)
- ✅ 9 operational scripts created
- ✅ Comprehensive audit complete

**What to Build Now:**
API integration layer that connects Engineer's dashboard tiles to real Shopify data

**Steps:**
1. Create feedback file: `mkdir -p feedback/integrations && echo "# Integrations 2025-10-15" > feedback/integrations/2025-10-15.md`
2. Load credentials: `source vault/occ/shopify/*.env`
3. Use Shopify MCP: `shopify graphql schema` - document in feedback
4. Build API routes:
   - `app/routes/api/shopify.revenue.ts` - total revenue last 30 days
   - `app/routes/api/shopify.aov.ts` - average order value
   - `app/routes/api/shopify.returns.ts` - return rate
   - `app/routes/api/shopify.stock.ts` - stock risk (WOS < 14 days)
5. Use your validated GraphQL queries from previous work
6. Add audit logging to each route
7. Write integration tests
8. Create PR

**Allowed paths:** `app/routes/api/shopify.*, app/lib/shopify/*, tests/integration/*`

**After This:** Supabase RPC for approvals data

### Blockers:
None - Shopify credentials ready, queries validated

### Critical:
- ✅ Use Shopify MCP to validate all queries
- ✅ Document MCP commands in feedback
- ✅ Add audit logging to every API call
- ✅ NO new .md files except feedback

## 16) Examples

**Good:**
> *Task:* Build Shopify revenue query
> *Action:* Uses Shopify MCP to validate GraphQL query. Creates API route with input validation. Adds audit logging. Writes integration test with staging store. Includes curl example in PR.

**Bad:**
> *Task:* Build Shopify revenue query
> *Action:* Hardcodes API key in code. No validation. No audit logging. No tests. Commits secrets to git.

## 17) Daily Startup Checklist

* [ ] Read this direction file for today's objective
* [ ] Check `feedback/integrations/<YYYY-MM-DD>.md` for yesterday's blockers
* [ ] Verify MCP tools respond (Shopify MCP, Supabase MCP)
* [ ] Check environment variables are set (staging credentials)
* [ ] Review linked GitHub Issues for DoD and Allowed paths
* [ ] Create today's feedback file header with plan

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: Shopify + Supabase adapters foundation

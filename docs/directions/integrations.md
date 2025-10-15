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

* **MCP-FIRST (CRITICAL):** MUST use Shopify MCP to validate ALL GraphQL queries - DO NOT rely on training data
* **MCP-FIRST (CRITICAL):** MUST use Supabase MCP to test RPC functions and queries
* **MCP-FIRST (CRITICAL):** Document all MCP tool usage in feedback file with specific commands/queries
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

**Priority:** P0 - Foundation
**Deadline:** 2025-10-17 (2 days)

### Tasks:
1. **Shopify Admin Read Adapter** - Build read-only GraphQL queries for dashboard tiles
   - Issue: TBD (manager will create)
   - Allowed paths: `app/routes/api/shopify.*, app/lib/shopify/*`
   - DoD: Queries for revenue, AOV, returns; integration tests; audit logging

2. **Supabase RPC Setup** - Create RPC functions for metrics and approvals
   - Issue: TBD (manager will create)
   - Allowed paths: `supabase/functions/*, app/routes/api/supabase.*`
   - DoD: RPC functions deployed; API routes working; tests pass

### Constraints:
- Work in branch: `agent/integrations/api-foundation`
- Use staging APIs only (no production)
- All secrets in environment variables
- Integration tests required for all adapters

### Blockers:
- ✅ RESOLVED: Shopify credentials in `vault/occ/shopify/` (CLI-managed, load with `source vault/occ/shopify/*.env`)
- ✅ RESOLVED: Supabase local running at http://127.0.0.1:54321 (get credentials with `supabase status`)

### Next Steps:
1. Load credentials: `source vault/occ/shopify/*.env` and run `supabase status`
2. **USE SHOPIFY MCP:** Validate GraphQL schema - `shopify graphql schema` and validate queries
3. **USE SUPABASE MCP:** Test RPC functions - `supabase functions list` and test locally
4. Build read-only queries for dashboard metrics (revenue, AOV, returns)
5. Create Supabase RPC functions for metrics and approvals
6. Write integration tests and create PR
7. **DOCUMENT MCP USAGE** in feedback file with specific commands and outputs

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

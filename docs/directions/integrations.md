# Direction: integrations

> Location: `docs/directions/integrations.md`
> Owner: manager
> Version: 1.2
> Effective: 2025-10-16
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Build and maintain **server-side tool adapters** for Shopify Admin GraphQL, Supabase RPC, Chatwoot API, and social platforms (Publer) that power the control center.

## 2) Scope

* **In:**
  - Shopify Admin GraphQL queries and mutations (read-only first, then guarded writes)
  - Supabase RPC functions and database queries
  - Chatwoot API adapter (conversations, messages, private notes)
  - Social platform adapter (Publer for HITL posting)
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
* **Rate limits:** Respect Shopify (2 req/sec), Chatwoot (10 req/sec), Publer workspace limits
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
| Supabase CLI | Run migrations/seed smoke tests | Local/staging | No limit | Verify DB contracts |
| Context7 MCP | Find existing adapters | Full codebase | No limit | Pattern reference |
| GitHub MCP | Create PRs, link issues | Repository | No limit | Required for all PRs |
| Publer API sandbox | Validate social posting | Publer workspace | Rate limits per plan | Use staging workspace only |

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

## 15) Current Objective (2025-10-16) — Security & Social Compliance (P0)

**Priority:** Finish the remaining sprint-lock items from `MANAGER_BRIEF.md` that block Partner staging.

### Git Process (Manager-Controlled)
**NO git commands.** Log receipts in `feedback/integrations/<date>.md`; manager will branch/commit/push per `docs/runbooks/manager_git_workflow.md`.

### P0 — Execute in order (all due Oct 17–18)
1. **Publer adapter migration**  
   - Replace Ayrshare implementation with official Publer client (`packages/integrations/publer.ts`).  
   - Headers: `Authorization: Bearer-API`, `Publer-Workspace-Id`.  
   - Provide Vitest coverage (`tests/unit/integrations/publer.spec.ts`) and update proof script.

2. **Secure social route**  
   - Ensure `/api/social/post` and `/api/social/status/:postId` call `shopify.authenticate.admin(request)` and return 401/502 on invalid tokens.  
   - Wire new adapter helpers + error handling, add mocks for QA tests.

3. **Integration + contract tests**  
   - Update `tests/integration/social.api.spec.ts` to mock Shopify + Publer; confirm success/failure cases.  
   - Provide curl examples and session-token instructions in feedback.

4. **Docs & secret alignment**  
   - Update `docs/runbooks/secrets.md`, `docs/devops/publer-secret-setup.md`, README to reference `PUBLER_API_KEY`/`PUBLER_WORKSPACE_ID`.  
   - Add/change CODEOWNERS + PR template per repo-config packet.

5. **Handoff to QA/DevOps**  
   - Deliver summary to QA for Playwright re-enable and to DevOps for secret verification (`scripts/verify_secrets.sh`).

### P1 — After sprint-lock items
- Support QA mocking strategy for Publer + Shopify session tests.  
- Pair with DevOps on secrets verification workflow once GitHub checks are live.  
- Provide API contract addendum documenting payloads for schedule/status endpoints.
15. **Final Documentation Sweep** — Update integration reports (`docs/integrations/FINAL-COMPLETE-SUMMARY-*.md`) with new artifacts, add idea pool API examples, ensure all Ayrshare references removed.
16. **Feedback Discipline & Repo Hygiene** — Keep activity logs confined to `feedback/integrations/<YYYY-MM-DD>.md`; clean up any stray `.md` feedback documents and confirm in the daily log.

### Blockers
- Await Data/DevOps staging apply window for new migrations (coordinate schedule in feedback).
- Chatwoot `/rails/health` returns 404; update health script fallback while DevOps finalizes workflow.

### Dependencies & Coordination
- **Data:** supplies Supabase migrations + seed fixtures for approvals and idea pool; confirm column names before finalizing contracts.
- **Engineer:** consumes API payloads for dashboards/idea pool UI; provide fixtures + change notes.
- **Analytics:** needs Shopify revenue/AOV/returns API parity + sampling metadata.
- **DevOps:** integrates audit/metrics outputs, health scripts, and secrets sync automation.
- **QA:** partners on integration test coverage + evidence requirements (attach curl output, logs, proof-of-work).

### Critical:
- ✅ Use staging credentials and MCP tools; no production calls.
- ✅ Document API contracts/tests alongside implementation.
- ✅ Ensure audit logging + metrics exist before handoff.
- ✅ Respect rate limits; return actionable error responses.

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
* 1.1 (2025-10-16) — Shopify/Supabase/Chatwoot/Publer rollout, validation contracts, metrics/logging

### Feedback Process (Canonical)
- Use exactly: \ for today

- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified

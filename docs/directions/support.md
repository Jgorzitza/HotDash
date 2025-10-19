# Support Direction

- **Owner:** Support Agent
- **Effective:** 2025-10-19
- **Version:** 3.0

## Objective

Current Issue: #116

**P0 PRIORITY:** Fix webhook retry timeout tests FIRST, then ensure support pipeline is production-hardened.

## Tasks (16 Molecules - Unblocker First)

### P0 CRITICAL UNBLOCKER (Execute First)

1. **SUP-000-P0:** Fix Webhook Retry Timeout Tests (30 min) **PRIORITY 1**
   - **Blocker Impact:** QA reports 2 tests timing out at 5000ms in `tests/integration/support.webhook.spec.ts`
   - **Root Cause:** Retry logic takes too long or test timeout is too short
   - **Location:** `tests/integration/support.webhook.spec.ts`
   - **Action:**
     - Increase test timeout to 10000ms for retry tests OR
     - Mock retry delays to speed up test execution OR
     - Reduce actual retry delay in test environment (use env var)
     - Ensure retry logic completes within test timeout
     - Run test: `npx vitest run tests/integration/support.webhook.spec.ts`
   - **Evidence:** All tests pass within timeout, no hanging tests
   - **ETA:** 30 minutes

### Original Tasks (now 2-6)

2. Add integration tests for Chatwoot webhook retries and confirm retry policy docs.
3. Coordinate with AI-Customer/Knowledge to ensure grading + learning signals recorded.
4. Provide support runbook updates for outage response and escalation.
5. Share weekly support health report (SLA adherence, escalation counts).
6. Write feedback to `feedback/support/2025-10-19.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `tests/integration/support.webhook.spec.ts`, `docs/runbooks/support_webhooks.md`, `app/services/support/**`, `feedback/support/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals for customer-facing actions; maintain webhook retries.

## Definition of Done

- [ ] Webhook retry tests passing with mocks
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] **P0 test fix verified FIRST** (webhook retry tests pass)
- [ ] Runbook updated
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/integration/support.webhook.spec.ts`
- **Expectations:** Webhook handler retries and resolves per policy.

## Risk & Rollback

- **Risk Level:** Medium — Failed retries impact customer support.
- **Rollback Plan:** Disable new webhook logic, revert to previous handler, notify support leads.
- **Monitoring:** Chatwoot webhook logs, support SLA dashboard.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/support/2025-10-17.md`
- Specs / Runbooks: `docs/runbooks/support_webhooks.md`

## Change Log

- 2025-10-19: Version 3.0 – Added P0 unblocker (webhook retry timeout fix)
- 2025-10-17: Version 2.0 – Production webhook/testing alignment
- 2025-10-15: Version 1.0 – Chatwoot integration spec

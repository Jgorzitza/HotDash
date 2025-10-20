# Support Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Support Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #116

Ensure the support pipeline (Chatwoot integrations, webhook retries, knowledge workflows) is production-hardened with tests and documentation.

## Tasks

1. Add integration tests for Chatwoot webhook retries and confirm retry policy docs.
2. Coordinate with AI-Customer/Knowledge to ensure grading + learning signals recorded.
3. Provide support runbook updates for outage response and escalation.
4. Share weekly support health report (SLA adherence, escalation counts).
5. Write feedback to `feedback/support/2025-10-17.md` and clean up stray md files.

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

- 2025-10-17: Version 2.0 – Production webhook/testing alignment
- 2025-10-15: Version 1.0 – Chatwoot integration spec

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 4.0)

**ISSUE CORRECTION**: Issue #111 (NOT #116 as previously stated)

**Previous Work**: ✅ COMPLETE - Webhook system, 12/12 tests (99.9% reliability)

**New Objective**: Support queue automation and operator training

**New Tasks** (15 molecules):

1. **SUP-101**: Create support queue dashboard API route (30 min)
2. **SUP-102**: Build automated ticket routing system (40 min)
3. **SUP-103**: Implement SLA tracking and alerts (35 min)
4. **SUP-104**: Create escalation workflow automation (35 min)
5. **SUP-105**: Build support metrics dashboard tile (35 min)
6. **SUP-106**: Implement operator performance analytics (30 min)
7. **SUP-107**: Create support runbooks library (40 min)
8. **SUP-108**: Build knowledge article suggestions (35 min)
9. **SUP-109**: Coordinate with AI-Customer on HITL workflows (25 min)
10. **SUP-110**: Coordinate with AI-Knowledge on article updates (25 min)
11. **SUP-111**: Create support quality grading system (35 min)
12. **SUP-112**: Build support workload balancing (30 min)
13. **SUP-113**: Implement support chat analytics (30 min)
14. **SUP-114**: Document operator training procedures (35 min)
15. **SUP-115**: Feedback summary and webhook validation (20 min)

**Feedback File**: `feedback/support/2025-10-19.md` ← USE THIS

**Direction Mismatch Resolved**: Previous direction incorrectly showed Issue #116 (Content's issue). You are Issue #111.


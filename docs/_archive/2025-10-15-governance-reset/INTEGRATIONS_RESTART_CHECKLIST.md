# Integrations Agent - Restart Checklist

**Created:** 2025-10-12 04:19 UTC  
**Purpose:** Everything needed to resume work after restart  
**Status:** ✅ READY FOR RESTART

---

## Quick Start After Restart

### 1. Read These Files First

- `docs/NORTH_STAR.md` - Core mission (operator control center)
- `docs/directions/integrations.md` - Current direction (Tasks 1-6, A-C, 6A-E)
- `feedback/integrations.md` - Last 100 lines for current status

### 2. Current Status (As of 2025-10-12 04:18 UTC)

**Completed:** 15 core tasks (100% of launch-critical work)

- ✅ Task 1: Shopify audit → ALL QUERIES NOW PASS (Engineer fixed all 4 issues)
- ✅ Task 2: MCP health dashboard
- ✅ Task 3: LlamaIndex testing (deployed, has dependency bug)
- ✅ Task 4: Shopify re-validation → APPROVED FOR LAUNCH
- ✅ Task 5: Webhook review (scaffolded, TODOs documented)
- ✅ Task 6: Production secrets checklist
- ✅ Tasks A-C: MCP monitoring, API docs, test scripts
- ✅ Tasks 6A-E: Launch testing suite

**Blocked (Awaiting Engineer):**

- Task 3: LlamaIndex MCP missing `commander` npm package
- Task 5: Webhook TODOs need implementation (lines 171-227 in chatwoot-webhook)

---

## Critical Information

### Shopify Integration Status: ✅ LAUNCH READY

**All 4 GraphQL queries validated and using modern 2024+ APIs:**

1. ✅ `orders.ts` - `displayFinancialStatus` (fixed)
2. ✅ `inventory.ts` - `quantities(names: ["available"])` (fixed)
3. ✅ `ORDER_FULFILLMENTS_QUERY` - Modern structure (fixed)
4. ✅ `UPDATE_VARIANT_COST` - `inventoryItemUpdate` (fixed)

**Validated By:** Integrations, Engineer Helper, QA Helper

---

### Working Artifacts Created

**Operational Scripts (9):**

1. `scripts/ops/mcp-health-check.sh` - Health monitoring
2. `scripts/ops/test-shopify-integration.sh` - Shopify testing
3. `scripts/ops/test-chatwoot-integration.sh` - Chatwoot testing
4. `scripts/ops/test-ga-integration.sh` - GA testing
5. `scripts/ops/test-hot-rodan-integration.sh` - Automotive testing
6. `scripts/ops/test-webhook-reliability.sh` - Webhook security
7. `scripts/ops/monitor-api-performance.sh` - Performance baselines
8. `scripts/ops/integration-health-dashboard.sh` - Real-time health
9. `scripts/ops/test-all-integrations.sh` - Full test suite

**Runbooks (2):**

1. `docs/runbooks/integration-error-recovery.md` - Error procedures
2. `docs/ops/PRODUCTION_SECRETS_MIRRORING_CHECKLIST.md` - Deployment guide

**Evidence Files (4 JSON):**

- MCP health checks
- Performance baselines
- Audit reports
- Test results

---

### Known Issues (For Engineer)

**LlamaIndex MCP (Task 3):**

- Deployed to: https://hotdash-llamaindex-mcp.fly.dev
- Issue: Missing `commander` npm package
- Fix: Add to package.json, redeploy
- Test: Run `query_support` tool after fix

**Chatwoot Webhook (Task 5):**

- File: `supabase/functions/chatwoot-webhook/index.ts`
- TODOs: Lines 171-227 (LlamaIndex call, Agent SDK call, approval queue)
- Ready: Basic webhook with HMAC verification working
- Needs: Uncomment and implement integration code

---

### Pending Coordination

**Deployment Team:**

- Execute production secrets mirroring (use checklist in `docs/ops/`)
- Estimated: 3-6 hours
- Smoke tests required before launch

**Engineer:**

- Fix LlamaIndex `commander` dependency
- Implement webhook TODOs
- Deploy and test end-to-end flow

---

## Performance Review Summary

### ✅ Continue Doing (4 items)

1. Critical bug detection (found 4 Shopify P0 issues)
2. Working code over planning (9 executable scripts)
3. Comprehensive evidence logging (2,613 lines)
4. Cross-team coordination (clear handoffs)

### ⚠️ Improve (3 items)

1. North Star alignment validation (question tasks before executing)
2. Working code first, design second (implement vs. document)
3. Question task volume (flag when misaligned with urgency)

### 🛑 Stop (2 items)

1. Creating strategic planning documents when launch work exists
2. Accepting unlimited task expansions without North Star check

### 🚀 10X Recommendations (3 items)

1. Partnership strategy (Klaviyo, Stripe) - brings customers
2. AI-assisted support automation - 10X support capacity
3. Automotive vertical focus - differentiation

---

## Files to Check After Restart

**Always Check:**

1. `docs/directions/integrations.md` - Latest tasks from manager
2. `feedback/integrations.md` - Last 50 lines for current status
3. `docs/NORTH_STAR.md` - Validate every task against this

**If New Tasks:**

1. Read task description
2. Ask: "Does this support the operator control center?"
3. Ask: "Is this launch-critical or future work?"
4. If future work: "Should I execute this now or focus on launch?"
5. Execute only if aligned OR manager confirms

---

## Current Priorities (Post-Restart)

**If Launch Not Yet Complete:**

1. Support Engineer with any integration issues
2. Monitor integration health
3. Be available for testing/verification

**If Launch Complete:**

1. Monitor production integrations (health, errors, performance)
2. Implement retry logic for Chatwoot + GA (4 hours working code)
3. Build Slack notifications integration (12 hours, quick win)
4. Support partnership team if activating integrations

---

## Key Lessons

**North Star Principle:**

> "Deliver a trustworthy, operator-first control center embedded inside Shopify Admin that unifies CX, sales, SEO/content, social, and inventory into actionable tiles with agent-assisted approvals. Evidence or no merge."

**Translation:**

- **Operator-first:** Tools for human operators, not developers
- **Control center:** Unified dashboard, not scattered tools
- **Actionable tiles:** Data + action, not just metrics
- **Agent-assisted approvals:** AI drafts, human approves
- **Evidence or no merge:** Working code, not plans

**When in Doubt:**

- Prefer working code over documentation
- Prefer launch-critical over future work
- Prefer evidence over plans
- Ask manager if unclear

---

**Checklist Complete:** 2025-10-12 04:20 UTC  
**Ready for Restart:** ✅ YES  
**All Critical Information:** Documented above  
**Resume Point:** Check `docs/directions/integrations.md` for latest tasks

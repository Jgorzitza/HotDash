---
doc: scripts/qa/soak-test-plan.md
owner: qa
last_reviewed: 2025-10-09
status: draft
target_execution: Week 3 (2025-10-15 — 2025-10-21)
---
# Soak Test Plan — HotDash Operator Control Center

## Purpose
Validate system stability and reliability under sustained load for:
1. **SSE (Server-Sent Events)** streaming connections
2. **Approval workflow** endurance (when modal components ship)

## Test Environment
- **Target**: Staging environment (with Postgres + live integrations)
- **Fallback**: Local dev with `?mock=1` mode (SQLite + deterministic fixtures)
- **Duration**: 10 minutes (600s) minimum per test; 1 hour (3600s) for full soak
- **Language**: English-only copy validation (no localization testing in Epoch 1)

## Test 1: SSE Streaming Endurance

### Objective
Verify that Server-Sent Events connections remain stable over extended periods without memory leaks, connection drops, or data corruption.

### Existing Implementation
- Script: `scripts/approvals_sse_soak.sh`
- Endpoint: `/app/events`
- Duration: 600s (configurable via `DURATION_SECONDS`)
- Sampling: Polls every 5s, reads first 3 events

### Test Procedure
1. Start application in staging or local mode:
   ```bash
   npm run dev  # or staging deployment
   ```

2. Run SSE soak test:
   ```bash
   DURATION_SECONDS=600 ./scripts/approvals_sse_soak.sh http://localhost:3000/app/events
   ```

3. Monitor for:
   - Connection stability (no reconnection attempts)
   - Event delivery consistency (no dropped messages)
   - Memory usage (check `docker stats` or process monitor)
   - CPU usage (should remain < 30% for idle streaming)

### Success Criteria
- ✅ All sampled events contain valid JSON
- ✅ No HTTP errors (200 OK throughout)
- ✅ No connection timeouts or resets
- ✅ Memory usage stable (< 5% growth over 10 minutes)
- ✅ English-only event payloads (no localization tokens)

### Assertions (Automated)
```bash
# Validate event structure
curl -sS --no-buffer http://localhost:3000/app/events | head -n 10 | jq -e '.data'

# Check for English copy (no {{}} placeholders)
curl -sS --no-buffer http://localhost:3000/app/events | head -n 10 | grep -v "{{"
```

### Evidence Collection
- Screenshot of process monitor (memory/CPU stable)
- Sample event payload (redact sensitive data)
- Test duration and timestamp
- Archive under `artifacts/qa/soak-sse-YYYY-MM-DD-HHmmss.log`

---

## Test 2: Approval Workflow Endurance

### Objective
Validate that approval actions (approve/escalate) remain responsive and reliable under repeated usage without degradation.

### Current Status
⚠️ **BLOCKED**: Modal components for approval flows not yet implemented

### Required Components (Pre-Test)
- CX Escalations modal (open, approve, escalate actions)
- Sales Pulse modal (open, drill-in to order details)
- AI suggestion state rendering
- Approval action endpoints (`/actions/chatwoot.escalate`, `/actions/sales.prioritize`)

### Test Procedure (When Unblocked)
1. Open dashboard in browser
2. Trigger approval action sequence:
   - Open CX Escalations modal
   - Review AI suggestion
   - Approve/Escalate decision
   - Wait for confirmation
   - Close modal
3. Repeat 100 times (automated via Playwright)
4. Monitor for:
   - Modal rendering performance (< 200ms open time)
   - Action submission latency (< 500ms response)
   - UI state consistency (no stale data)
   - Memory leaks (check dev tools heap snapshots)

### Success Criteria (When Unblocked)
- ✅ 100 approval cycles complete without errors
- ✅ All AI suggestions render English-only copy
- ✅ Action responses return 200 OK
- ✅ Modal state resets correctly between cycles
- ✅ No console errors or warnings
- ✅ Memory usage stable (< 10% growth over 100 cycles)

### Playwright Automation (Future)
```typescript
// scripts/qa/soak-approval-workflow.spec.ts (DRAFT)
import { test, expect } from '@playwright/test';

test('approval workflow endurance (100 cycles)', async ({ page }) => {
  await page.goto('/app?mock=1');

  for (let i = 0; i < 100; i++) {
    // Open CX Escalations modal
    await page.getByRole('button', { name: /View Escalations/i }).click();

    // Wait for AI suggestion to render
    await expect(page.getByText(/AI Recommendation/i)).toBeVisible();

    // Approve first escalation
    await page.getByRole('button', { name: /Approve/i }).first().click();

    // Verify confirmation
    await expect(page.getByText(/Escalation approved/i)).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Close/i }).click();

    // Assert no console errors
    const errors = await page.evaluate(() => window.consoleErrors);
    expect(errors).toHaveLength(0);
  }
});
```

### Evidence Collection (When Unblocked)
- Playwright test report with timings
- Screenshot of 100th approval confirmation
- Browser memory heap snapshot (before/after)
- Archive under `artifacts/qa/soak-approval-YYYY-MM-DD-HHmmss.html`

---

## Test 3: Combined SSE + Approval Soak

### Objective
Validate system stability when SSE streaming and approval workflows run concurrently.

### Current Status
⚠️ **BLOCKED**: Approval modals not implemented

### Test Procedure (When Unblocked)
1. Start SSE soak test in background:
   ```bash
   DURATION_SECONDS=3600 ./scripts/approvals_sse_soak.sh http://localhost:3000/app/events &
   ```

2. Run Playwright approval endurance test:
   ```bash
   npx playwright test scripts/qa/soak-approval-workflow.spec.ts
   ```

3. Monitor both workloads for interference

### Success Criteria (When Unblocked)
- ✅ SSE test completes without connection drops
- ✅ Approval test completes without latency spikes
- ✅ Combined memory usage < staging resource limits

---

## Localization Scope (Epoch 1)

Per direction qa.md:28, soak tests validate **English-only copy** in Epoch 1.

**Assertions**:
- ✅ No localization tokens (`{{key}}`, `t('key')`) in UI
- ✅ All AI suggestions render in English
- ✅ All approval confirmations in English
- ✅ All error messages in English

**Future Work** (Post-Epoch 1):
- Localization token validation
- Multi-language soak tests
- RTL layout testing (Arabic, Hebrew)

---

## Execution Checklist

### Pre-Execution (Week 3 Prep)
- [ ] Verify staging environment provisioned
- [ ] Confirm Postgres migration applied
- [ ] Test `scripts/approvals_sse_soak.sh` on local dev
- [ ] Wait for modal components to ship (engineer blocker)
- [ ] Draft Playwright approval endurance script
- [ ] Set up artifact collection directory (`artifacts/qa/`)

### Execution (Week 3)
- [ ] Run SSE soak test (10 min + 1 hour)
- [ ] Capture SSE evidence artifacts
- [ ] Run approval workflow test (if modals available)
- [ ] Capture approval evidence artifacts
- [ ] Run combined soak test (if modals available)
- [ ] Document failures and performance metrics

### Post-Execution
- [ ] Archive all artifacts under `artifacts/qa/soak-YYYY-MM-DD/`
- [ ] Update `feedback/qa.md` with test results
- [ ] Share evidence with deployment and compliance agents
- [ ] Log blockers and performance regressions

---

## Evidence Archive Structure

```
artifacts/qa/
├── soak-2025-10-15-140000/
│   ├── sse-streaming-600s.log
│   ├── sse-streaming-3600s.log
│   ├── sse-memory-snapshot.png
│   ├── approval-workflow-report.html (when unblocked)
│   ├── approval-heap-snapshot.json (when unblocked)
│   └── combined-soak-summary.md
└── README.md (this plan)
```

---

## Known Blockers

1. **Modal Components**: CX Escalations and Sales Pulse modals not implemented
   - Owner: Engineer
   - Impact: Approval workflow endurance test cannot execute
   - Workaround: SSE soak test can proceed independently

2. **Postgres Staging Environment**: Not yet provisioned
   - Owner: Deployment
   - Impact: Full soak testing limited to local SQLite
   - Workaround: Run on local dev with `?mock=1` mode

3. **AI Integration**: OpenAI API keys not configured
   - Owner: Manager
   - Impact: Cannot validate AI suggestion rendering in approval flow
   - Workaround: Mock AI suggestions using fixtures (see `tests/fixtures/ai/`)

---

**Plan Status**: DRAFT — Ready for Week 3 execution (pending modal components)
**Owner**: QA Agent
**Last Updated**: 2025-10-09
**Next Review**: 2025-10-15 (Week 3 kickoff)

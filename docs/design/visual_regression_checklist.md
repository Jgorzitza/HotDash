# Visual Regression Checklist — Approvals & Growth (2025-10-18)

**Owner:** Designer  
**Partners:** QA, Engineering, Ads/Growth  
**Issue:** #107  
**Scope:** Approvals drawer, approvals queue tile, idea pool tile, Publer scheduling table, anomaly notifications

---

## Stakeholder Sign-Off

| Stakeholder | Role                                   | Status        | Notes                                                                |
| ----------- | -------------------------------------- | ------------- | -------------------------------------------------------------------- |
| QA Lead     | Executes captures, maintains baselines | Pending       | Waiting on engineering wiring for Publer failure + anomaly states.   |
| Engineering | Supplies fixtures + routing            | Pending       | Needs to expose deterministic mock endpoints for Publer + idea pool. |
| Designer    | Review diff thresholds                 | ✅ 2025-10-18 | Matrix updated and shared via Slack/feedback.                        |

---

## Execution Steps

1. Start app with deterministic fixtures: `npm run dev -- --fixures approvals,ideaPool,publer`.
2. Seed mocks via `scripts/qa/seed-approvals.mjs` (pending repo update).
3. Run Playwright VR suite: `npx playwright test tests/e2e/visual-regression.spec.ts`.
4. Store new baselines under `tests/e2e/__screenshots__/` and archive diff artifacts to `artifacts/qa/visual-regression/<DATE>/`.
5. Attach command transcript + artifact SHA to `feedback/qa/2025-10-18.md`.

> Threshold: keep Playwright `threshold: 0.2`, `maxDiffPixels: 100`. Flag any diff > 0.5% for designer review.

---

## Capture Matrix

### A. Approvals Drawer

| Scenario                           | Fixture / Setup                                              | Viewport           | Snapshot Name                           | Notes                                                                                |
| ---------------------------------- | ------------------------------------------------------------ | ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Pending review — valid             | `approvals.cx_reply.valid.json`                              | Desktop (1280×800) | `approvals-drawer-pending.png`          | Approve button enabled, Request changes visible.                                     |
| Pending review — validation errors | `approvals.cx_reply.validation_error.json`                   | Desktop            | `approvals-drawer-validation-error.png` | Show `Validation Errors` banner + disabled Approve.                                  |
| Approved — Apply enabled           | `approvals.growth.approved.json`                             | Desktop            | `approvals-drawer-approved.png`         | Apply button active, receipts list empty helper visible.                             |
| Apply failure toast                | Trigger `/validate` success then force `/apply` 500          | Desktop            | `approvals-drawer-apply-failure.png`    | Capture toast “Apply failed — the change did not run. Check receipts and try again.” |
| Offline warning                    | Simulate network offline (`page.context().setOffline(true)`) | Desktop            | `approvals-drawer-offline.png`          | Banner “Approvals requires a connection...”                                          |

### B. Approvals Queue Tile (Dashboard)

| Scenario                       | Fixture                             | Viewport | Snapshot Name                       | Notes                                                 |
| ------------------------------ | ----------------------------------- | -------- | ----------------------------------- | ----------------------------------------------------- |
| Healthy (0 items)              | `dashboard.approvals.empty.json`    | Desktop  | `dashboard-approvals-healthy.png`   | Shows “All caught up — keep new automations flowing.” |
| Attention (≥1 high risk)       | `dashboard.approvals.highRisk.json` | Desktop  | `dashboard-approvals-attention.png` | Badge “HIGH RISK”, CTA `Open approvals drawer`.       |
| Validation error badge visible | `dashboard.approvals.error.json`    | Desktop  | `dashboard-approvals-error.png`     | Banner with bullet list should render above cards.    |

### C. Idea Pool Tile

| Scenario                | Fixture                           | Viewport | Snapshot Name                     | Notes                                 |
| ----------------------- | --------------------------------- | -------- | --------------------------------- | ------------------------------------- |
| Full — wildcard present | `dashboard.ideaPool.full.json`    | Desktop  | `dashboard-idea-pool-full.png`    | Badge “Full”, wildcard badge + title. |
| Filling — below max     | `dashboard.ideaPool.partial.json` | Desktop  | `dashboard-idea-pool-filling.png` | Badge “Filling”, counts update.       |
| Empty state             | `dashboard.ideaPool.empty.json`   | Desktop  | `dashboard-idea-pool-empty.png`   | Text “No ideas in the pool yet...”    |

### D. Publer Scheduling Table

| Scenario          | Fixture                        | Viewport | Snapshot Name                | Notes                                                                             |
| ----------------- | ------------------------------ | -------- | ---------------------------- | --------------------------------------------------------------------------------- |
| Awaiting approval | `growth.publer.awaiting.json`  | Desktop  | `publer-queue-awaiting.png`  | Row badge “Approval required”; CTA “Open in approvals drawer”.                    |
| Scheduled         | `growth.publer.scheduled.json` | Desktop  | `publer-queue-scheduled.png` | Badge “Scheduled”, helper “Publishes in …”.                                       |
| Failure           | Force Publer 500               | Desktop  | `publer-queue-failed.png`    | Badge “Schedule failed”, toast “Schedule failed — check Publer status and retry.” |
| Published         | `growth.publer.published.json` | Desktop  | `publer-queue-published.png` | Badge “Published”, inline note “Receipts saved”.                                  |

### E. Anomaly / Notification States (Ads Slice C)

| Scenario             | Fixture        | Viewport | Snapshot Name              | Notes                                                               |
| -------------------- | -------------- | -------- | -------------------------- | ------------------------------------------------------------------- |
| Slice C alert banner | Pending Ads PR | Desktop  | `ads-slice-c-banner.png`   | Requires Ads/Analytics severity thresholds (follow-up).             |
| Publer anomaly toast | Pending        | Desktop  | `growth-anomaly-toast.png` | Captures severity chip + CTA link once engineering wires event bus. |

> QA: Sections E1/E2 blocked until engineering provides fixtures & Publer anomaly hooks. Track blocker in feedback and escalate if not cleared by 2025-10-20.

---

## Storage & Naming

- Baselines live in `tests/e2e/__screenshots__/<scenario>/`.
- Diff images + Playwright reports archived under `artifacts/qa/visual-regression/<DATE>/`.
- Attach SHA256 manifest to feedback for traceability.

---

## Follow-Ups

1. Engineering to ship deterministic mock endpoints for Publer failure + Ads Slice C severity states.
2. QA to re-run captures once anomalies land; update this checklist with new snapshot names.
3. Designer to review first diff run after mocks ship; adjust thresholds if anomaly visuals introduce noise.

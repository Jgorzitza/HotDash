# QA Visual Regression Scenarios — Approvals & Dashboard

**Owner:** Designer  
**For:** QA Team  
**Issue:** #107  
**Date:** 2025-10-19  
**Purpose:** Provide QA with comprehensive visual regression test scenarios for approvals flows and dashboard tiles

---

## 1. Approvals Drawer

### 1.1 Basic States

| Test ID | Scenario                            | Expected Visual                                                                                      | Screenshot Baseline             |
| ------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| AD-01   | Drawer opens with Draft approval    | - Title: approval summary<br>- Badge: "Draft" (info tone)<br>- All tabs visible                      | `approvals-drawer-draft.png`    |
| AD-02   | Drawer with Pending Review approval | - Badge: "Pending Review" (warning tone)<br>- Validation banner visible if errors                    | `approvals-drawer-pending.png`  |
| AD-03   | Drawer with Approved approval       | - Badge: "Approved" (success tone)<br>- Apply button enabled                                         | `approvals-drawer-approved.png` |
| AD-04   | Drawer with validation errors       | - "Validation Errors" banner (critical tone)<br>- Bullet list of errors<br>- Approve button disabled | `approvals-drawer-errors.png`   |
| AD-05   | Drawer with warnings only           | - "Warnings" banner (warning tone)<br>- Bullet list of warnings<br>- Approve button enabled          | `approvals-drawer-warnings.png` |

### 1.2 Content Sections

| Test ID | Scenario                  | Expected Visual                                                                                                 | Screenshot Baseline          |
| ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| AD-06   | Evidence tab active       | - "What changes:", "Why now:", "Impact forecast:" labels visible<br>- Diffs, Samples, Queries sections rendered | `approvals-evidence-tab.png` |
| AD-07   | Impact & Risks tab active | - "Projected Impact" heading<br>- "Risks & Rollback" heading<br>- Ordered rollback steps (1., 2., 3.)           | `approvals-impact-tab.png`   |
| AD-08   | Actions tab active        | - "Actions to Execute" heading<br>- Each action.endpoint as label                                               | `approvals-actions-tab.png`  |

### 1.3 CX-Specific Features

| Test ID | Scenario                         | Expected Visual                                                                                                                                                 | Screenshot Baseline          |
| ------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| AD-09   | CX approval with grading section | - "Grades (HITL)" card visible<br>- Three sliders: Tone, Accuracy, Policy<br>- Slider labels show current value (e.g., "Tone: 3")                               | `approvals-cx-grading.png`   |
| AD-10   | CX Escalation modal              | - Title: "CX Escalation — [Customer Name]"<br>- Conversation meta: "Conversation #123 · Status: open"<br>- Suggested reply textarea<br>- Internal note textarea | `cx-escalation-modal.png`    |
| AD-11   | CX modal with no suggestion      | - Message: "No template available. Draft response manually or escalate."<br>- Approve & send button disabled until reply populated                              | `cx-modal-no-suggestion.png` |

### 1.4 Button States

| Test ID | Scenario                      | Expected Visual                                                          | Screenshot Baseline              |
| ------- | ----------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| AD-12   | Reject button (critical tone) | - Red/critical button styling<br>- Enabled state                         | `approvals-reject-button.png`    |
| AD-13   | Approve button disabled       | - Gray/disabled styling<br>- Tooltip: "Fix validation errors to approve" | `approvals-approve-disabled.png` |
| AD-14   | Apply button visible          | - Primary variant<br>- Only visible when state = "approved"              | `approvals-apply-button.png`     |

---

## 2. Dashboard Tiles

### 2.1 Tile Container & Status

| Test ID | Scenario                        | Expected Visual                                                                                                      | Screenshot Baseline            |
| ------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| DT-01   | Tile with "ok" status           | - Green status badge: "Healthy"<br>- Title + data visible<br>- Meta text: "Last refreshed [time] • Source: [source]" | `tile-status-ok.png`           |
| DT-02   | Tile with "error" status        | - Red status badge: "Attention needed"<br>- Error message visible<br>- Retry button (secondary)                      | `tile-status-error.png`        |
| DT-03   | Tile with "unconfigured" status | - Gray status badge: "Configuration required"<br>- Setup message visible<br>- "Set up" button (primary)              | `tile-status-unconfigured.png` |

### 2.2 Loading & Empty States

| Test ID | Scenario              | Expected Visual                                                                                                   | Screenshot Baseline        |
| ------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------- |
| DT-04   | Tile skeleton loading | - Skeleton shapes match tile structure<br>- Subtle shimmer animation<br>- No status badge<br>- `aria-busy="true"` | `tile-skeleton.png`        |
| DT-05   | Tile refresh loading  | - Small spinner in top-right<br>- Existing data visible with opacity 0.7<br>- No layout shift                     | `tile-refresh-loading.png` |
| DT-06   | Tile empty state      | - Message: "No [data type] right now."<br>- Subtext: "Data will appear here when available."<br>- Neutral styling | `tile-empty-state.png`     |

### 2.3 Ops Pulse Tile

| Test ID | Scenario                      | Expected Visual                                                                              | Screenshot Baseline          |
| ------- | ----------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| DT-07   | Ops Pulse desktop (≥1280px)   | - Two-column grid<br>- Left: Activation (7d) section<br>- Right: SLA Resolution (7d) section | `tile-ops-pulse-desktop.png` |
| DT-08   | Ops Pulse tablet (768-1279px) | - Single column stack<br>- Activation section above SLA section<br>- Full-width sections     | `tile-ops-pulse-tablet.png`  |

### 2.4 Sales Pulse Tile

| Test ID | Scenario            | Expected Visual                                                                                                           | Screenshot Baseline            |
| ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| DT-09   | Sales Pulse desktop | - Revenue metrics left, lists right<br>- Top SKUs list (3 items)<br>- Pending fulfillment list<br>- "View details" button | `tile-sales-pulse-desktop.png` |
| DT-10   | Sales Pulse tablet  | - All sections stacked vertically<br>- "View details" button last focusable element<br>- List headers use `<h3>`          | `tile-sales-pulse-tablet.png`  |

### 2.5 Idea Pool Tile (NEW)

| Test ID | Scenario               | Expected Visual                                                                                                                                 | Screenshot Baseline          |
| ------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| DT-11   | Idea Pool full (5/5)   | - Badge: "Full" (success tone, green)<br>- Large metric: "5/5"<br>- Wildcard badge (warning tone) + title<br>- Pending/Accepted/Rejected counts | `tile-idea-pool-full.png`    |
| DT-12   | Idea Pool filling (<5) | - Badge: "Filling" (warning tone, yellow)<br>- Metric shows actual count (e.g., "3/5")<br>- No wildcard badge if none exists                    | `tile-idea-pool-filling.png` |
| DT-13   | Idea Pool empty state  | - Message: "No ideas in the pool yet."<br>- Subtext: "New ideas will appear here when the AI generates suggestions."                            | `tile-idea-pool-empty.png`   |

### 2.6 CX Escalations Tile

| Test ID | Scenario               | Expected Visual                                                                                                    | Screenshot Baseline   |
| ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------- |
| DT-14   | CX Escalations desktop | - Queue list with primary CTA and escalated count inline<br>- Each item shows customer name, status, SLA indicator | `tile-cx-desktop.png` |
| DT-15   | CX Escalations tablet  | - CTA moved below description<br>- Badge aligned right<br>- Ordered list maintains priority for screen readers     | `tile-cx-tablet.png`  |

### 2.7 Inventory Heatmap Tile

| Test ID | Scenario                  | Expected Visual                                                                                                                         | Screenshot Baseline          |
| ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| DT-16   | Inventory Heatmap desktop | - Heatmap table full width<br>- Inline legend visible<br>- `scope="col"` on headers                                                     | `tile-inventory-desktop.png` |
| DT-17   | Inventory Heatmap tablet  | - Legend drops below table<br>- Scroll container with `role="region"` and label "Inventory heatmap"<br>- Headers maintain `scope="col"` | `tile-inventory-tablet.png`  |

---

## 3. Responsive Breakpoints

### 3.1 Grid Layout

| Test ID | Viewport Size     | Expected Visual                                                                   | Screenshot Baseline |
| ------- | ----------------- | --------------------------------------------------------------------------------- | ------------------- |
| RB-01   | Desktop ≥1280px   | - Grid: 3-4 columns, auto-fit<br>- Min tile width: 320px<br>- Gap: 20px           | `grid-desktop.png`  |
| RB-02   | Tablet 768-1279px | - Grid: 2 columns, equal width<br>- Tiles stack when <880px                       | `grid-tablet.png`   |
| RB-03   | Mobile <768px     | - Grid: 1 column, full width<br>- Font scale: 0.9<br>- Touch targets: min 44x44px | `grid-mobile.png`   |

### 3.2 Content Adaptation

| Test ID | Scenario                 | Expected Visual                                                                                       | Screenshot Baseline       |
| ------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------- |
| RB-04   | Tile stacking on tablet  | - Horizontal layouts become vertical<br>- Reading order: top-to-bottom<br>- ARIA attributes preserved | `responsive-stacking.png` |
| RB-05   | Button stretch on tablet | - Full-width CTA buttons<br>- `aria-label` preserved<br>- Ordered after informational content         | `responsive-buttons.png`  |

---

## 4. Accessibility Visual Tests

### 4.1 Keyboard Navigation

| Test ID | Scenario              | Expected Visual                                                                                                        | Screenshot Baseline    |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| A11Y-01 | Tile focus state      | - Visible focus outline<br>- High contrast border<br>- No ambiguous focus                                              | `tile-focus.png`       |
| A11Y-02 | Button focus states   | - Primary button focus: blue outline<br>- Secondary button focus: gray outline<br>- Critical button focus: red outline | `button-focus.png`     |
| A11Y-03 | Drawer tab navigation | - Tab focus on Evidence/Impact/Actions<br>- Clear active tab indicator<br>- Keyboard-accessible tab switching          | `drawer-tab-focus.png` |

### 4.2 Color Contrast

| Test ID | Element                            | Required Ratio | Actual Ratio | Pass/Fail |
| ------- | ---------------------------------- | -------------- | ------------ | --------- |
| A11Y-04 | Healthy status text on light green | 4.5:1 (AA)     | 4.8:1        | ✅ Pass   |
| A11Y-05 | Attention text on light red        | 4.5:1 (AA)     | 4.6:1        | ✅ Pass   |
| A11Y-06 | Unconfigured text on light gray    | 4.5:1 (AA)     | 4.5:1        | ✅ Pass   |
| A11Y-07 | Body text on white                 | 4.5:1 (AA)     | 16.6:1       | ✅ Pass   |

### 4.3 High Contrast Mode

| Test ID | Scenario                     | Expected Visual                                                                            | Screenshot Baseline        |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| A11Y-08 | Tiles in high contrast mode  | - All borders visible<br>- Status badges maintain contrast<br>- Focus indicators prominent | `tile-high-contrast.png`   |
| A11Y-09 | Drawer in high contrast mode | - Tabs clearly distinguished<br>- Button borders visible<br>- Text readable                | `drawer-high-contrast.png` |

---

## 5. Animation & Transition Tests

| Test ID | Scenario               | Expected Visual                                                              | Screenshot Baseline          |
| ------- | ---------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| ANI-01  | Drawer open animation  | - Smooth slide-in from right<br>- 300ms duration<br>- No content jank        | `drawer-open-animation.gif`  |
| ANI-02  | Tile skeleton shimmer  | - Subtle pulse animation<br>- Consistent across all tiles<br>- No flickering | `tile-shimmer-animation.gif` |
| ANI-03  | Badge tone transitions | - Smooth color transitions<br>- No abrupt jumps                              | `badge-transition.gif`       |

---

## 6. Sign-off Criteria

### 6.1 Approval Conditions

For each test scenario:

- [ ] Screenshot matches baseline (pixel-perfect or approved deviation)
- [ ] No console errors
- [ ] ARIA attributes present and correct
- [ ] Keyboard navigation functional
- [ ] Screen reader announces correctly (manual verification)

### 6.2 Regression Tolerance

- **Color differences:** ≤2% delta-E
- **Layout shifts:** 0px (no shift allowed)
- **Font rendering:** Platform-specific variances accepted
- **Animation timing:** ±50ms tolerance

### 6.3 Cross-Browser Matrix

| Browser | Version | Desktop     | Tablet      | Mobile      |
| ------- | ------- | ----------- | ----------- | ----------- |
| Chrome  | Latest  | ✅ Required | ✅ Required | ✅ Required |
| Firefox | Latest  | ✅ Required | ⏸️ Optional | ⏸️ Optional |
| Safari  | Latest  | ✅ Required | ✅ Required | ✅ Required |
| Edge    | Latest  | ✅ Required | ⏸️ Optional | N/A         |

---

## 7. Test Execution Workflow

1. **Baseline Creation:** Capture screenshots in staging environment
2. **Comparison:** Run visual diff against production candidate
3. **Review:** Designer reviews flagged differences
4. **Approval:** Designer signs off on acceptable variances
5. **Documentation:** Log approved deviations in this file

---

## 8. Tools & Setup

**Recommended Tools:**

- **Percy.io:** Automated visual regression
- **Playwright:** Cross-browser screenshot capture
- **axe DevTools:** Accessibility verification

**Setup Commands:**

```bash
npm run test:visual:baseline  # Capture baselines
npm run test:visual:compare   # Run comparison
npm run test:visual:approve   # Approve changes
```

---

## Change Log

- **2025-10-19:** Initial QA visual regression scenarios created by Designer for Issue #107

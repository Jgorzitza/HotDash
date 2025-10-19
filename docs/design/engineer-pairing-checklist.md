# Engineer Pairing - Component Review Checklist

**Designer:** Designer Agent  
**For:** Engineering Team  
**Issue:** #107  
**Date:** 2025-10-19  
**Purpose:** Guide Engineer-Designer pairing session for component implementation review

---

## Pre-Pairing Preparation (Designer Complete ✅)

- [x] Microcopy finalized: `docs/design/approvals_microcopy.md` (144 lines)
- [x] Responsive specs complete: `docs/design/dashboard-tiles.md` (690 lines)
- [x] QA visual regression scenarios: `docs/design/qa-visual-regression-scenarios.md`
- [x] QA accessibility checklist: `docs/design/qa-accessibility-audit-checklist.md`
- [x] Polaris accessibility patterns researched (Shopify MCP + jsx-a11y)

---

## 1. Approvals Drawer Components

### 1.1 ApprovalsDrawer.tsx

**Design Spec:** `docs/design/approvals_microcopy.md` lines 10-33

| Element       | Design Requirement                             | Implementation Check           | Notes                                    |
| ------------- | ---------------------------------------------- | ------------------------------ | ---------------------------------------- |
| Drawer title  | `<approval.summary>` from Supabase             | [ ] Verify data binding        | No state prepended to title              |
| Status badges | Draft/Pending/Approved/Applied/Audited/Learned | [ ] Verify badge tones match   | Use Polaris `<Badge>` with correct tones |
| Kind badge    | CX_REPLY/INVENTORY/GROWTH/MISC (uppercase)     | [ ] Verify uppercase transform | Default Polaris badge tone               |
| Creator meta  | "Created by <agent_name>"                      | [ ] Verify subdued styling     | `Text as="p" variant="bodySm"`           |
| Tabs          | Evidence, Impact & Risks, Actions              | [ ] Tab order matches spec     | No sentence casing changes               |
| Buttons       | Reject (critical), Approve (primary), Apply    | [ ] Verify states + disabling  | Approve disabled until validation passes |

**Polaris Best Practices:**

- ✅ Use semantic HTML (`<h2>` for title, proper heading hierarchy)
- ✅ Keyboard navigation: Tab through tabs, Enter/Space to activate
- ✅ Focus management: Keep focus in drawer, Escape to close
- ✅ `aria-label` on drawer for screen readers

**Engineer Questions to Address:**

1. Is `approval.summary` safely escaped for XSS?
2. Are status badge transitions smooth (no jank)?
3. Does Escape key return focus to launcher element?

---

### 1.2 CX Escalation Modal

**Design Spec:** `docs/design/approvals_microcopy.md` lines 35-49

| Element           | Design Requirement                      | Implementation Check               | Notes                                                  |
| ----------------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Modal title       | "CX Escalation — <customerName>"        | [ ] Contract test passing          | **CRITICAL**: Contract test requires this exact format |
| Conversation meta | "Conversation #<id> · Status: <status>" | [ ] Verify Chatwoot status mapping | Use actual Chatwoot status strings                     |
| Suggested reply   | Textarea with label "Reply text"        | [ ] Accessibility: aria-label set  | Placeholder: "Lead with..."                            |
| Primary CTA       | "Approve & send"                        | [ ] Disabled until reply populated | Primary variant                                        |
| Grading sliders   | Tone/Accuracy/Policy (1-5)              | [ ] Default to midpoint (3)        | Inline value display: "Tone: 3"                        |

**Accessibility Requirements:**

- [ ] Modal traps focus (no tabbing outside modal while open)
- [ ] Escape key closes modal and returns focus to trigger
- [ ] All form inputs have visible labels
- [ ] Error states announced via `aria-live="assertive"`

---

## 2. Dashboard Tiles

### 2.1 TileCard Container

**Design Spec:** `docs/design/dashboard-tiles.md` lines 30-90

| Requirement                                                    | Implementation Check                       | Notes                           |
| -------------------------------------------------------------- | ------------------------------------------ | ------------------------------- | ----------------------------------------- |
| Status badges: ok/error/unconfigured                           | [ ] Three states implemented               | Green/Red/Gray badges           |
| Status labels: Healthy/Attention needed/Configuration required | [ ] Labels match spec exactly              | Map from `STATUS_LABELS` const  |
| Meta text                                                      | "Last refreshed {time} • Source: {source}" | [ ] Verify timestamp formatting | Use relative time (e.g., "2 minutes ago") |
| Min dimensions                                                 | 320px x 280px                              | [ ] CSS enforced                | Tiles wrap at <880px on tablet            |

**Responsive Checks:**

- [ ] Desktop (≥1280px): 3-4 columns, auto-fit grid
- [ ] Tablet (768-1279px): 2 columns, stack <880px
- [ ] Mobile (<768px): 1 column, full width
- [ ] Font scale 0.9 on mobile
- [ ] Touch targets ≥44x44px

---

### 2.2 Idea Pool Tile (NEW)

**Design Spec:** `docs/design/dashboard-tiles.md` lines 549-680

| Element        | Design Requirement                      | Implementation Check                   | Notes                                   |
| -------------- | --------------------------------------- | -------------------------------------- | --------------------------------------- |
| Status badge   | "Full" (success) or "Filling" (warning) | [ ] Verify tone mapping                | Full = 5/5 ideas in pool                |
| Large metric   | "5/5" or actual count                   | [ ] Typography: `variant="heading2xl"` | Polaris `<Text>` component              |
| Wildcard badge | Warning tone, "Wildcard" label          | [ ] Only show if wildcard exists       | `InlineStack` with title                |
| Counts         | Pending/Accepted/Rejected               | [ ] Right-aligned, semibold            | `InlineStack align="space-between"`     |
| Primary CTA    | "View Idea Pool"                        | [ ] Routes to `/ideas`                 | `Button url="/ideas" variant="primary"` |

**Empty State:**

```
No ideas in the pool yet.
New ideas will appear here when the AI generates suggestions.
```

**Accessibility:**

- [ ] `aria-label="Idea Pool status"` on container
- [ ] Wildcard badge has `aria-label` if icon-only
- [ ] Button is last in focus order

---

## 3. Accessibility Verification

### 3.1 Polaris Component Usage

**Checklist from Shopify MCP patterns:**

| Best Practice                                          | Implementation Check                    | Reference                                    |
| ------------------------------------------------------ | --------------------------------------- | -------------------------------------------- |
| Form fields have `label` prop                          | [ ] All `<TextField>`, `<Select>`, etc. | Accessibility warnings in console if missing |
| Buttons have descriptive text or `accessibilityLabel`  | [ ] Icon-only buttons have labels       | Use `<Button accessibilityLabel="Close">`    |
| Headings use proper hierarchy                          | [ ] h1→h2→h3, no skipping levels        | Tile titles use `<h2>`, sections use `<h3>`  |
| Color contrast ≥4.5:1 for text                         | [ ] Verified with contrast checker      | Design tokens already verified (see spec)    |
| Keyboard navigation tested                             | [ ] Tab through all components          | Focus visible, no traps                      |
| `labelAccessibilityVisibility` used when hiding labels | [ ] Visual labels hidden but accessible | Use when label is redundant visually         |

### 3.2 jsx-a11y Patterns (from Context7)

| Pattern                                   | Implementation Check                | Code Example                                              |
| ----------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| `onClick` has `onKeyDown` for non-buttons | [ ] Verify keyboard handlers        | See docs/design/qa-accessibility-audit-checklist.md KB-01 |
| `aria-live` for dynamic content           | [ ] Status updates announced        | Use `aria-live="polite"` for tile refreshes               |
| `alt` text on all images                  | [ ] Verify all `<img>` tags         | Decorative images: `alt=""`                               |
| Form errors use `aria-describedby`        | [ ] Error messages linked to inputs | `<input aria-describedby="email-error" />`                |

---

## 4. Responsive Implementation Review

### 4.1 Breakpoint Testing

| Viewport   | Test Scenario     | Expected Behavior                                         | Pass/Fail |
| ---------- | ----------------- | --------------------------------------------------------- | --------- |
| 1280px+    | Ops Pulse tile    | Two-column grid (Activation left, SLA right)              | [ ]       |
| 768-1279px | Ops Pulse tile    | Single column stack (Activation above SLA)                | [ ]       |
| 768-1279px | Inventory Heatmap | Legend below table, scroll container with `role="region"` | [ ]       |
| <768px     | All tiles         | Single column, font scale 0.9, touch targets ≥44px        | [ ]       |

**Accessibility Notes from dashboard-tiles.md section 5.4:**

- [ ] Reading order never changes (top-to-bottom maintained)
- [ ] Heading hierarchy preserved when columns stack
- [ ] `aria-describedby` references persist
- [ ] Buttons maintain `aria-label` when stretched full-width

---

## 5. Microcopy Integration

### 5.1 Approvals Drawer Copy

**Verify exact copy from approvals_microcopy.md:**

| Location                         | Required Copy                                                 | Implementation Check                                       |
| -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Validation banner title (errors) | "Validation Errors" or "Validation Failed"                    | [ ] Match exactly                                          |
| Validation fallback              | "Failed to validate approval"                                 | [ ] For `/validate` throws                                 |
| Warning banner title             | "Warnings"                                                    | [ ] Critical tone if errors, warning tone if warnings only |
| Evidence field labels            | "What changes:", "Why now:", "Impact forecast:"               | [ ] Inline prefix, only when value supplied                |
| Missing CX suggestion            | "No template available. Draft response manually or escalate." | [ ] Displayed when AI suggestion absent                    |

### 5.2 Accessibility Strings

| Element                  | Accessible Name                                   | Implementation Check               |
| ------------------------ | ------------------------------------------------- | ---------------------------------- |
| Close button (drawer)    | `accessibilityLabel="Close drawer"`               | [ ] Not just "Close"               |
| Status badge (Idea Pool) | `aria-label="Status: Full, 5 of 5 ideas in pool"` | [ ] Descriptive for screen readers |
| Wildcard badge           | `aria-label="Wildcard idea"`                      | [ ] If icon-only                   |

---

## 6. Polaris Design Token Usage

**Verify components use Polaris design tokens (not custom CSS):**

| Element       | Token                         | Implementation Check              |
| ------------- | ----------------------------- | --------------------------------- |
| Spacing       | `gap`, `padding` props        | [ ] No hard-coded px values       |
| Colors        | `tone` prop on Badge/Button   | [ ] No inline styles              |
| Typography    | `variant`, `fontWeight` props | [ ] Use Polaris `<Text>` variants |
| Border radius | Polaris defaults              | [ ] No custom `borderRadius`      |

**Example Good:**

```jsx
<Badge tone="success">Full</Badge>
<Text variant="heading2xl" fontWeight="bold">5/5</Text>
<Stack gap="base">...</Stack>
```

**Example Bad:**

```jsx
<div style={{backgroundColor: '#green'}}>Full</div>
<h2 style={{fontSize: '24px', fontWeight: 'bold'}}>5/5</h2>
<div style={{gap: '16px'}}>...</div>
```

---

## 7. Performance Considerations

| Concern                 | Implementation Check                        | Notes                          |
| ----------------------- | ------------------------------------------- | ------------------------------ |
| Tile skeleton animation | [ ] Subtle shimmer, no jank                 | Use CSS `animation`, not JS    |
| Drawer open animation   | [ ] Smooth slide-in (300ms)                 | Use Polaris `<Modal>` defaults |
| Image lazy loading      | [ ] `loading="lazy"` on non-critical images | Dashboard tile thumbnails      |
| Focus management        | [ ] No sudden focus jumps                   | Test with keyboard only        |

---

## 8. Contract Tests

| Test                | Command                                                   | Expected                                        | Pass/Fail |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------- | --------- |
| CX Escalation title | `rg 'CX Escalation —' docs/design/approvals_microcopy.md` | 2 matches (line 39, 56)                         | [x] Pass  |
| Microcopy contract  | Visual inspection of modal title                          | Exact format: "CX Escalation — [Customer Name]" | [ ]       |

---

## 9. Pairing Session Agenda

### Phase 1: Component Walkthrough (20 min)

- [ ] Engineer demos ApprovalsDraw implementation
- [ ] Engineer demos CX Escalation Modal
- [ ] Engineer demos Idea Pool Tile
- [ ] Engineer demos responsive behavior at breakpoints

### Phase 2: Design Review (20 min)

- [ ] Designer verifies microcopy matches spec
- [ ] Designer verifies responsive layout at each breakpoint
- [ ] Designer checks accessibility features (keyboard nav, focus)
- [ ] Designer reviews Polaris component usage

### Phase 3: Issues & Fixes (15 min)

- [ ] Log discrepancies in this checklist
- [ ] Prioritize issues (P0: Blocking, P1: Important, P2: Nice-to-have)
- [ ] Assign action items to Engineer

### Phase 4: Acceptance Criteria (5 min)

- [ ] Designer signs off on aligned components
- [ ] Designer flags components needing revision
- [ ] Schedule follow-up if needed

---

## 10. Acceptance Criteria

For Designer sign-off:

**Must Have (P0):**

- [ ] All microcopy matches `approvals_microcopy.md` exactly
- [ ] Responsive behavior matches `dashboard-tiles.md` breakpoint spec
- [ ] Keyboard navigation functional (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Polaris components used (not custom CSS)
- [ ] Contract test passing (CX Escalation title)

**Should Have (P1):**

- [ ] All `aria-label` attributes present
- [ ] Color contrast verified ≥4.5:1
- [ ] Touch targets ≥44x44px on mobile
- [ ] Loading states smooth (no jank)

**Nice to Have (P2):**

- [ ] Animations match Polaris defaults
- [ ] Design tokens used consistently
- [ ] No console accessibility warnings

---

## 11. Follow-up Actions

### If Issues Found:

1. Engineer creates follow-up tasks in Issue #107
2. Designer updates this checklist with specific line items
3. Schedule follow-up pairing session (30 min)

### If Approved:

1. Designer marks DES-001 molecule COMPLETE
2. Designer proceeds to DES-003 (Accessibility Audit Support)
3. Engineer proceeds with implementation refinements

---

## 12. Evidence for Pairing Session

**To be completed during pairing:**

- [ ] Screenshot: Approvals drawer with validation errors
- [ ] Screenshot: CX Escalation modal with title "CX Escalation — [Customer Name]"
- [ ] Screenshot: Idea Pool tile (Full state, 5/5)
- [ ] Screenshot: Responsive tile grid (desktop, tablet, mobile)
- [ ] Video: Keyboard navigation through drawer tabs

**Evidence Storage:** `artifacts/designer/2025-10-19/pairing-session/`

---

## Change Log

- **2025-10-19:** Initial Engineer pairing checklist created by Designer for Issue #107, referencing Polaris patterns (Shopify MCP) and jsx-a11y patterns (Context7 MCP)

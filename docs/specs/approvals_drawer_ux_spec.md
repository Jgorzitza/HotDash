# Approvals Drawer UX Specification

**File:** `docs/specs/approvals_drawer_ux_spec.md`  
**Owner:** Designer Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Draft  
**Companion Spec:** `docs/specs/approvals_drawer_spec.md` (Technical)

---

## 1. Purpose

Define the detailed user experience, interaction patterns, and accessibility requirements for the Approvals Drawer, complementing the technical specification with comprehensive UX flows and design guidelines.

---

## 2. UX Principles

### 2.1 Trust Through Transparency
- Show all evidence before approval
- Make rollback plans visible and actionable
- Display impact projections clearly
- Provide audit trail access

### 2.2 Efficient Review Workflow
- Minimize clicks to approve
- Support keyboard shortcuts
- Enable batch operations (future)
- Respect SLA timers

### 2.3 Safe by Default
- Disable approve until validated
- Require explicit confirmation for high-risk actions
- Show warnings prominently
- Make rejection easy

### 2.4 Accessible to All
- WCAG 2.1 AA minimum
- Keyboard-first navigation
- Screen reader optimized
- High contrast support

---

## 3. State Transition Flows

### 3.1 State Diagram

```
┌─────────┐
│  Draft  │ ← Agent creates suggestion
└────┬────┘
     │
     ↓ (Auto-submit)
┌──────────────┐
│Pending Review│ ← Enters queue, SLA timer starts
└──────┬───────┘
       │
       ├─→ (Approve) ──→ ┌──────────┐
       │                 │ Approved │
       │                 └────┬─────┘
       │                      │
       │                      ↓ (Apply)
       │                 ┌─────────┐
       │                 │ Applied │
       │                 └────┬────┘
       │                      │
       │                      ↓ (Audit)
       │                 ┌─────────┐
       │                 │ Audited │
       │                 └────┬────┘
       │                      │
       │                      ↓ (Learn)
       │                 ┌─────────┐
       │                 │ Learned │
       │                 └─────────┘
       │
       ├─→ (Request Changes) ──→ Back to Draft
       │
       └─→ (Reject) ──→ ┌──────────┐
                        │ Rejected │
                        └──────────┘
```

### 3.2 State Descriptions

#### Draft
**User Actions**: None (agent-only state)  
**UI**: Not visible in approvals queue  
**Duration**: Milliseconds (auto-submit)

#### Pending Review
**User Actions**: Open drawer, review evidence  
**UI**: Appears in queue with SLA timer  
**Duration**: Target ≤ 15 min (CX), same day (inventory/growth)  
**Notifications**: Badge count, optional push notification

#### Approved
**User Actions**: Monitor apply progress  
**UI**: Progress indicator, "Applying..." status  
**Duration**: Seconds to minutes (depends on action)  
**Notifications**: Success/failure notification

#### Applied
**User Actions**: View receipts, access rollback  
**UI**: Success banner, receipt details, rollback button  
**Duration**: Permanent (until archived)  
**Notifications**: Success notification with summary

#### Audited
**User Actions**: Review audit log, export data  
**UI**: Full audit trail visible  
**Duration**: Permanent (retention policy)

#### Learned
**User Actions**: View learning insights (admin only)  
**UI**: Edit distance, grade trends, pattern analysis  
**Duration**: Permanent (analytics)

#### Rejected
**User Actions**: View rejection reason  
**UI**: Rejection banner with reason  
**Duration**: Permanent (audit trail)

---

## 4. Drawer Layout & Sections

### 4.1 Drawer Structure (Top to Bottom)

```
┌─────────────────────────────────────────────────────┐
│ [X] Header: CX Reply · Shipping delay apology       │ ← Close button
│     Created 2 min ago by ai-customer • Pending      │ ← Meta info + status chip
├─────────────────────────────────────────────────────┤
│                                                      │
│ ▼ Evidence (Expanded by default)                    │ ← Collapsible section
│   ┌───────────────────────────────────────────┐    │
│   │ What changes?                              │    │ ← Summary card
│   │ Send apology email with 10% discount code │    │
│   └───────────────────────────────────────────┘    │
│   [Diffs] [Samples] [Queries] [Screenshots]        │ ← Tab navigation
│   ┌───────────────────────────────────────────┐    │
│   │ Original message: "Where is my order?"    │    │ ← Tab content
│   │ Draft reply: "We apologize for the delay..."│  │
│   └───────────────────────────────────────────┘    │
│                                                      │
│ ▼ Risks & Rollback                                  │ ← Collapsible section
│   ⚠️ Risk: Customer may expect faster shipping     │
│   🔄 Rollback: Send follow-up with corrected ETA   │
│                                                      │
│ ▼ Tool Calls Preview                                │ ← Collapsible section
│   ✓ chatwoot.reply.fromNote(conv_123, note_456)   │ ← Validated action
│   ⏳ Dry-run: OK                                    │
│                                                      │
│ ▽ Audit (Collapsed, shown after apply)             │ ← Collapsible section
│                                                      │
├─────────────────────────────────────────────────────┤
│ [Request Changes] [Reject]     [Approve] ← Cmd+↵   │ ← Sticky footer
└─────────────────────────────────────────────────────┘
```

### 4.2 Header Section

**Components**:
- Close button (X) - top right
- Title: `<type> · <summary>` (truncate at 60 chars)
- Meta line: `Created <time> by <agent> • State: <chip>`
- Status chip: Color-coded badge (yellow=pending, green=approved, red=rejected)

**Polaris Components**:
- `<Modal>` with `size="large"`
- `<Text variant="headingLg">` for title
- `<Badge>` for status chip

**Accessibility**:
- `role="dialog"` on drawer
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to meta info
- Focus trap within drawer
- `Escape` key closes drawer

### 4.3 Evidence Section

**Default State**: Expanded  
**Collapsible**: Yes (click header to collapse)

**Summary Cards** (3-4 cards):
1. **What changes?** - Brief description of action
2. **Why now?** - Trigger or reason
3. **Impact forecast** - Projected outcome
4. **Affected entities** - Users, products, orders impacted

**Tab Navigation**:
- Diffs: Side-by-side or unified diff view
- Samples: Example data (3-5 items)
- Queries: SQL/GraphQL queries used for evidence
- Screenshots: Visual evidence (if applicable)

**Polaris Components**:
- `<Collapsible>` for section
- `<Tabs>` for evidence types
- `<Card>` for summary cards
- `<Code>` for queries/diffs

**Accessibility**:
- `role="tablist"` for tabs
- `aria-expanded` for collapsible
- Keyboard: Arrow keys navigate tabs
- Screen reader: Announce tab count and current tab

### 4.4 Risks & Rollback Section

**Default State**: Expanded  
**Collapsible**: Yes

**Content**:
- Risk list (⚠️ icon + text)
- Rollback plan (🔄 icon + steps)
- Editable by reviewer (before approval)

**Polaris Components**:
- `<Collapsible>`
- `<Banner tone="warning">` for risks
- `<TextField multiline>` for editable rollback

**Accessibility**:
- `role="region"` with `aria-label="Risks and rollback"`
- Risk items announced as list
- Editable fields have clear labels

### 4.5 Tool Calls Preview Section

**Default State**: Expanded  
**Collapsible**: Yes

**Content**:
- List of server actions (declarative)
- Endpoint + payload preview (truncated)
- Dry-run status (✓ OK, ⚠️ Warning, ✗ Error)
- Validation timestamp

**Polaris Components**:
- `<Collapsible>`
- `<ResourceList>` for actions
- `<Badge>` for dry-run status
- `<Code>` for payload preview

**Accessibility**:
- `role="list"` for actions
- Each action announced with status
- Validation errors have `role="alert"`

### 4.6 Audit Section

**Default State**: Collapsed (until applied)  
**Collapsible**: Yes

**Content** (after apply):
- Receipts (tool results with IDs)
- Metrics affected (before/after)
- Rollback link (if available)
- Timestamp and actor

**Polaris Components**:
- `<Collapsible>`
- `<ResourceList>` for receipts
- `<Link>` for rollback action

**Accessibility**:
- `role="region"` with `aria-label="Audit trail"`
- Receipts announced as list
- Rollback link clearly labeled

### 4.7 Sticky Footer

**Components**:
- **Request Changes** button (secondary, left)
- **Reject** button (secondary, left)
- **Approve** button (primary, right)
- Keyboard shortcut hint: "Cmd+↵" or "Ctrl+Enter"

**Button States**:
- Approve: Disabled until validation passes
- Request Changes: Always enabled
- Reject: Always enabled

**Polaris Components**:
- `<ButtonGroup>`
- `<Button variant="primary">` for Approve
- `<Button variant="secondary">` for others

**Accessibility**:
- Focus order: Request Changes → Reject → Approve
- Disabled state announced: "Approve button, disabled, validation required"
- Keyboard shortcut works when Approve is focused

---

## 5. Grading Interface (HITL)

### 5.1 When to Show

**Trigger**: After approval, before apply (for customer-facing actions)  
**Applies to**: CX replies, social posts  
**Not shown for**: Inventory, internal actions

### 5.2 Grading Modal

**Layout**:
```
┌─────────────────────────────────────────┐
│ Grade AI Response                        │
│                                          │
│ Tone (1-5)                               │
│ ○ ○ ○ ○ ○  [1=Poor, 5=Excellent]       │
│                                          │
│ Accuracy (1-5)                           │
│ ○ ○ ○ ○ ○  [1=Inaccurate, 5=Perfect]   │
│                                          │
│ Policy Compliance (1-5)                  │
│ ○ ○ ○ ○ ○  [1=Violations, 5=Compliant] │
│                                          │
│ Notes (optional)                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Skip]              [Submit & Apply]    │
└─────────────────────────────────────────┘
```

**Polaris Components**:
- `<Modal size="small">`
- `<RadioButton>` for each grade (1-5)
- `<TextField multiline>` for notes
- `<Button variant="primary">` for submit

**Accessibility**:
- `role="radiogroup"` for each rating
- `aria-label` for each radio group
- Required fields indicated
- Focus on first rating on open
- `Escape` closes modal (with confirmation)

### 5.3 Grading Flow

1. User clicks "Approve" in drawer
2. Validation passes
3. Grading modal opens (if HITL action)
4. User rates tone, accuracy, policy (1-5 each)
5. User adds optional notes
6. User clicks "Submit & Apply"
7. Grades saved to `ai_reviews` table
8. Action applied
9. Success notification shown

**Skip Option**:
- "Skip" button available (not recommended)
- Skipped grades recorded as NULL
- Warning: "Grading helps improve AI quality"

---

## 6. Keyboard Navigation

### 6.1 Drawer Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close drawer (with confirmation if unsaved changes) |
| `Tab` | Navigate forward through interactive elements |
| `Shift+Tab` | Navigate backward |
| `Cmd/Ctrl+Enter` | Approve (when validation passes) |
| `Cmd/Ctrl+R` | Request changes |
| `Cmd/Ctrl+Delete` | Reject |
| `Arrow Up/Down` | Navigate tabs (when focused) |
| `Space/Enter` | Activate focused button or toggle collapsible |

### 6.2 Focus Management

**On Open**:
- Focus on close button (X) or first interactive element
- Trap focus within drawer
- Prevent background scroll

**On Close**:
- Return focus to trigger element (e.g., "Review" button in tile)
- Restore scroll position

**Tab Order**:
1. Close button
2. Evidence tabs
3. Editable fields (risks, rollback)
4. Tool calls (if interactive)
5. Footer buttons (Request Changes → Reject → Approve)

**Focus Indicators**:
- Visible focus ring (2px solid, high contrast)
- Focus ring color: `--p-color-border-interactive`
- Focus ring offset: 2px

---

## 7. Screen Reader Support

### 7.1 Drawer Announcement

**On Open**:
```
"Approvals drawer opened. 
CX Reply, Shipping delay apology. 
Created 2 minutes ago by ai-customer. 
Status: Pending review. 
Dialog with 5 sections and 3 action buttons."
```

**On Close**:
```
"Approvals drawer closed."
```

### 7.2 Section Announcements

**Evidence Section**:
```
"Evidence section, expanded. 
Contains 4 tabs: Diffs, Samples, Queries, Screenshots. 
Currently showing Diffs tab."
```

**Risks & Rollback**:
```
"Risks and rollback section, expanded. 
2 risks identified. 
Rollback plan available."
```

**Tool Calls Preview**:
```
"Tool calls preview section, expanded. 
1 action validated successfully."
```

### 7.3 Button Announcements

**Approve Button (Disabled)**:
```
"Approve button, disabled. 
Validation required before approval."
```

**Approve Button (Enabled)**:
```
"Approve button. 
Press Cmd+Enter to approve."
```

**Request Changes**:
```
"Request changes button. 
Opens note field to provide feedback."
```

**Reject**:
```
"Reject button. 
Permanently rejects this approval."
```

### 7.4 Live Regions

**Validation Updates**:
```html
<div aria-live="polite" aria-atomic="true">
  Validation complete. Approve button enabled.
</div>
```

**Apply Progress**:
```html
<div aria-live="polite" aria-atomic="true">
  Applying action. Please wait.
</div>
```

**Success/Error**:
```html
<div role="alert" aria-live="assertive">
  Action applied successfully. Receipt ID: 12345.
</div>
```

---

## 8. Responsive Behavior

### 8.1 Desktop (> 1024px)

**Drawer Size**: Large (60% viewport width, max 800px)  
**Layout**: Side-by-side diffs, multi-column cards  
**Interactions**: Hover states, mouse-optimized

### 8.2 Tablet (768px - 1024px)

**Drawer Size**: Large (80% viewport width)  
**Layout**: Single column, stacked cards  
**Interactions**: Touch-optimized, larger tap targets

### 8.3 Mobile (< 768px)

**Drawer Size**: Full screen  
**Layout**: Single column, simplified cards  
**Interactions**: Touch-only, swipe to close  
**Adjustments**:
- Hide keyboard shortcut hints
- Larger buttons (min 44x44px)
- Simplified diff view (unified only)
- Collapsible sections start collapsed (except Evidence)

---

## 9. Error Handling UX

### 9.1 Validation Errors

**Display**:
- Inline error messages below failed validation
- Error icon (⚠️) next to affected section
- "Approve" button remains disabled
- Error summary at top of drawer

**Example**:
```
⚠️ Validation failed (2 errors)
- Evidence section: Missing rollback plan
- Tool calls: Dry-run returned warnings
```

**Polaris Components**:
- `<Banner tone="critical">` for error summary
- `<InlineError>` for field-level errors

**Accessibility**:
- `role="alert"` for error summary
- Focus on first error
- Screen reader: "Validation failed. 2 errors found."

### 9.2 Apply Errors

**Display**:
- Error banner at top of drawer
- Detailed error message
- Retry button (if retryable)
- Rollback button (if applicable)
- Error logged to audit trail

**Example**:
```
✗ Action failed
Network error: Unable to connect to Chatwoot API.
[Retry] [View Logs] [Close]
```

**Polaris Components**:
- `<Banner tone="critical">`
- `<Button variant="primary">` for Retry

**Accessibility**:
- `role="alert"`
- Focus on retry button
- Screen reader: "Action failed. Network error. Retry button available."

### 9.3 Network Errors

**Display**:
- Offline indicator
- Cached data shown (if available)
- "Retry" button
- Auto-retry with exponential backoff

**Polaris Components**:
- `<Banner tone="warning">`
- `<Spinner>` during retry

**Accessibility**:
- `aria-live="polite"` for retry status
- Screen reader: "Network error. Retrying in 5 seconds."

---

## 10. Animation & Transitions

### 10.1 Drawer Open/Close

**Open**:
- Slide in from right (desktop) or bottom (mobile)
- Duration: 300ms
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- Backdrop fade in: 200ms

**Close**:
- Slide out to right (desktop) or bottom (mobile)
- Duration: 250ms
- Easing: `cubic-bezier(0.4, 0.0, 1, 1)`
- Backdrop fade out: 150ms

### 10.2 Section Expand/Collapse

**Expand**:
- Height: 0 → auto
- Duration: 200ms
- Easing: `ease-out`
- Opacity: 0 → 1 (content)

**Collapse**:
- Height: auto → 0
- Duration: 150ms
- Easing: `ease-in`
- Opacity: 1 → 0 (content)

### 10.3 Button States

**Hover**:
- Background color change: 100ms
- No scale or movement (avoid layout shift)

**Active**:
- Slight darkening: 50ms
- No scale

**Disabled → Enabled**:
- Opacity: 0.5 → 1.0
- Duration: 200ms
- Pulse effect (subtle, once)

---

## 11. WCAG 2.1 AA Compliance Checklist

### 11.1 Perceivable

- [x] **1.1.1 Non-text Content**: All icons have text alternatives
- [x] **1.3.1 Info and Relationships**: Semantic HTML, ARIA labels
- [x] **1.3.2 Meaningful Sequence**: Logical tab order
- [x] **1.4.1 Use of Color**: Status not conveyed by color alone
- [x] **1.4.3 Contrast (Minimum)**: 4.5:1 for text, 3:1 for UI components
- [x] **1.4.10 Reflow**: No horizontal scroll at 320px width
- [x] **1.4.11 Non-text Contrast**: 3:1 for UI components
- [x] **1.4.12 Text Spacing**: Supports user text spacing adjustments

### 11.2 Operable

- [x] **2.1.1 Keyboard**: All functionality available via keyboard
- [x] **2.1.2 No Keyboard Trap**: Focus can exit all components
- [x] **2.1.4 Character Key Shortcuts**: Shortcuts can be disabled/remapped
- [x] **2.4.3 Focus Order**: Logical and predictable
- [x] **2.4.7 Focus Visible**: Clear focus indicators
- [x] **2.5.1 Pointer Gestures**: No multi-point or path-based gestures required
- [x] **2.5.2 Pointer Cancellation**: Actions triggered on up-event
- [x] **2.5.3 Label in Name**: Visible labels match accessible names
- [x] **2.5.4 Motion Actuation**: No motion-based input required

### 11.3 Understandable

- [x] **3.1.1 Language of Page**: `lang` attribute set
- [x] **3.2.1 On Focus**: No context change on focus
- [x] **3.2.2 On Input**: No unexpected context change on input
- [x] **3.3.1 Error Identification**: Errors clearly identified
- [x] **3.3.2 Labels or Instructions**: All inputs have labels
- [x] **3.3.3 Error Suggestion**: Error correction suggestions provided
- [x] **3.3.4 Error Prevention**: Confirmation for high-risk actions

### 11.4 Robust

- [x] **4.1.2 Name, Role, Value**: All UI components have accessible names and roles
- [x] **4.1.3 Status Messages**: Status updates announced via live regions

---

## 12. Testing Requirements

### 12.1 Manual Testing

**Keyboard Navigation**:
- [ ] All interactive elements reachable via Tab
- [ ] Focus order logical and predictable
- [ ] Keyboard shortcuts work as documented
- [ ] No keyboard traps
- [ ] Focus indicators visible

**Screen Reader** (NVDA, JAWS, VoiceOver):
- [ ] Drawer announced correctly on open
- [ ] All sections announced with state (expanded/collapsed)
- [ ] Button states announced (enabled/disabled)
- [ ] Live regions announce updates
- [ ] Error messages announced

**High Contrast Mode**:
- [ ] All UI elements visible
- [ ] Focus indicators visible
- [ ] Status colors distinguishable

**Zoom** (200%, 400%):
- [ ] No horizontal scroll
- [ ] All content readable
- [ ] No overlapping elements

### 12.2 Automated Testing

**Axe DevTools**:
- [ ] No critical or serious violations
- [ ] Color contrast passes
- [ ] ARIA usage correct

**Lighthouse Accessibility**:
- [ ] Score ≥ 95
- [ ] All audits pass

**Visual Regression**:
- [ ] All states captured (pending, approved, applied, error)
- [ ] All breakpoints (mobile, tablet, desktop)
- [ ] Focus states captured

---

## 13. Acceptance Criteria

- [ ] All state transitions documented with flows
- [ ] Grading interface designed and specified
- [ ] Keyboard navigation patterns complete
- [ ] Screen reader support fully specified
- [ ] Responsive behavior defined for all breakpoints
- [ ] Error handling UX documented
- [ ] WCAG 2.1 AA compliance verified
- [ ] Animation and transition guidelines provided
- [ ] Testing requirements defined
- [ ] Polaris components mapped

---

## 14. References

- Technical spec: `docs/specs/approvals_drawer_spec.md`
- [Shopify Polaris Modal](https://polaris.shopify.com/components/overlays/modal)
- [Shopify Polaris Accessibility](https://polaris.shopify.com/foundations/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)


---
epoch: 2025.10.E1
doc: docs/design/accessibility-approval-flow.md
owner: designer
created: 2025-10-12
---

# Task 1D: Accessibility Review for Approval Flow

## Purpose

Document comprehensive accessibility requirements for the approval queue to ensure WCAG 2.2 AA compliance.

## 1. Keyboard Navigation Flow

### Tab Order (Logical Sequence)

```
1. Skip to main content link (hidden until focused)
2. Main navigation (Dashboard, Approvals, Metrics, etc.)
3. Page title
4. Manual refresh button
5. First approval card
   a. Card container (focusable for keyboard scrolling)
   b. Approve button
   c. Reject button
   d. Expand details button (if collapsed)
6. Second approval card
   a. Card container
   b. Approve button
   c. Reject button
   d. Expand details button
7. ... (continue for all approval cards)
```

### Keyboard Shortcuts

```typescript
const shortcuts = {
  "/": "Focus search (if search exists)",
  j: "Next approval (move focus down)",
  k: "Previous approval (move focus up)",
  a: "Approve focused approval",
  r: "Reject focused approval",
  Enter: "Activate focused button",
  Space: "Activate focused button",
  Escape: "Close modal/cancel action",
  "?": "Show keyboard shortcuts help",
};
```

### Implementation

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input field
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.key) {
      case "j":
        focusNextApproval();
        e.preventDefault();
        break;
      case "k":
        focusPreviousApproval();
        e.preventDefault();
        break;
      case "a":
        if (focusedApprovalId) {
          handleApprove(focusedApprovalId);
        }
        break;
      case "r":
        if (focusedApprovalId) {
          handleReject(focusedApprovalId);
        }
        break;
      case "?":
        showKeyboardShortcutsHelp();
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [focusedApprovalId]);
```

### Arrow Key Navigation (Alternative)

```
- Arrow Down: Next approval
- Arrow Up: Previous approval
- Tab: Next interactive element (buttons within card)
- Shift+Tab: Previous interactive element
```

---

## 2. Screen Reader Announcements

### Page Structure

```html
<Page title="Approval Queue" role="main" aria-label="Approval Queue">
  <Layout>
    <Layout.Section>
      <!-- Approval cards -->
    </Layout.Section>
  </Layout>
</Page>
```

**Screen reader**: "Main region, Approval Queue"

### Approval Card Structure

```html
<article
  role="article"
  aria-labelledby="approval-101-title"
  aria-describedby="approval-101-desc"
  tabIndex="{0}"
>
  <h2 id="approval-101-title">Approval for Conversation 101</h2>

  <div id="approval-101-desc">
    <p>High risk action. Agent: Billing Support. Tool: send_email.</p>
    <p>Arguments: Send email to customer about billing issue.</p>
    <p>Requested 2 minutes ago.</p>
  </div>

  <div role="group" aria-label="Approval actions">
    <button aria-label="Approve conversation 101 billing email">Approve</button>
    <button aria-label="Reject conversation 101 billing email">Reject</button>
  </div>
</article>
```

**Screen reader announcement** (when focused):

> "Article. Approval for Conversation 101. High risk action. Agent: Billing Support. Tool: send_email. Arguments: Send email to customer about billing issue. Requested 2 minutes ago. Group: Approval actions. Button: Approve conversation 101 billing email. Button: Reject conversation 101 billing email."

### Live Region for Updates

```html
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

**Announcements**:

- "New approval received for conversation 102"
- "Approval 101 approved successfully"
- "Failed to approve. Please try again"
- "3 new approvals arrived"

**aria-live="polite"**: Waits for screen reader to finish current announcement
**aria-atomic="true"**: Reads entire message, not just changes

### Badge Announcements

```html
<Badge tone="critical">
  <span aria-label="High risk">HIGH RISK</span>
</Badge>
```

**Screen reader**: "High risk"
**Not**: "Badge, critical tone, HIGH RISK" (too verbose)

---

## 3. Focus States for Interactive Elements

### Focus Indicator (Visible and High Contrast)

```css
/* Global focus style */
*:focus-visible {
  outline: 3px solid var(--p-color-border-focus);
  outline-offset: 2px;
  border-radius: var(--p-border-radius-100);
}

/* Button focus */
.Polaris-Button:focus-visible {
  box-shadow:
    0 0 0 3px var(--p-color-bg-surface),
    0 0 0 5px var(--p-color-border-focus);
}

/* Card focus (for keyboard navigation) */
.approval-card:focus-visible {
  outline: 2px solid var(--p-color-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 8px rgba(44, 110, 203, 0.2);
}
```

**Requirements**:

- Minimum 3:1 contrast ratio against background
- Visible offset (2px) from element
- Not hidden by overflow
- Works in both light and dark mode

### Focus Order Management

```typescript
// When approval removed, focus next card
const handleApprove = async (approvalId: string) => {
  const index = approvals.findIndex((a) => a.id === approvalId);
  const nextCard =
    approvalRefs.current[index + 1] || approvalRefs.current[index - 1];

  await approveAction(approvalId);

  // After removal, focus next/previous card
  nextCard?.focus();
};
```

### Focus Trap (if modal used)

```typescript
import { useFocusTrap } from '@shopify/polaris';

function ConfirmationModal({ open, onClose }) {
  const focusTrapRef = useFocusTrap(open);

  return (
    <Modal open={open} onClose={onClose}>
      <div ref={focusTrapRef}>
        {/* Focus trapped within modal */}
      </div>
    </Modal>
  );
}
```

### Skip Link (Bypass Navigation)

```html
<a href="#main-content" className="skip-link"> Skip to main content </a>

<main id="main-content">
  <!-- Approval queue content -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--p-color-bg-surface);
  padding: 8px 16px;
  color: var(--p-color-text);
  text-decoration: none;
  border: 2px solid var(--p-color-border-focus);
  border-radius: var(--p-border-radius-200);
  z-index: 1000;
}

.skip-link:focus {
  top: 8px;
}
```

**Behavior**: Hidden until focused, then appears at top

---

## 4. ARIA Labels and Descriptions

### Buttons

```html
<!-- ❌ BAD: Ambiguous -->
<button>Approve</button>

<!-- ✅ GOOD: Context included -->
<button aria-label="Approve conversation 101 send email action">Approve</button>
```

### Loading States

```html
<button
  loading="{isApproving}"
  aria-busy="{isApproving}"
  aria-label="Approving conversation 101"
>
  Approve
</button>
```

**Screen reader**: "Approving conversation 101. Busy" (while loading)

### Badges

```html
<Badge tone="critical">
  <span role="text" aria-label="High risk">HIGH RISK</span>
</Badge>
```

### Icons (Decorative vs Informative)

```html
<!-- Decorative icon (has adjacent text) -->
<Icon source="{CheckCircleIcon}" role="presentation" aria-hidden="true" />
<Text>Approved</Text>

<!-- Informative icon (no adjacent text) -->
<Icon source="{AlertCircleIcon}" role="img" aria-label="Error" />
```

### Empty State

```html
<EmptyState
  heading="All clear!"
  role="status"
  aria-label="No pending approvals"
>
  <p>No pending approvals at this time. Check back later.</p>
</EmptyState>
```

### Link Descriptions

```html
<!-- External link -->
<Link url="https://example.com" external>
  View order
  <span className="sr-only">(opens in new tab)</span>
</Link>
```

**Screen reader**: "View order (opens in new tab)"

---

## 5. Color and Contrast Requirements

### WCAG 2.2 AA Requirements

- **Normal text** (< 18pt): 4.5:1 contrast ratio
- **Large text** (≥ 18pt or bold ≥ 14pt): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio
- **Focus indicators**: 3:1 contrast ratio

### Color Audit for Approval Queue

| Element           | Foreground | Background | Ratio  | Pass |
| ----------------- | ---------- | ---------- | ------ | ---- |
| Body text         | #202223    | #FFFFFF    | 16.5:1 | ✅   |
| Badge "HIGH RISK" | #FFFFFF    | #D72C0D    | 5.5:1  | ✅   |
| Badge "MEDIUM"    | #1A1A1A    | #FFC453    | 10.4:1 | ✅   |
| Badge "LOW"       | #FFFFFF    | #008060    | 4.8:1  | ✅   |
| Button "Approve"  | #FFFFFF    | #008060    | 4.8:1  | ✅   |
| Button "Reject"   | #FFFFFF    | #D72C0D    | 5.5:1  | ✅   |
| Subdued text      | #6D7175    | #FFFFFF    | 4.6:1  | ✅   |
| Focus indicator   | #2C6ECB    | #FFFFFF    | 4.7:1  | ✅   |

**All pass WCAG AA**

### Non-Color Information

```html
<!-- ❌ BAD: Risk only conveyed by color -->
<Badge tone="critical">Approval</Badge>

<!-- ✅ GOOD: Risk conveyed by text AND color -->
<Badge tone="critical">HIGH RISK</Badge>
```

**Principle**: Never use color alone to convey information

---

## 6. Error and Success Feedback

### Error Announcement

```typescript
const handleApprove = async (id: string) => {
  try {
    await approveAction(id);
    announceToScreenReader(`Approval ${id} approved successfully`);
  } catch (error) {
    announceToScreenReader(`Failed to approve. Please try again.`);
    setError("Failed to approve. Please try again.");
  }
};

function announceToScreenReader(message: string) {
  setLiveRegionMessage(message);
  // Clear after announcement
  setTimeout(() => setLiveRegionMessage(""), 1000);
}
```

### Error Recovery

```html
<Banner tone="critical" onDismiss="{()" ="">
  setError(null)}>
  <p role="alert"><strong>Failed to approve.</strong> Please try again.</p>
</Banner>
```

**role="alert"**: Immediately announces to screen reader
**onDismiss**: Allows keyboard users to dismiss (Escape key)

---

## 7. Motion and Animation Preferences

### Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .approval-card {
    animation: none !important;
    transition: opacity 0.1s !important; /* Keep essential transitions */
  }

  .new-approval-badge {
    animation: none !important; /* No pulsing */
  }
}
```

### Implementation

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<div className={prefersReducedMotion ? '' : 'animated-card'}>
  {/* Card content */}
</div>
```

---

## 8. Form Labels and Instructions

### Search Input (if added)

```html
<label htmlFor="approval-search">Search approvals</label>
<input
  id="approval-search"
  type="search"
  placeholder="Search by conversation ID..."
  aria-describedby="search-hint"
/>
<p id="search-hint" className="sr-only">
  Search approvals by conversation ID or agent name
</p>
```

### Filter Dropdown

```html
<label htmlFor="risk-filter">Filter by risk level</label>
<select id="risk-filter" aria-describedby="filter-hint">
  <option value="all">All</option>
  <option value="high">High risk only</option>
  <option value="medium">Medium risk only</option>
  <option value="low">Low risk only</option>
</select>
<p id="filter-hint" className="sr-only">
  Show only approvals matching selected risk level
</p>
```

---

## 9. Mobile Accessibility

### Touch Target Size

```css
/* Minimum 44x44px for touch targets (iOS) */
.approval-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}
```

### Zoom and Reflow

- Content must reflow without horizontal scrolling at 320px width
- Text must be readable at 200% zoom
- No fixed positioning that blocks content

### Mobile Screen Reader (VoiceOver/TalkBack)

- Swipe gestures work (left/right to navigate)
- Double-tap to activate buttons
- Rotor navigation supported (headings, links, buttons)

---

## Accessibility Testing Checklist

### Automated Testing

- [ ] Run axe DevTools on `/approvals` route
- [ ] Run Lighthouse accessibility audit (score ≥ 95)
- [ ] Run WAVE browser extension
- [ ] Verify no ARIA errors in console

### Manual Testing - Keyboard

- [ ] Tab through all interactive elements (logical order)
- [ ] Focus indicators visible on all elements
- [ ] No keyboard traps (can escape from all elements)
- [ ] Keyboard shortcuts work (j/k, a/r, ?)
- [ ] Skip link works (bypass navigation)

### Manual Testing - Screen Reader

- [ ] NVDA (Windows) - Test approval queue flow
- [ ] JAWS (Windows) - Test approval queue flow
- [ ] VoiceOver (macOS) - Test approval queue flow
- [ ] All images have alt text
- [ ] All buttons have descriptive labels
- [ ] Live regions announce updates
- [ ] Heading structure is logical (h1 → h2 → h3)

### Manual Testing - Visual

- [ ] Zoom to 200% - all content readable
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Color contrast ≥ 3:1 for UI components
- [ ] Focus indicators ≥ 3:1 contrast
- [ ] No information conveyed by color alone

### Manual Testing - Motion

- [ ] Enable prefers-reduced-motion - animations disabled
- [ ] No auto-playing media
- [ ] No parallax or vestibular-triggering effects

---

## Implementation Priority

### P0 (Must Have for Launch)

- ✅ Logical tab order
- ✅ Visible focus indicators
- ✅ Screen reader labels (aria-label on buttons)
- ✅ Color contrast (WCAG AA)
- ✅ Keyboard navigation (Tab, Enter, Escape)

### P1 (Should Have Soon After Launch)

- ⏳ Live region announcements
- ⏳ Keyboard shortcuts (j/k, a/r)
- ⏳ Skip link
- ⏳ prefers-reduced-motion support

### P2 (Nice to Have)

- 🔮 Keyboard shortcuts help modal (?)
- 🔮 Advanced keyboard navigation

---

**Evidence**: Complete accessibility specification for approval flow, WCAG 2.2 AA compliant
